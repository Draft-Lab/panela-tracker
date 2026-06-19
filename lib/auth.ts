"use server";

import { createClient } from "@/lib/supabase/server";
import { isAdmin as checkIsAdmin } from "@/lib/supabase/auth-helpers";

export async function login(email: string, password: string) {
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password,
  });

  if (error) {
    return { success: false, error: "Email ou senha incorretos" };
  }

  const admin = await checkIsAdmin();

  if (!admin) {
    await supabase.auth.signOut();
    return {
      success: false,
      error: "Conta sem permissão de administrador",
    };
  }

  return { success: true };
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
}

export async function isAuthenticated() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return !!user;
}

export { checkIsAdmin as isAdmin };
