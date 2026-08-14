"use client";

import {
  BookHeart,
  CalendarDays,
  GitBranch,
  Heart,
  Menu,
  Settings,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navigation = [
  { href: "/family/demo/tree", label: "Drzewo", icon: GitBranch },
  { href: "/family/demo/calendar", label: "Kalendarz", icon: CalendarDays },
  { href: "/family/demo/memories", label: "Wspomnienia", icon: BookHeart },
  { href: "/family/demo/settings", label: "Ustawienia", icon: Settings },
];

export function AppNavigation() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      <aside className="hidden min-h-screen w-64 shrink-0 flex-col bg-sidebar px-5 py-6 text-sidebar-foreground lg:flex">
        <Link href="/" className="flex items-center gap-3 px-2">
          <span className="grid size-10 place-items-center rounded-2xl bg-sidebar-primary text-sidebar-primary-foreground">
            <Heart className="size-5 fill-current" />
          </span>
          <span className="text-lg font-semibold">FamilyTree</span>
        </Link>
        <div className="mt-10 rounded-2xl bg-sidebar-accent/70 p-4">
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-full bg-sidebar-primary text-lg">
              🌿
            </div>
            <div>
              <p className="text-xs text-sidebar-foreground/65">
                Aktywna rodzina
              </p>
              <p className="font-medium">Kowalscy</p>
            </div>
          </div>
          <button
            type="button"
            className="mt-3 text-xs text-sidebar-foreground/65 transition hover:text-sidebar-foreground"
          >
            Przełącz rodzinę
          </button>
        </div>
        <nav className="mt-8 space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition",
                  active
                    ? "bg-sidebar-primary font-medium text-sidebar-primary-foreground"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground",
                )}
              >
                <Icon className="size-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto border-t border-sidebar-border pt-5">
          <div className="flex items-center gap-3 px-2">
            <div className="grid size-9 place-items-center rounded-full bg-sidebar-primary/20 text-sm">
              AK
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">Anna Kowalska</p>
              <p className="text-xs text-sidebar-foreground/60">
                Członek rodziny
              </p>
            </div>
          </div>
        </div>
      </aside>
      <header className="flex items-center justify-between border-b border-border bg-background/85 px-4 py-4 backdrop-blur lg:hidden">
        <Link
          href="/"
          className="flex items-center gap-2 font-semibold text-primary"
        >
          <span className="grid size-8 place-items-center rounded-xl bg-primary text-primary-foreground">
            <Heart className="size-4 fill-current" />
          </span>
          FamilyTree
        </Link>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setOpen((value) => !value)}
          aria-label={open ? "Zamknij menu" : "Otwórz menu"}
        >
          {open ? <X /> : <Menu />}
        </Button>
      </header>
      {open && (
        <nav className="border-b border-border bg-card px-4 py-3 lg:hidden">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-muted-foreground hover:bg-secondary hover:text-primary"
              >
                <Icon className="size-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      )}
    </>
  );
}

export function FamilyShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen lg:flex">
      <AppNavigation />
      <main className="min-w-0 flex-1">{children}</main>
    </div>
  );
}
