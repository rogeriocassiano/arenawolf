// Script para criar usuários de teste
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://uxxuspwortgwqaftcfrw.supabase.co";
const SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV4eHVzcHdvcnRnd3FhZnRjZnJ3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDMxNTIxMSwiZXhwIjoyMDk1ODkxMjExfQ.t13Xs7ubgetglNlzLF3dwmKr2-AL-xXSy3QPzzHuHQs";

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function createUser(email, password, nickname, role) {
  console.log(`\n🔄 Criando ${role}: ${email}...`);

  // Cria o usuário no Auth (com email já confirmado)
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { nickname },
  });

  if (error) {
    if (error.message.includes("already been registered")) {
      console.log(`⚠️  Usuário já existe: ${email}`);
      // Busca o usuário existente
      const { data: list } = await supabase.auth.admin.listUsers();
      const existing = list?.users?.find(u => u.email === email);
      if (existing) {
        await supabase.from("profiles").update({ role, nickname }).eq("id", existing.id);
        console.log(`✅ Role atualizado para '${role}'`);
      }
      return;
    }
    console.error(`❌ Erro: ${error.message}`);
    return;
  }

  const userId = data.user.id;
  console.log(`✅ Auth criado: ${userId}`);

  // Upsert no profile com o role correto
  const { error: profileError } = await supabase.from("profiles").upsert({
    id: userId,
    nickname,
    role,
    credits_minutes: role === "admin" ? 0 : 120,
  });

  if (profileError) {
    console.error(`❌ Erro no profile: ${profileError.message}`);
  } else {
    console.log(`✅ Profile criado com role='${role}' e nickname='${nickname}'`);
  }
}

// Cria Admin
await createUser("luan@arenawolf.com", "12345678", "Luan", "admin");

// Cria Usuário
await createUser("user@user.com", "12345678", "WolfUser", "user");

console.log("\n🐺 Pronto! Usuários criados:");
console.log("  👑 Admin:   luan@arenawolf.com  / 12345678");
console.log("  👤 Usuário: user@user.com       / 12345678");
