import { test, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';

let db;
const user = '00000000-0000-4000-8000-000000000001';
const other = '00000000-0000-4000-8000-000000000002';
const machine = '00000000-0000-4000-8000-000000000003';
const boot = '00000000-0000-4000-8000-000000000004';
const reboot = '00000000-0000-4000-8000-000000000005';
const migration = await readFile(new URL('../../supabase/migration-session-accounting.sql', import.meta.url), 'utf8');
const scalar = async sql => (await db.query(sql)).rows[0];
const start = async (instance = boot, who = user, resumeOnly = false) => (await scalar(`select public.start_agent_session('${machine}','${who}','${instance}',${resumeOnly}) as result`)).result;
const end = async id => db.query(`select public.end_session('${id}', 'user')`);
const wallet = async () => (await scalar(`select credits_minutes from public.profiles where id='${user}'`)).credits_minutes;

beforeEach(async () => {
  db = new PGlite();
  await db.exec(`
    create role anon; create role authenticated; create role service_role;
    create schema auth;
    create function auth.role() returns text language sql as $$ select coalesce(current_setting('test.role',true),'service_role') $$;
    create function auth.uid() returns uuid language sql as $$ select nullif(current_setting('test.uid',true),'')::uuid $$;
    create table profiles(id uuid primary key, nickname text, role text default 'user', banned boolean default false, credits_minutes integer not null);
    create table machines(id uuid primary key, name text, status text);
    create table sessions(id uuid primary key default gen_random_uuid(), machine_id uuid, user_id uuid, started_at timestamptz, ends_at timestamptz,
      credits_at_start integer, credits_used integer default 0, status text default 'active', ended_by text, ended_at timestamptz);
    create table transactions(id uuid default gen_random_uuid(), user_id uuid, type text, amount integer, description text, related_id uuid, related_type text);
    create table credit_balances(id uuid default gen_random_uuid(), user_id uuid, amount integer, expires_at timestamptz);
    create table machine_pins(id uuid default gen_random_uuid(), user_id uuid, machine_id uuid, pin text, used boolean default false, expires_at timestamptz, used_at timestamptz);
    insert into profiles(id,nickname,credits_minutes) values('${user}','Cliente',240),('${other}','Outro',240);
    insert into machines values('${machine}','Wolf 09','free');
  `);
  await db.exec(migration);
});
afterEach(async () => { await db.close(); });

test('full wallet is used instead of resetting the counter to a four-hour cap', async () => {
  await db.query(`update profiles set credits_minutes=3586 where id='${user}'`);
  const result = await start();
  assert.equal(result.error, undefined);
  const row = await scalar(`select extract(epoch from (ends_at-started_at))/60 as allocated from sessions where id='${result.session_id}'`);
  assert.ok(Math.abs(Number(row.allocated) - 3586) < 0.01);
});

test('12m30s consumes 13 minutes, frees the machine, and the next login gets 227 minutes', async () => {
  const first = await start();
  await db.query(`update sessions set started_at=clock_timestamp()-interval '12 minutes 30 seconds' where id='${first.session_id}'`);
  await end(first.session_id);
  assert.equal(await wallet(), 227);
  assert.equal((await scalar(`select status from machines where id='${machine}'`)).status, 'free');
  const second = await start();
  assert.notEqual(first.session_id, second.session_id);
  assert.equal((await scalar(`select credits_at_start from sessions where id='${second.session_id}'`)).credits_at_start, 227);
});

test('retrying an end request never charges twice or frees a later session', async () => {
  const first = await start();
  await db.query(`update sessions set started_at=clock_timestamp()-interval '12 minutes 30 seconds' where id='${first.session_id}'`);
  await end(first.session_id);
  await start();
  await end(first.session_id);
  assert.equal(await wallet(), 227);
  assert.equal((await scalar('select count(*)::integer as n from transactions')).n, 1);
  assert.equal((await scalar(`select status from machines where id='${machine}'`)).status, 'busy');
});

test('reboot settles only to the last heartbeat and preserves the remaining wallet', async () => {
  const first = await start();
  await db.query(`update sessions set started_at=clock_timestamp()-interval '2 hours', agent_heartbeat_at=clock_timestamp()-interval '1 hour 47 minutes 30 seconds' where id='${first.session_id}'`);
  const second = await start(reboot);
  assert.equal(second.error, undefined);
  assert.equal(await wallet(), 227);
  assert.equal((await scalar(`select credits_used from sessions where id='${first.session_id}'`)).credits_used, 13);
});

test('the stale-session sweep settles lost power without billing the offline hour', async () => {
  const first = await start();
  await db.query(`update sessions set started_at=clock_timestamp()-interval '2 hours', agent_heartbeat_at=clock_timestamp()-interval '1 hour 47 minutes 30 seconds' where id='${first.session_id}'`);
  await db.query('select settle_disconnected_sessions()');
  await db.query('select settle_disconnected_sessions()');
  assert.equal(await wallet(), 227);
  assert.equal((await scalar('select count(*)::integer as n from transactions')).n, 1);
});

test('the same agent retries login without creating or extending a session', async () => {
  const first = await start();
  const second = await start();
  assert.equal(second.session_id, first.session_id);
  assert.equal(second.ends_at, first.ends_at);
  assert.equal(second.resumed, true);
  assert.equal((await scalar('select count(*)::integer as n from sessions')).n, 1);
});

test('another user cannot displace the active session', async () => {
  const first = await start();
  assert.match((await start(reboot, other)).error, /outro usuário/);
  assert.equal((await scalar(`select status from sessions where id='${first.session_id}'`)).status, 'active');
  assert.equal(await wallet(), 240);
});

test('resume-only checks never create or settle sessions', async () => {
  assert.ok((await start(boot, user, true)).error);
  const first = await start();
  assert.ok((await start(reboot, user, true)).error);
  assert.equal(await wallet(), 240);
  assert.equal((await scalar(`select status from sessions where id='${first.session_id}'`)).status, 'active');
});

test('a mismatched heartbeat cannot keep another instance alive', async () => {
  const first = await start();
  const response = await scalar(`select agent_session_heartbeat('${first.session_id}','${machine}','${reboot}') as result`);
  assert.ok(response.result.error);
  assert.equal((await scalar(`select status from sessions where id='${first.session_id}'`)).status, 'active');
});

test('legacy sessions are not retroactively billed or silently reset', async () => {
  await db.query(`insert into sessions(machine_id,user_id,started_at,ends_at,credits_at_start) values('${machine}','${user}',clock_timestamp()-interval '2 hours',clock_timestamp()+interval '2 hours',240)`);
  await db.query(`update machines set status='busy' where id='${machine}'`);
  assert.match((await start()).error, /versão anterior/);
  assert.equal(await wallet(), 240);
  assert.equal((await scalar('select count(*)::integer as n from transactions')).n, 0);
});

test('the credit buckets and profile balance are debited together', async () => {
  await db.query(`insert into credit_balances(user_id,amount) values('${user}',240)`);
  const first = await start();
  await db.query(`update sessions set started_at=clock_timestamp()-interval '12 minutes 30 seconds' where id='${first.session_id}'`);
  await end(first.session_id);
  assert.equal(await wallet(), 227);
  assert.equal((await scalar(`select amount from credit_balances where user_id='${user}'`)).amount, 227);
});

test('a stale sweep snapshot cannot end a freshly confirmed session', async () => {
  const first = await start();
  await db.query(`select settle_session_internal('${first.session_id}','system',clock_timestamp()-interval '1 minute')`);
  assert.equal((await scalar(`select status from sessions where id='${first.session_id}'`)).status, 'active');
  assert.equal(await wallet(), 240);
});

test('PIN login uses the full wallet and consumes the PIN only on success', async () => {
  await db.query(`update profiles set credits_minutes=600 where id='${user}'`);
  await db.query(`insert into machine_pins(user_id,machine_id,pin,expires_at) values('${user}','${machine}','123456',clock_timestamp()+interval '5 minutes')`);
  const response = (await scalar(`select validate_pin_and_start_agent('123456','${machine}','${boot}') as result`)).result;
  assert.equal(response.error, undefined);
  assert.equal((await scalar(`select credits_at_start from sessions where id='${response.session_id}'`)).credits_at_start, 600);
  assert.equal((await scalar("select used from machine_pins where pin='123456'")).used, true);
});

test('operator sessions attach to the agent without extending the operator time limit', async () => {
  const first = (await scalar(`select start_session('${machine}','${user}',30) as id`)).id;
  const response = (await scalar(`select attach_agent_session('${first}','${machine}','${boot}') as result`)).result;
  assert.equal(response.active, true);
  const allocated = Number((await scalar(`select extract(epoch from (ends_at-started_at))/60 as n from sessions where id='${first}'`)).n);
  assert.ok(Math.abs(allocated-30) < 0.01);
});

test('normal users cannot call the internal settlement or scheduled-cleanup RPC', async () => {
  await db.query('set role authenticated');
  await assert.rejects(db.query('select settle_disconnected_sessions()'), /permission denied/);
  await db.query('reset role');
});

test('an authenticated user cannot end another user session directly through SQL RPC', async () => {
  const first = await start();
  await db.query(`select set_config('test.role','authenticated',false),set_config('test.uid','${other}',false)`);
  await assert.rejects(end(first.session_id), /Acesso negado/);
  assert.equal(await wallet(), 240);
});
