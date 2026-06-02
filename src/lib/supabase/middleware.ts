import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || supabaseUrl === "your_supabase_project_url" || !supabaseKey) {
    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  // IMPORTANTE: apenas renova a sessão (refresh do token) e retorna a
  // resposta com os cookies atualizados. NÃO fazemos redirects aqui, pois
  // NextResponse.redirect descarta os cookies renovados pelo Supabase,
  // causando loop infinito de redirecionamento (replaceState 100x).
  //
  // Toda a proteção de rota e verificação de role é feita nos Server
  // Components / layouts:
  //   - (user)/layout.tsx  → redireciona para /login se não logado
  //   - admin/layout.tsx   → redireciona para /login (sem user) ou /dashboard (sem role)
  //   - dashboard/page.tsx → redireciona admin/staff para /admin
  await supabase.auth.getUser();

  return supabaseResponse;
}
