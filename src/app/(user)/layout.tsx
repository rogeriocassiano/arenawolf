import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { Profile } from "@/lib/types";

export default async function UserLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) redirect("/login");

  const fullProfile: Profile = {
    ...profile,
    email: user.email,
  };

  return (
    <div className="min-h-screen bg-wolf-bg bg-grid">
      <Navbar profile={fullProfile} />
      <div className="flex pt-16">
        <aside className="hidden lg:flex w-60 fixed top-16 bottom-0 left-0 flex-col bg-wolf-surface border-r border-wolf-blue/15 overflow-y-auto">
          <Sidebar />
        </aside>
        <main className="flex-1 lg:ml-60 min-h-[calc(100vh-4rem)] p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
