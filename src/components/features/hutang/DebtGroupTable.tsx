"use client";

import { useState, useEffect } from "react";
import { Plus, Loader2, ArrowRight, Trash2 } from "lucide-react";
import { PaginatedDebtGroupResponse, DebtGroup } from "@/types/hutang";
import { fetchApi } from "@/lib/api";

export function DebtGroupTable({ 
  initialData,
  onSelectGroup
}: { 
  initialData: PaginatedDebtGroupResponse | null;
  onSelectGroup: (id: number) => void;
}) {
  const [data, setData] = useState(initialData);
  const [isCreating, setIsCreating] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");

  useEffect(() => {
    if (!data) {
      fetchApi<PaginatedDebtGroupResponse>("/debt-groups")
        .then(res => setData(res))
        .catch(console.error);
    }
  }, [data]);
  
  const handleCreate = async () => {
    if (!newGroupName.trim()) return;
    setIsCreating(true);
    try {
      const res = await fetchApi<{ data: DebtGroup }>("/debt-groups", { 
        method: "POST", 
        body: JSON.stringify({ name: newGroupName }) 
      });
      // Go directly to the new group
      onSelectGroup(res.data.id);
    } catch (e) {
      console.error(e);
      alert("Gagal menambahkan grup hutang");
    } finally {
      setIsCreating(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Yakin ingin menghapus grup hutang ini beserta seluruh isinya?")) return;
    try {
      await fetchApi(`/debt-groups/${id}`, { method: "DELETE" });
      // Refresh list
      const res = await fetchApi<PaginatedDebtGroupResponse>("/debt-groups");
      setData(res);
    } catch (e) {
      console.error(e);
      alert("Gagal menghapus grup hutang");
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-card border border-border rounded-xl shadow-sm p-4 flex flex-col sm:flex-row gap-4 items-end justify-between">
        <div className="w-full sm:w-auto">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">
            Grup Hutang Baru
          </label>
          <div className="flex items-center gap-2">
            <input 
              type="text" 
              placeholder="Contoh: Hutang Jomboran Jan-April" 
              value={newGroupName}
              onChange={e => setNewGroupName(e.target.value)}
              className="bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/50 min-w-[250px]" 
            />
            <button 
              onClick={handleCreate} 
              disabled={isCreating || !newGroupName.trim()}
              className="flex items-center gap-2 px-4 py-2 bg-brand text-brand-foreground rounded-lg text-sm font-medium hover:bg-brand/90 transition-colors disabled:opacity-50"
            >
              {isCreating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Buat Grup
            </button>
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-muted/50 text-muted-foreground">
              <tr>
                <th className="px-6 py-4 font-semibold">Nama Grup</th>
                <th className="px-6 py-4 font-semibold text-right">Total Hutang</th>
                <th className="px-6 py-4 font-semibold text-right">Sisa Hutang</th>
                <th className="px-6 py-4 font-semibold text-center">Items</th>
                <th className="px-6 py-4 font-semibold text-center">Payments</th>
                <th className="px-6 py-4 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data?.data.map((group) => (
                <tr key={group.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4 font-medium">{group.name}</td>
                  <td className="px-6 py-4 text-right">Rp {group.total_amount.toLocaleString('id-ID')}</td>
                  <td className="px-6 py-4 text-right font-bold text-rose-500">
                    Rp {group.remaining_amount.toLocaleString('id-ID')}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex items-center justify-center bg-brand/10 text-brand rounded-full px-2.5 py-0.5 text-xs font-medium">
                      {group.items_count || 0}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex items-center justify-center bg-emerald-500/10 text-emerald-600 rounded-full px-2.5 py-0.5 text-xs font-medium">
                      {group.payments_count || 0}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => handleDelete(group.id)}
                        className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors"
                        title="Hapus Grup"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => onSelectGroup(group.id)}
                        className="flex items-center gap-2 px-3 py-1.5 bg-foreground text-background hover:opacity-90 rounded-lg transition-opacity text-xs font-medium"
                      >
                        Buka Detail <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!data?.data.length && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                    Belum ada data hutang. Silakan buat grup hutang baru.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
