"use client";

import { useState, useEffect } from "react";
import { X, Loader2, Save } from "lucide-react";
import { inventoryService } from "@/lib/services/inventoryService";
import { Unit } from "@/types/inventory";

interface UnitManagementModalProps {
  onClose: () => void;
  onSuccess: (unit: Unit) => void;
  unit?: Unit | null; 
  isNested?: boolean; 
}

export function UnitManagementModal({ onClose, onSuccess, unit, isNested = false }: UnitManagementModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    symbol: "",
    is_active: true
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (unit) {
      setFormData({
        name: unit.name,
        symbol: unit.symbol,
        is_active: unit.is_active ?? true
      });
    }
  }, [unit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      let savedUnit: Unit;
      if (unit) {
        savedUnit = await inventoryService.updateUnit(unit.id, formData);
      } else {
        savedUnit = await inventoryService.createUnit(formData);
      }
      onSuccess(savedUnit);
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan saat menyimpan satuan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`fixed inset-0 z-[70] flex items-center justify-center p-4 ${isNested ? 'bg-black/60' : 'bg-black/40'}`}>
      <div 
        className="bg-card w-full max-w-sm rounded-xl shadow-xl overflow-hidden flex flex-col border border-border"
        onClick={e => e.stopPropagation()} 
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/30">
          <h2 className="text-lg font-bold text-foreground">
            {unit ? "Edit Satuan" : "Daftarkan Satuan Baru"}
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
            <label className="text-sm font-medium">Nama Satuan <span className="text-red-500">*</span></label>
            <input 
              type="text" 
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              placeholder="Cth: Kilogram"
              className="w-full h-10 px-3 bg-background border border-input rounded-md text-sm"
              required
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Simbol / Singkatan <span className="text-red-500">*</span></label>
            <input 
              type="text" 
              value={formData.symbol}
              onChange={e => setFormData({...formData, symbol: e.target.value})}
              placeholder="Cth: kg"
              className="w-full h-10 px-3 bg-background border border-input rounded-md text-sm"
              required
            />
          </div>

          {unit && (
            <div className="space-y-2 pt-2 border-t border-border">
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={e => setFormData({...formData, is_active: e.target.checked})}
                  className="rounded border-input text-primary focus:ring-primary w-4 h-4"
                />
                <span className="text-sm font-medium">Satuan Aktif</span>
              </label>
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
                  {unit ? "Simpan Perubahan" : "Simpan Satuan"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
