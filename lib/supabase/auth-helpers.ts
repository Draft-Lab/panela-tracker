import { createClient } from "@/lib/supabase/server";

export async function getAuthenticatedUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
}

export async function isAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return false;
  }

  const { data, error } = await supabase.rpc("is_admin");

  if (error) {
    console.error("[auth] is_admin RPC failed:", error.message);
    return false;
  }

  return data === true;
}
