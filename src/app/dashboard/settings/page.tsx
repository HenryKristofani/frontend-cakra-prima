"use client";

import { Moon, Sun, Laptop } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your application preferences and appearance.</p>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden p-6 max-w-2xl">
        <h3 className="text-lg font-medium text-foreground mb-4">Appearance</h3>
        
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">Customize the theme of your application.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => setTheme("light")}
              className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
                theme === "light" ? "border-brand bg-brand/5 text-brand" : "border-border bg-background hover:bg-muted text-foreground"
              }`}
            >
              <Sun className="w-6 h-6 mb-2" />
              <span className="font-medium">Light</span>
            </button>
            <button
              onClick={() => setTheme("dark")}
              className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
                theme === "dark" ? "border-brand bg-brand/5 text-brand" : "border-border bg-background hover:bg-muted text-foreground"
              }`}
            >
              <Moon className="w-6 h-6 mb-2" />
              <span className="font-medium">Dark</span>
            </button>
            <button
              onClick={() => setTheme("system")}
              className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
                theme === "system" ? "border-brand bg-brand/5 text-brand" : "border-border bg-background hover:bg-muted text-foreground"
              }`}
            >
              <Laptop className="w-6 h-6 mb-2" />
              <span className="font-medium">System</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
