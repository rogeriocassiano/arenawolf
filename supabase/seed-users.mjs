// Script para criar usuários de teste
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error("Defina NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no ambiente");
  process.exit(1);
}

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
