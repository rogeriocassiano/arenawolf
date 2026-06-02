import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminSidebar } from "@/components/layout/AdminSidebar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, nickname")
    .eq("id", user.id)
    .single();

  if (!profile || (profile.role !== "admin" && profile.role !== "staff")) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-wolf-bg bg-grid flex">
      <aside className="hidden lg:flex w-56 fixed top-0 bottom-0 left-0 flex-col bg-wolf-surface border-r border-wolf-blue/15 overflow-y-auto">
        <AdminSidebar />
      </aside>
      <main className="flex-1 lg:ml-56 min-h-screen p-5 lg:p-6">
        {children}
      </main>
    </div>
  );
}
