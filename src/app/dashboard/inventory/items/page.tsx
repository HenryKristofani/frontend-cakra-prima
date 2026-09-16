"use client";

import { useEffect, useState } from "react";
import { Package, Plus, Search, Edit2, Loader2, AlertTriangle, ArrowLeft } from "lucide-react";
import { inventoryService } from "@/lib/services/inventoryService";
import { InventoryItem } from "@/types/inventory";
import { ItemManagementModal } from "@/components/features/inventory/ItemManagementModal";
import Link from "next/link";

export default function ItemsPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<InventoryItem[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [searchQuery, setSearchQuery] = useState("");
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);

  const fetchItems = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Ambil semua item termasuk yang tidak aktif
      const data = await inventoryService.getItems("", true);
      setItems(data);
      setFilteredItems(data);
    } catch (err: any) {
      setError(err.message || "Gagal memuat daftar item.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  // Client-side filtering as fallback/quick search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredItems(items);
      return;
    }
    const query = searchQuery.toLowerCase();
    const filtered = items.filter(item => 
      item.name.toLowerCase().includes(query) || 
      (item.sku && item.sku.toLowerCase().includes(query)) ||
      (item.category && item.category.toLowerCase().includes(query))
    );
    setFilteredItems(filtered);
  }, [searchQuery, items]);

  const handleAddNew = () => {
    setEditingItem(null);
    setShowModal(true);
  };

  const handleEdit = (item: InventoryItem) => {
    setEditingItem(item);
    setShowModal(true);
  };

  const handleModalSuccess = (savedItem: InventoryItem) => {
    setShowModal(false);
    // Refresh list from server to ensure accurate state
    fetchItems();
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
            <Package className="w-6 h-6 text-primary" />
            Master Barang
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Kelola daftar semua material dan barang yang digunakan dalam sistem inventory.
          </p>
        </div>
        <button 
          onClick={handleAddNew}
          className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Daftarkan Item Baru
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
              placeholder="Cari nama, SKU, atau kategori..."
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
            <p>Memuat data barang...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/50 text-muted-foreground uppercase text-[11px] font-semibold tracking-wider">
                <tr>
                  <th className="px-6 py-4">SKU</th>
                  <th className="px-6 py-4">Nama Item</th>
                  <th className="px-6 py-4">Kategori</th>
                  <th className="px-6 py-4">Satuan</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-muted/30 transition-colors group">
                    <td className="px-6 py-4 font-mono text-xs text-muted-foreground">
                      {item.sku || '-'}
                    </td>
                    <td className="px-6 py-4 font-medium text-foreground">
                      {item.name}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {item.category || '-'}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                        {item.unit?.name || item.unit?.symbol || '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {item.is_active !== false ? (
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
                        onClick={() => handleEdit(item)}
                        className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-md transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                        title="Edit Item"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                
                {filteredItems.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                      <Package className="w-10 h-10 mx-auto text-muted/50 mb-3" />
                      <p className="text-base font-medium text-foreground">Tidak ada item ditemukan</p>
                      <p className="text-sm mt-1">
                        {searchQuery ? `Tidak ada hasil untuk pencarian "${searchQuery}"` : "Belum ada master data barang."}
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
        <ItemManagementModal
          onClose={() => setShowModal(false)}
          onSuccess={handleModalSuccess}
          item={editingItem}
        />
      )}
    </div>
  );
}
