"use client";

import { useState, useEffect } from "react";
import { X, Plus, Trash2, Loader2, HardHat } from "lucide-react";
import { inventoryService } from "@/lib/services/inventoryService";
import { Warehouse, StockBalanceDetail } from "@/types/inventory";

interface UsageFormModalProps {
  onClose: () => void;
  onSuccess: () => void;
  warehouses: Warehouse[]; // We'll receive all and filter by type='project'
}

interface FormItem {
  id: string;
  item_id: number | "";
  quantity: number | "";
  usage_note: string;
}

export function UsageFormModal({ onClose, onSuccess, warehouses }: UsageFormModalProps) {
  const [sourceId, setSourceId] = useState<number | "">("");
  const [notes, setNotes] = useState("");
  
  const [availableStock, setAvailableStock] = useState<StockBalanceDetail[]>([]);
  const [isLoadingStock, setIsLoadingStock] = useState(false);
  
  const [formItems, setFormItems] = useState<FormItem[]>([
    { id: Date.now().toString(), item_id: "", quantity: "", usage_note: "" }
  ]);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const projectWarehouses = warehouses.filter(w => w.type === 'project');

  useEffect(() => {
    if (sourceId === "") return;
    const fetchStock = async () => {
      setIsLoadingStock(true);
      try {
        const data = await inventoryService.getBalancesByWarehouse(Number(sourceId));
        setAvailableStock(data.filter(d => Number(d.quantity_on_hand) > 0));
        setFormItems([{ id: Date.now().toString(), item_id: "", quantity: "", usage_note: "" }]);
      } catch (e: any) {
        setError("Gagal memuat stok gudang project");
      } finally {
        setIsLoadingStock(false);
      }
    };
    fetchStock();
  }, [sourceId]);

  const handleAddItem = () => {
    setFormItems([...formItems, { id: Date.now().toString(), item_id: "", quantity: "", usage_note: "" }]);
  };

  const handleRemoveItem = (id: string) => {
    if (formItems.length === 1) return;
    setFormItems(formItems.filter((i) => i.id !== id));
  };

  const updateItem = (id: string, field: keyof FormItem, value: any) => {
    setFormItems(formItems.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (sourceId === "") {
      setError("Pilih Gudang Project asal");
      return;
    }
    
    const validItems = formItems.filter(i => i.item_id !== "" && i.quantity !== "" && Number(i.quantity) > 0);
    if (validItems.length === 0) {
      setError("Masukkan minimal 1 barang dengan quantity valid");
      return;
    }

    for (const item of validItems) {
      const stock = availableStock.find(s => s.item_id === Number(item.item_id));
      if (!stock || Number(item.quantity) > Number(stock.quantity_on_hand)) {
        setError(`Quantity pemakaian untuk ${stock?.item?.name || 'barang'} melebihi stok yang ada`);
        return;
      }
    }

    setIsSubmitting(true);
    setError(null);
    try {
      await inventoryService.createMutation({
        type: "usage",
        source_warehouse_id: undefined,
        warehouse_id: Number(sourceId),
        notes: notes,
        items: validItems.map(i => ({
          item_id: Number(i.item_id),
          quantity: Number(i.quantity),
          usage_note: i.usage_note
        }))
      });
      onSuccess();
    } catch (e: any) {
      setError(e.message || "Gagal mencatat pemakaian barang");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-background w-full max-w-5xl rounded-xl shadow-lg border border-border flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div>
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <HardHat className="w-5 h-5 text-emerald-600" />
              Pemakaian Material (Usage)
            </h3>
            <p className="text-sm text-muted-foreground">Catat material yang telah digunakan di lokasi proyek.</p>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-muted rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 overflow-y-auto flex-1">
          {error && <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-600 text-sm border border-red-200">{error}</div>}

          <form id="usage-form" onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2 md:col-span-1">
                <label className="text-sm font-medium">Gudang Project</label>
                <select 
                  value={sourceId} 
                  onChange={e => setSourceId(e.target.value ? Number(e.target.value) : "")}
                  className="w-full h-10 px-3 bg-background border border-input rounded-md text-sm"
                  required
                >
                  <option value="" disabled>Pilih Project...</option>
                  {projectWarehouses.map(w => (
                    <option key={w.id} value={w.id}>{w.name}</option>
                  ))}
                </select>
                {projectWarehouses.length === 0 && (
                  <p className="text-xs text-red-500 mt-1">Tidak ada gudang bertipe Project yang ditemukan.</p>
                )}
              </div>
              <div className="space-y-2 md:col-span-1">
                <label className="text-sm font-medium">Catatan Dokumen (Opsional)</label>
                <input 
                  type="text" 
                  value={notes} 
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Laporan harian, mandor, dll..."
                  className="w-full h-10 px-3 bg-background border border-input rounded-md text-sm"
                />
              </div>
            </div>

            <div className="border-t border-border pt-4">
              <h4 className="font-medium mb-3">Material yang Dipakai</h4>
              
              {sourceId === "" ? (
                <div className="p-4 text-center text-sm text-muted-foreground border border-dashed border-border rounded-lg">
                  Silakan pilih Gudang Project terlebih dahulu.
                </div>
              ) : isLoadingStock ? (
                <div className="flex items-center justify-center p-4">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : availableStock.length === 0 ? (
                <div className="p-4 text-center text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg">
                  Project ini belum memiliki stok material apapun.
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="grid grid-cols-12 gap-2 text-xs font-semibold text-muted-foreground uppercase px-2 hidden md:grid">
                    <div className="col-span-4">Material</div>
                    <div className="col-span-2 text-center">Stok Sisa</div>
                    <div className="col-span-2">Qty Dipakai</div>
                    <div className="col-span-3">Keterangan Penggunaan</div>
                    <div className="col-span-1 text-center">Aksi</div>
                  </div>

                  {formItems.map((item) => {
                    const selectedStock = availableStock.find(s => s.item_id === Number(item.item_id));
                    const maxQty = selectedStock ? Number(selectedStock.quantity_on_hand) : 0;
                    const isExceeding = Number(item.quantity) > maxQty;

                    return (
                      <div key={item.id} className="grid grid-cols-1 md:grid-cols-12 gap-2 items-start bg-muted/30 p-2 rounded-lg border border-border">
                        <div className="col-span-1 md:col-span-4">
                          <select 
                            value={item.item_id}
                            onChange={e => updateItem(item.id, 'item_id', e.target.value)}
                            className="w-full h-9 px-2 bg-background border border-input rounded-md text-sm"
                            required
                          >
                            <option value="" disabled>Pilih Material...</option>
                            {availableStock.map(stock => (
                              <option key={stock.item_id} value={stock.item_id}>
                                {stock.item?.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="col-span-1 md:col-span-2 flex items-center justify-center h-9">
                          <span className="text-sm font-medium text-emerald-600 dark:text-emerald-500">
                            {selectedStock ? `${maxQty} ${selectedStock.item?.unit?.symbol || ''}` : '-'}
                          </span>
                        </div>
                        <div className="col-span-1 md:col-span-2">
                          <input 
                            type="number" 
                            min="0.01" step="0.01" max={maxQty}
                            value={item.quantity}
                            onChange={e => updateItem(item.id, 'quantity', e.target.value)}
                            placeholder="Qty"
                            className={`w-full h-9 px-2 bg-background border rounded-md text-sm ${isExceeding ? 'border-red-500 focus:ring-red-500' : 'border-input'}`}
                            required
                          />
                          {isExceeding && (
                            <p className="text-xs text-red-500 mt-1">Stok tidak cukup</p>
                          )}
                        </div>
                        <div className="col-span-1 md:col-span-3">
                          <input 
                            type="text" 
                            value={item.usage_note}
                            onChange={e => updateItem(item.id, 'usage_note', e.target.value)}
                            placeholder="Cth: Pengecoran pondasi A"
                            className="w-full h-9 px-2 bg-background border border-input rounded-md text-sm"
                            required
                          />
                        </div>
                        <div className="col-span-1 md:col-span-1 flex justify-center h-9 items-center">
                          <button 
                            type="button" 
                            onClick={() => handleRemoveItem(item.id)}
                            disabled={formItems.length === 1}
                            className="p-1.5 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-md disabled:opacity-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                  
                  <div className="mt-4">
                    <button 
                      type="button" 
                      onClick={handleAddItem}
                      className="flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80"
                    >
                      <Plus className="w-4 h-4" /> Tambah Baris
                    </button>
                  </div>
                </div>
              )}
            </div>
          </form>
        </div>

        <div className="p-4 border-t border-border flex justify-end gap-3 bg-muted/50 rounded-b-xl">
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
            form="usage-form"
            className="px-4 py-2 text-sm font-medium bg-emerald-600 text-white hover:bg-emerald-700 rounded-md flex items-center gap-2"
            disabled={isSubmitting || sourceId === ""}
          >
            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
            <HardHat className="w-4 h-4" />
            Catat Pemakaian
          </button>
        </div>
      </div>
    </div>
  );
}
