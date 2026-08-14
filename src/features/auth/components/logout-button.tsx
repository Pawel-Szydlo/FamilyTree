"use client";

import { LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export function LogoutButton() {
  async function handleLogout() {
    await createClient().auth.signOut();
    window.location.assign("/login");
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left text-xs text-sidebar-foreground/65 transition hover:bg-sidebar-accent hover:text-sidebar-foreground"
    >
      <LogOut className="size-4" />
      Wyloguj się
    </button>
  );
}
