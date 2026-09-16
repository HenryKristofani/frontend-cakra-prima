"use client";

import { useState, useEffect } from "react";
import { X, Loader2, Save } from "lucide-react";
import { inventoryService } from "@/lib/services/inventoryService";
import { InventoryItem, ItemRequest, Unit } from "@/types/inventory";
import { UnitManagementModal } from "./UnitManagementModal";

interface ItemManagementModalProps {
  onClose: () => void;
  onSuccess: (item: InventoryItem) => void;
  item?: InventoryItem | null; // Jika ada, berarti mode Edit
  isNested?: boolean; // Jika true, backdrop lebih gelap
}

export function ItemManagementModal({ onClose, onSuccess, item, isNested = false }: ItemManagementModalProps) {
  const [formData, setFormData] = useState<ItemRequest>({
    name: "",
    sku: "",
    unit_id: 0,
    category: "",
    is_active: true
  });
  
  const [units, setUnits] = useState<Unit[]>([]);
  const [isLoadingUnits, setIsLoadingUnits] = useState(true);
  
  const [showUnitModal, setShowUnitModal] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadUnits = async () => {
    try {
      const data = await inventoryService.getUnits("", true);
      setUnits(data);
    } catch (e) {
      console.error("Gagal load units", e);
    } finally {
      setIsLoadingUnits(false);
    }
  };

  useEffect(() => {
    loadUnits();
  }, []);

  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name,
        sku: item.sku || "",
        unit_id: item.unit_id,
        category: item.category || "",
        is_active: item.is_active ?? true
      });
    }
  }, [item]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      let savedItem: InventoryItem;
      if (item) {
        savedItem = await inventoryService.updateItem(item.id, formData);
      } else {
        savedItem = await inventoryService.createItem(formData);
      }
      onSuccess(savedItem);
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan saat menyimpan item.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`fixed inset-0 z-[60] flex items-center justify-center p-4 ${isNested ? 'bg-black/60' : 'bg-black/40'}`}>
      <div 
        className="bg-card w-full max-w-md rounded-xl shadow-xl overflow-hidden flex flex-col border border-border"
        onClick={e => e.stopPropagation()} // Cegah event bocor ke bawah jika nested
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/30">
          <h2 className="text-lg font-bold text-foreground">
            {item ? "Edit Item" : "Daftarkan Item Baru"}
          </h2>
          <button 
            onClick={onClose}
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium">Nama Item <span className="text-red-500">*</span></label>
            <input 
              type="text" 
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              placeholder="Cth: Semen Tiga Roda 50kg"
              className="w-full h-10 px-3 bg-background border border-input rounded-md text-sm"
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">SKU (Kode Barang)</label>
              <input 
                type="text" 
                value={formData.sku || ""}
                onChange={e => setFormData({...formData, sku: e.target.value})}
                placeholder="Cth: SMN-001"
                className="w-full h-10 px-3 bg-background border border-input rounded-md text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Satuan <span className="text-red-500">*</span></label>
              {isLoadingUnits ? (
                <div className="w-full h-10 px-3 bg-muted border border-input rounded-md flex items-center">
                  <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <select 
                  value={formData.unit_id || ""}
                  onChange={e => {
                    if (e.target.value === "new_unit") {
                      setShowUnitModal(true);
                    } else {
                      setFormData({...formData, unit_id: Number(e.target.value)});
                    }
                  }}
                  className="w-full h-10 px-3 bg-background border border-input rounded-md text-sm"
                  required
                >
                  <option value="" disabled>Pilih Satuan...</option>
                  {units.map(u => (
                    <option key={u.id} value={u.id}>{u.name} ({u.symbol})</option>
                  ))}
                  <option disabled>──────────</option>
                  <option value="new_unit" className="text-primary font-medium">+ Tambah Satuan Baru</option>
                </select>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Kategori</label>
            <input 
              type="text" 
              value={formData.category || ""}
              onChange={e => setFormData({...formData, category: e.target.value})}
              placeholder="Cth: Material Bangunan"
              className="w-full h-10 px-3 bg-background border border-input rounded-md text-sm"
            />
          </div>

          {item && (
            <div className="space-y-2 pt-2 border-t border-border">
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={e => setFormData({...formData, is_active: e.target.checked})}
                  className="rounded border-input text-primary focus:ring-primary w-4 h-4"
                />
                <span className="text-sm font-medium">Item Aktif</span>
              </label>
              <p className="text-xs text-muted-foreground ml-6">
                Hilangkan centang untuk menyembunyikan item ini dari pilihan dropdown transaksi baru.
              </p>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <button 
              type="button" 
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium border border-input bg-background hover:bg-accent rounded-md"
              disabled={isSubmitting}
            >
              Batal
            </button>
            <button 
              type="submit" 
              className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 rounded-md flex items-center gap-2"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  {item ? "Simpan Perubahan" : "Simpan Item"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {showUnitModal && (
        <UnitManagementModal
          isNested={true}
          onClose={() => setShowUnitModal(false)}
          onSuccess={(newUnit) => {
            setUnits(prev => [...prev, newUnit].sort((a, b) => a.name.localeCompare(b.name)));
            setFormData(prev => ({ ...prev, unit_id: newUnit.id }));
            setShowUnitModal(false);
          }}
        />
      )}
    </div>
  );
}
