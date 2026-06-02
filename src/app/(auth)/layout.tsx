import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Usuário já logado não deve ver telas de auth
  if (user) {
    const { data: profile } = await supabase
      .from("profiles").select("role").eq("id", user.id).single();
    if (profile?.role === "admin" || profile?.role === "staff") {
      redirect("/admin");
    }
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-wolf-bg bg-grid flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md flex flex-col items-center gap-8">
        <Link href="/" className="flex flex-col items-center gap-2 group">
          <Image
            src="/images/logo-dark-bg.jpg"
            alt="Arena Wolf"
            width={120}
            height={120}
            className="rounded-2xl group-hover:scale-105 transition-transform duration-300"
            priority
          />
        </Link>
        <div className="w-full glass rounded-2xl p-8 shadow-2xl shadow-wolf-blue/5">
          {children}
        </div>
        <p className="text-xs text-wolf-muted text-center">
          Arena Wolf © {new Date().getFullYear()} · Av. Ivaí, 1178 · Dom Bosco · BH/MG
        </p>
      </div>
    </div>
  );
}
