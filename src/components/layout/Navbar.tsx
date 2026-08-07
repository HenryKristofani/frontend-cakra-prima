"use client";

import { Bell, Search, UserCircle, Menu, Calendar } from "lucide-react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";

export function Navbar({ toggleSidebar }: { toggleSidebar: () => void }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const now = new Date();
  const defaultYear = String(now.getFullYear());
  const defaultMonth = String(now.getMonth() + 1);

  // Only default to current period when on Kas pages (global header used elsewhere)
  const isKasPage = pathname.includes("/kas");

  const currentYear = searchParams.get("year") ?? "all";
  const currentMonth = searchParams.get("month") ?? "all";

  const [todayDate, setTodayDate] = useState("");

  useEffect(() => {
    setTodayDate(
      new Date().toLocaleDateString("id-ID", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    );
  }, []);

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams.toString());
    const val = e.target.value;
    if (val === "all") {
      params.delete("year");
    } else {
      params.set("year", val);
    }
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams.toString());
    const val = e.target.value;
    if (val === "all") {
      params.delete("month");
    } else {
      params.set("month", val);
    }
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  // Ref to ensure we only initialize defaults once per mounted Navbar
  const initializedRef = useRef(false);

  // If we're on a Kas page and the URL doesn't contain year/month, set them to current
  useEffect(() => {
    if (!isKasPage) return;
    if (initializedRef.current) return;

    const params = new URLSearchParams(searchParams.toString());
    let changed = false;
    if (!params.has("year")) {
      params.set("year", defaultYear);
      changed = true;
    }
    if (!params.has("month")) {
      params.set("month", defaultMonth);
      changed = true;
    }

    if (changed) {
      // Replace to avoid polluting browsing history
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    }

    initializedRef.current = true;
  }, [isKasPage, pathname, searchParams, router, defaultYear, defaultMonth]);

  return (
    <header className="h-16 bg-background/80 backdrop-blur-md border-b border-border flex items-center justify-between px-6 sticky top-0 z-10">
      <div className="flex items-center flex-1 gap-4">
        <button 
          onClick={toggleSidebar}
          className="p-2 -ml-2 text-muted-foreground hover:bg-muted rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-brand/50"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="relative w-full max-w-sm hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search..."
            className="w-full bg-muted border-none rounded-full pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/50 transition-all text-foreground"
          />
        </div>
        
        <div className="hidden lg:flex items-center gap-2">
          <select 
            value={currentYear}
            onChange={handleYearChange}
            className="bg-muted border-none rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-brand/50 cursor-pointer outline-none hover:bg-muted/80 transition-colors appearance-none pr-8 relative bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2364748b%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[length:16px_16px] bg-[right_8px_center] bg-no-repeat"
          >
            <option value="all">Semua Tahun</option>
            <option value="2025">2025</option>
            <option value="2026">2026</option>
            <option value="2027">2027</option>
            <option value="2028">2028</option>
          </select>
          <select 
            value={currentMonth}
            onChange={handleMonthChange}
            className="bg-muted border-none rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-brand/50 cursor-pointer outline-none hover:bg-muted/80 transition-colors appearance-none pr-8 relative bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2364748b%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[length:16px_16px] bg-[right_8px_center] bg-no-repeat"
          >
            <option value="all">Semua Bulan</option>
            <option value="1">Januari</option>
            <option value="2">Februari</option>
            <option value="3">Maret</option>
            <option value="4">April</option>
            <option value="5">Mei</option>
            <option value="6">Juni</option>
            <option value="7">Juli</option>
            <option value="8">Agustus</option>
            <option value="9">September</option>
            <option value="10">Oktober</option>
            <option value="11">November</option>
            <option value="12">Desember</option>
          </select>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        {/* Date Display */}
        <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-full border border-border/50">
          <Calendar className="w-4 h-4 text-brand" />
          <span className="font-medium" suppressHydrationWarning>{todayDate}</span>
        </div>

        <button className="relative p-2 text-muted-foreground hover:bg-muted rounded-full transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-background"></span>
        </button>
        <div className="w-px h-6 bg-border mx-2"></div>
        <button className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <div className="w-8 h-8 rounded-full bg-brand/10 flex items-center justify-center text-brand">
            <UserCircle className="w-6 h-6" />
          </div>
          <div className="hidden md:block text-sm text-left">
            <p className="font-medium text-foreground leading-none">Admin User</p>
            <p className="text-xs text-muted-foreground mt-1">admin@cakra.com</p>
          </div>
        </button>
      </div>
    </header>
  );
}
