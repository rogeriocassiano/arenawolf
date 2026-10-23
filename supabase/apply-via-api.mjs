// Aplica schema + migrations via Management API (sem db password)
// Executar: SUPABASE_ACCESS_TOKEN=xxx node supabase/apply-via-api.mjs
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const TOKEN = process.env.SUPABASE_ACCESS_TOKEN;
const REF = "wuobcpjzprvbmogvqiqq";

if (!TOKEN) { console.error("SUPABASE_ACCESS_TOKEN não definido"); process.exit(1); }

const files = [
  "schema.sql",
  "fix-rls.sql",           // helpers is_staff()/is_admin() exigidos pelas policies do v2
  "migration-v2.sql",
  "migration-v3.sql",
  "migration-v4.sql",
  "migration-complete.sql", // v5+v6+v7+v8 consolidado
];

// Torna CREATE POLICY / CREATE TRIGGER / CREATE INDEX idempotentes
function idempotentize(sql) {
  return sql
    .replace(/CREATE POLICY ("[^"]+") ON (public\.\w+)/gi, 'DROP POLICY IF EXISTS $1 ON $2;\nCREATE POLICY $1 ON $2')
    .replace(/CREATE TRIGGER (\w+)/gi, 'DROP TRIGGER IF EXISTS $1 ON PLACEHOLDER;\nCREATE TRIGGER $1')
    .replace(/DROP TRIGGER IF EXISTS (\w+) ON PLACEHOLDER;\n(CREATE TRIGGER \1 (?:\w+ )?(?:\w+ )?ON public\.\w+)/g, (m, n, rest) => {
      const table = rest.match(/ON (public\.\w+)/)[1];
      return `DROP TRIGGER IF EXISTS ${n} ON ${table};\n${rest}`;
    })
    .replace(/CREATE INDEX (?!IF NOT EXISTS)/gi, "CREATE INDEX IF NOT EXISTS ")
    .replace(/^ALTER PUBLICATION (\w+) ADD TABLE (?:public\.)?(\w+);$/gim,
      (_m, pub, tbl) => `DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = '${pub}' AND tablename = '${tbl}') THEN ALTER PUBLICATION ${pub} ADD TABLE public.${tbl}; END IF; END $$;`);
}

for (const file of files) {
  const sql = idempotentize(readFileSync(join(__dirname, file), "utf8"));
  process.stdout.write(`Aplicando ${file}... `);
  const res = await fetch(`https://api.supabase.com/v1/projects/${REF}/database/query`, {
    method: "POST",
    headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify({ query: sql }),
  });
  const body = await res.text();
  if (!res.ok) {
    console.log(`❌ HTTP ${res.status}\n${body.slice(0, 500)}`);
    process.exit(1);
  }
  console.log("✅");
}
console.log("\nSchema aplicado com sucesso.");
