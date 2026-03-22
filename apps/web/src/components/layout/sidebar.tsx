"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  ListMusic,
  History,
  BarChart3,
  Settings,
  Sparkles,
} from "lucide-react";

const navItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Generate Playlist",
    href: "/dashboard/generate",
    icon: Sparkles,
  },
  {
    label: "Playlist History",
    href: "/dashboard/history",
    icon: History,
  },
  {
    label: "Taste Profile",
    href: "/dashboard/taste",
    icon: BarChart3,
  },
  {
    label: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-card border-r border-border flex flex-col z-50">
      {/* Logo */}
      <div className="flex items-center gap-2 px-6 py-5 border-b border-border">
        <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center">
          <span className="text-black font-bold text-sm">M</span>
        </div>
        <span className="text-xl font-bold text-foreground">MUSAI</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                isActive
                  ? "bg-emerald-600/15 text-emerald-500 border border-emerald-800/30"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              )}
            >
              <Icon className="w-4 h-4" />
              {item.label}
              {item.label === "Generate Playlist" && (
                <span className="ml-auto w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* User section */}
      <div className="border-t border-border px-4 py-4">
        <div className="flex items-center gap-3">
          <UserButton
            appearance={{
              elements: {
                avatarBox: "w-8 h-8",
              },
            }}
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm text-foreground font-medium truncate">
              My Account
            </p>
            <p className="text-xs text-muted-foreground">Manage profile</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
