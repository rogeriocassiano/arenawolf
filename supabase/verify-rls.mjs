import { createClient } from "@supabase/supabase-js";

const URL = "https://uxxuspwortgwqaftcfrw.supabase.co";
const ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV4eHVzcHdvcnRnd3FhZnRjZnJ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAzMTUyMTEsImV4cCI6MjA5NTg5MTIxMX0.pQwg5jPin05y_RZMQkOj76bhhhi6epu960gm5WSzaLs";

// Login como admin e tenta ler o próprio profile (testa recursão RLS)
const supabase = createClient(URL, ANON, { auth: { persistSession: false } });

const { data: signIn, error: signErr } = await supabase.auth.signInWithPassword({
  email: "luan@arenawolf.com",
  password: "12345678",
});

if (signErr) {
  console.error("❌ Erro no login:", signErr.message);
  process.exit(1);
}
console.log("✅ Login OK, user:", signIn.user.id);

// Esta query falhava com recursão infinita antes do fix
const { data: profile, error: profErr } = await supabase
  .from("profiles")
  .select("role, nickname")
  .eq("id", signIn.user.id)
  .single();

if (profErr) {
  console.error("❌ Query de profile FALHOU:", profErr.message, profErr.code);
  console.error("   → A recursão RLS ainda existe!");
  process.exit(1);
}

console.log("✅ Profile lido com sucesso!");
console.log("   role:", profile.role, "| nickname:", profile.nickname);
console.log("\n🎉 Recursão RLS corrigida! O login vai funcionar agora.");
