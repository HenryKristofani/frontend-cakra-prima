"use client";

import { useEffect, useState } from "react";
import { Scale, Plus, Search, Edit2, Loader2, AlertTriangle, ArrowLeft } from "lucide-react";
import { inventoryService } from "@/lib/services/inventoryService";
import { Unit } from "@/types/inventory";
import { UnitManagementModal } from "@/components/features/inventory/UnitManagementModal";
import Link from "next/link";

export default function UnitsPage() {
  const [units, setUnits] = useState<Unit[]>([]);
  const [filteredUnits, setFilteredUnits] = useState<Unit[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [searchQuery, setSearchQuery] = useState("");
  
  const [showModal, setShowModal] = useState(false);
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);

  const fetchUnits = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await inventoryService.getUnits();
      setUnits(data);
      setFilteredUnits(data);
    } catch (err: any) {
      setError(err.message || "Gagal memuat daftar satuan.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUnits();
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredUnits(units);
      return;
    }
    const query = searchQuery.toLowerCase();
    const filtered = units.filter(unit => 
      unit.name.toLowerCase().includes(query) || 
      unit.symbol.toLowerCase().includes(query)
    );
    setFilteredUnits(filtered);
  }, [searchQuery, units]);

  const handleAddNew = () => {
    setEditingUnit(null);
    setShowModal(true);
  };

  const handleEdit = (unit: Unit) => {
    setEditingUnit(unit);
    setShowModal(true);
  };

  const handleModalSuccess = (savedUnit: Unit) => {
    setShowModal(false);
    fetchUnits();
  };

  return (
    <div className="max-w-6xl mx-auto pb-10 space-y-6">
      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
        <Link href="/dashboard/inventory" className="flex items-center hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4 mr-1" /> Kembali ke Inventory
        </Link>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Scale className="w-6 h-6 text-primary" />
            Master Satuan (UoM)
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Kelola daftar satuan pengukuran material yang digunakan dalam sistem.
          </p>
        </div>
        <button 
          onClick={handleAddNew}
          className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Daftarkan Satuan Baru
        </button>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b border-border bg-muted/20 flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-muted-foreground" />
            </div>
            <input
              type="text"
              placeholder="Cari nama atau simbol..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-background border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            />
          </div>
        </div>

        {error && (
          <div className="m-4 p-4 rounded-lg bg-red-50 text-red-600 border border-red-200 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {isLoading ? (
          <div className="p-12 flex flex-col items-center justify-center text-muted-foreground">
            <Loader2 className="w-8 h-8 animate-spin mb-4 text-primary" />
            <p>Memuat data satuan...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/50 text-muted-foreground uppercase text-[11px] font-semibold tracking-wider">
                <tr>
                  <th className="px-6 py-4">Nama Satuan</th>
                  <th className="px-6 py-4">Simbol</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredUnits.map((unit) => (
                  <tr key={unit.id} className="hover:bg-muted/30 transition-colors group">
                    <td className="px-6 py-4 font-medium text-foreground">
                      {unit.name}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                        {unit.symbol}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {unit.is_active !== false ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                          Aktif
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                          Nonaktif
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleEdit(unit)}
                        className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-md transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                        title="Edit Satuan"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                
                {filteredUnits.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">
                      <Scale className="w-10 h-10 mx-auto text-muted/50 mb-3" />
                      <p className="text-base font-medium text-foreground">Tidak ada satuan ditemukan</p>
                      <p className="text-sm mt-1">
                        {searchQuery ? `Tidak ada hasil untuk pencarian "${searchQuery}"` : "Belum ada master data satuan."}
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <UnitManagementModal
          onClose={() => setShowModal(false)}
          onSuccess={handleModalSuccess}
          unit={editingUnit}
        />
      )}
    </div>
  );
}
