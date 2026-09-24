"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import logoImg from "@/app/icon.png";
import { LayoutDashboard, Wallet, Settings, LogOut, Package, CreditCard, FolderKanban, X, Warehouse, Scale, PiggyBank, ArrowLeftRight } from "lucide-react";
import { fetchApi, clearToken } from "@/lib/api";

export function Sidebar({ isOpen, toggleSidebar }: { isOpen: boolean; toggleSidebar: () => void }) {
  const pathname = usePathname();
  const router = useRouter();

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Kas Buku Besar", href: "/dashboard/kas", icon: Wallet },
    { name: "Hutang", href: "/dashboard/hutang", icon: CreditCard },
    { name: "Projects", href: "/dashboard/projects", icon: FolderKanban },
    { name: "Sumber Modal", href: "/dashboard/fund-sources", icon: PiggyBank },
    { name: "Mutasi Modal", href: "/dashboard/fund-movements", icon: ArrowLeftRight },
    { name: "Persediaan Material", href: "/dashboard/inventory", icon: Warehouse },
    { name: "Master Barang", href: "/dashboard/inventory/items", icon: Package },
    { name: "Master Satuan", href: "/dashboard/inventory/units", icon: Scale },
    { name: "Settings", href: "/dashboard/settings", icon: Settings },
  ];

  const handleLogout = async () => {
    try {
      await fetchApi('/logout', { method: 'POST' });
    } catch (e) {
      console.error('Logout error', e);
    } finally {
      clearToken(); // Hapus token dari cookie & localStorage
      router.push('/login');
    }
  };

  return (
    <aside 
      className={`bg-sidebar text-sidebar-foreground min-h-screen flex flex-col border-border/10 fixed md:sticky top-0 z-20 transition-all duration-300 ease-in-out whitespace-nowrap overflow-hidden
        ${isOpen ? "w-64 border-r translate-x-0" : "w-0 border-r-0 -translate-x-full md:translate-x-0 opacity-0 md:opacity-100"}
      `}
    >
      <div className="h-16 flex items-center justify-between px-6 border-b border-border/10">
        <div className="flex items-center gap-2 text-xl font-bold tracking-tight text-white">
          <div className="w-7 h-7 bg-white rounded-full flex items-center justify-center border-2 border-white shadow-sm overflow-hidden shrink-0">
            <Image src={logoImg} alt="Logo" className="w-full h-full object-contain" />
          </div>
          <span>Cakra Prima</span>
        </div>
        <button 
          onClick={toggleSidebar} 
          className="md:hidden text-muted-foreground hover:text-white transition-colors focus:outline-none"
        >
          <X className="w-5 h-5" />
        </button>
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
