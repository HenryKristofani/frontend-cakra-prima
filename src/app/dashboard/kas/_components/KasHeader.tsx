import { Plus } from "lucide-react";

export function KasHeader() {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Kas & Keuangan</h1>
        <p className="text-muted-foreground mt-1">Manage treasury, income, and expenses.</p>
      </div>
      <button className="flex items-center gap-2 bg-brand text-white px-4 py-2 rounded-lg font-medium hover:bg-brand-hover transition-colors shadow-sm">
        <Plus className="w-4 h-4" />
        Add Transaction
      </button>
    </div>
  );
}
