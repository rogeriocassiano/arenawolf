import { createHmac, timingSafeEqual } from "node:crypto";

function signature(machineId: string, expires: number, secret: string): Buffer {
  return createHmac("sha256", secret).update(`arena-wolf/update/v1/${machineId.toLowerCase()}/${expires}`).digest();
}

export function issueAgentUpdateToken(machineId: string, secret = process.env.SUPABASE_SERVICE_ROLE_KEY, now = Math.floor(Date.now() / 1000)): string | undefined {
  if (!secret) return undefined;
  const expires = now + 90 * 86400;
  return `v1.${expires}.${signature(machineId, expires, secret).toString("hex")}`;
}

export function verifyAgentUpdateToken(token: string, machineId: string, secret = process.env.SUPABASE_SERVICE_ROLE_KEY, now = Math.floor(Date.now() / 1000)): boolean {
  if (!secret) return false;
  const match = /^v1\.(\d{1,13})\.([a-f0-9]{64})$/.exec(token);
  if (!match) return false;
  const expires = Number(match[1]);
  return expires > now && timingSafeEqual(signature(machineId, expires, secret), Buffer.from(match[2], "hex"));
}
