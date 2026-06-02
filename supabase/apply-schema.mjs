// Script para aplicar o schema via Supabase usando pg diretamente
// Executar: node supabase/apply-schema.mjs

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));

const SUPABASE_URL = "https://uxxuspwortgwqaftcfrw.supabase.co";
const SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV4eHVzcHdvcnRnd3FhZnRjZnJ3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDMxNTIxMSwiZXhwIjoyMDk1ODkxMjExfQ.t13Xs7ubgetglNlzLF3dwmKr2-AL-xXSy3QPzzHuHQs";

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

// Verifica conexão
const { data, error } = await supabase.from("machines").select("count").limit(1);
if (error && error.code !== "PGRST116" && !error.message.includes("does not exist")) {
  console.error("❌ Erro de conexão:", error);
  process.exit(1);
}

console.log("✅ Conectado ao Supabase!");
console.log("📋 Para aplicar o schema, copie e cole o conteúdo de supabase/schema.sql no SQL Editor:");
console.log("🔗 https://supabase.com/dashboard/project/uxxuspwortgwqaftcfrw/sql/new");
console.log("");

// Verifica se as tabelas já existem
const tables = ["profiles", "machines", "reservations", "transactions", "products", "events", "support_tickets"];
console.log("📊 Status das tabelas:");
for (const table of tables) {
  const { error: e } = await supabase.from(table).select("count").limit(1);
  const exists = !e || !e.message.includes("does not exist");
  console.log(`  ${exists ? "✅" : "❌"} ${table}`);
}
