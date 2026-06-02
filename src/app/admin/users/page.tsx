import { createAdminClient } from "@/lib/supabase/server";
import { AdminUsersClient } from "./AdminUsersClient";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const supabase = await createAdminClient();

  const [profilesRes, authRes] = await Promise.all([
    supabase.from("profiles").select("*").order("created_at", { ascending: false }),
    supabase.auth.admin.listUsers({ perPage: 1000 }),
  ]);

  const profiles = profilesRes.data ?? [];
  const authUsers = (authRes.data?.users ?? []).map(u => ({
    id: u.id,
    email: u.email ?? "",
    last_sign_in_at: u.last_sign_in_at,
  }));

  return <AdminUsersClient users={profiles} authUsers={authUsers} />;
}
