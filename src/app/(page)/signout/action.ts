"use server";

import { signOut } from "@/src/services/auth";

export async function signOutAction() {
  await signOut({ redirectTo: "/login-prompt" });
}
