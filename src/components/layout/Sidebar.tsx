"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { LayoutDashboard, Wallet, Settings, LogOut, Package, CreditCard, FolderKanban } from "lucide-react";
import { fetchApi } from "@/lib/api";

export function Sidebar({ isOpen }: { isOpen: boolean }) {
  const pathname = usePathname();
  const router = useRouter();

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Kas Buku Besar", href: "/dashboard/kas", icon: Wallet },
    { name: "Hutang", href: "/dashboard/hutang", icon: CreditCard },
    { name: "Projects", href: "/dashboard/projects", icon: FolderKanban },
    { name: "Settings", href: "/dashboard/settings", icon: Settings },
  ];

  const handleLogout = async () => {
    try {
      await fetchApi('/logout', { method: 'POST' });
    } catch (e) {
      console.error('Logout error', e);
    } finally {
      router.push('/login');
    }
  };

  return (
    <aside 
      className={`bg-sidebar text-sidebar-foreground min-h-screen flex flex-col border-border/10 fixed md:sticky top-0 z-20 transition-all duration-300 ease-in-out whitespace-nowrap overflow-hidden
        ${isOpen ? "w-64 border-r translate-x-0" : "w-0 border-r-0 -translate-x-full md:translate-x-0 opacity-0 md:opacity-100"}
      `}
    >
      <div className="h-16 flex items-center px-6 border-b border-border/10">
        <div className="flex items-center gap-2 text-xl font-bold tracking-tight text-white">
          <Package className="w-6 h-6 text-brand" />
          <span>Cakra Prima</span>
        </div>
      </div>
      
      <nav className="flex-1 px-4 py-6 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                isActive
                  ? "bg-sidebar-active text-sidebar-active-foreground font-medium shadow-sm"
                  : "text-sidebar-foreground/80 hover:bg-sidebar-hover hover:text-white"
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border/10">
        <button 
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg w-full text-sidebar-foreground/80 hover:bg-sidebar-hover hover:text-red-400 transition-all duration-200"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>
    </aside>
  );
}
