import "server-only";
import { redirect } from "next/navigation";
import { createSupabaseServer } from "./supabase/server";

/**
 * Call at the top of every admin page and admin server action.
 * Redirects to the login page unless the visitor is a logged-in admin.
 */
export async function requireAdmin() {
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const { data: admin } = await supabase.from("admins").select("user_id").eq("user_id", user.id).maybeSingle();
  if (!admin) redirect("/admin/login?denied=1");

  return { supabase, user };
}
