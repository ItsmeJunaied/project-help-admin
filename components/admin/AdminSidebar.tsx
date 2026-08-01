"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Mail, Newspaper, Briefcase, Settings, LogOut } from "lucide-react";

const links = [
  { href: "/", label: "Overview", icon: LayoutDashboard },
  { href: "/leads", label: "Leads", icon: Mail },
  { href: "/applications", label: "Applications", icon: Briefcase },
  { href: "/blog", label: "Blog Posts", icon: Newspaper },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <aside className="flex w-full shrink-0 flex-col border-line/10 bg-surface p-4 sm:w-56 sm:border-r sm:p-6">
      <p className="px-2 text-sm font-bold tracking-tight text-heading">Project Help Admin</p>

      <nav className="mt-8 flex flex-1 flex-col gap-1">
        {links.map((link) => {
          const isActive = pathname === link.href;
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive ? "bg-primary/10 text-accent" : "text-body hover:bg-surface-2 hover:text-heading"
              }`}
            >
              <Icon aria-hidden size={18} />
              {link.label}
            </Link>
          );
        })}
      </nav>

      <button
        type="button"
        onClick={handleLogout}
        className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-body transition-colors hover:bg-surface-2 hover:text-heading"
      >
        <LogOut aria-hidden size={18} />
        Log out
      </button>
    </aside>
  );
}
