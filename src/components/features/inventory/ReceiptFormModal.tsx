"use client";

import { useState, useEffect } from "react";
import { X, Plus, Trash2, Loader2, Save } from "lucide-react";
import { inventoryService } from "@/lib/services/inventoryService";
import { Warehouse, InventoryItem } from "@/types/inventory";
import { ItemManagementModal } from "./ItemManagementModal";

interface ReceiptFormModalProps {
  onClose: () => void;
  onSuccess: () => void;
  warehouses: Warehouse[];
}

interface FormItem {
  id: string; // client-side temp id
  item_id: number | "" | "new_item";
  quantity: number | "";
  unit_price: number | "";
}

export function ReceiptFormModal({ onClose, onSuccess, warehouses }: ReceiptFormModalProps) {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [isLoadingItems, setIsLoadingItems] = useState(true);
  
  const [showQuickCreate, setShowQuickCreate] = useState(false);
  const [rowToUpdate, setRowToUpdate] = useState<string | null>(null);
  
  const [destinationId, setDestinationId] = useState<number | "">("");
  const [sourceType, setSourceType] = useState<"purchase" | "warehouse">("purchase");
  const [notes, setNotes] = useState("");
  
  const [formItems, setFormItems] = useState<FormItem[]>([
    { id: Date.now().toString(), item_id: "", quantity: "", unit_price: "" }
  ]);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const data = await inventoryService.getItems();
        setItems(data);
      } catch (e: any) {
        setError("Gagal memuat master barang");
      } finally {
        setIsLoadingItems(false);
      }
    };
    fetchItems();
  }, []);

  const handleAddItem = () => {
    setFormItems([...formItems, { id: Date.now().toString(), item_id: "", quantity: "", unit_price: "" }]);
  };

  const handleRemoveItem = (id: string) => {
    if (formItems.length === 1) return;
    setFormItems(formItems.filter((i) => i.id !== id));
  };

  const updateItem = (id: string, field: keyof FormItem, value: any) => {
    if (field === 'item_id' && value === 'new_item') {
      setRowToUpdate(id);
      setShowQuickCreate(true);
      return; // Jangan set value ke state dulu
    }
    setFormItems(formItems.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const handleQuickCreateSuccess = (newItem: InventoryItem) => {
    // 1. Tambah ke master items lokal
    setItems(prev => [...prev, newItem].sort((a, b) => a.name.localeCompare(b.name)));
    
    // 2. Pilih item baru di baris yang triggernya
    if (rowToUpdate) {
      setFormItems(formItems.map(item => 
        item.id === rowToUpdate ? { ...item, item_id: newItem.id } : item
      ));
    }
    
    setShowQuickCreate(false);
    setRowToUpdate(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (destinationId === "") {
      setError("Pilih gudang tujuan");
      return;
    }
    
    const validItems = formItems.filter(i => i.item_id !== "" && i.quantity !== "" && Number(i.quantity) > 0);
    if (validItems.length === 0) {
      setError("Masukkan minimal 1 barang dengan quantity valid");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      await inventoryService.createMutation({
        type: "in",
        destination_warehouse_id: Number(destinationId),
        source_type: sourceType,
        notes: notes,
        items: validItems.map(i => ({
          item_id: Number(i.item_id),
          quantity: Number(i.quantity),
          unit_price: i.unit_price ? Number(i.unit_price) : 0
        }))
      });
      onSuccess();
    } catch (e: any) {
      setError(e.message || "Gagal menyimpan penerimaan barang");
    } finally {
      setIsSubmitting(false);
    }
  };

  const grandTotal = formItems.reduce((sum, item) => {
    const qty = Number(item.quantity) || 0;
    const price = Number(item.unit_price) || 0;
    return sum + (qty * price);
  }, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-background w-full max-w-4xl rounded-xl shadow-lg border border-border flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div>
            <h3 className="font-semibold text-lg">Penerimaan Barang (In)</h3>
            <p className="text-sm text-muted-foreground">Catat material yang masuk ke gudang.</p>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-muted rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto flex-1">
          {error && <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-600 text-sm border border-red-200">{error}</div>}

          <form id="receipt-form" onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Gudang Tujuan</label>
                <select 
                  value={destinationId} 
                  onChange={e => setDestinationId(e.target.value ? Number(e.target.value) : "")}
                  className="w-full h-10 px-3 bg-background border border-input rounded-md text-sm"
                  required
                >
                  <option value="" disabled>Pilih Gudang...</option>
                  {warehouses.map(w => (
                    <option key={w.id} value={w.id}>{w.name} ({w.type === 'main' ? 'Utama' : 'Project'})</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Sumber (Source)</label>
                <select 
                  value={sourceType} 
                  onChange={e => setSourceType(e.target.value as any)}
                  className="w-full h-10 px-3 bg-background border border-input rounded-md text-sm"
                >
                  <option value="purchase">Pembelian Baru</option>
                  <option value="warehouse">Stok Existing (Awal)</option>
                </select>
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium">Catatan / Ref (Opsional)</label>
                <input 
                  type="text" 
                  value={notes} 
                  onChange={e => setNotes(e.target.value)}
                  placeholder="No. PO, Surat Jalan, dll..."
                  className="w-full h-10 px-3 bg-background border border-input rounded-md text-sm"
                />
              </div>
            </div>

            <div className="border-t border-border pt-4">
              <h4 className="font-medium mb-3">Item Barang</h4>
              <div className="space-y-2">
                <div className="grid grid-cols-12 gap-2 text-xs font-semibold text-muted-foreground uppercase px-2 hidden md:grid">
                  <div className="col-span-4">Material</div>
                  <div className="col-span-2">Quantity</div>
                  <div className="col-span-2">Harga Satuan</div>
                  <div className="col-span-3">Total</div>
                  <div className="col-span-1 text-center">Aksi</div>
                </div>

                {isLoadingItems ? (
                  <div className="flex items-center justify-center p-4">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                ) : (
                  formItems.map((item, index) => {
                    const total = (Number(item.quantity) || 0) * (Number(item.unit_price) || 0);
                    return (
                      <div key={item.id} className="grid grid-cols-1 md:grid-cols-12 gap-2 items-center bg-muted/30 p-2 rounded-lg border border-border">
                        <div className="col-span-1 md:col-span-4">
                          <select 
                            value={item.item_id}
                            onChange={e => updateItem(item.id, 'item_id', e.target.value)}
                            className="w-full h-9 px-2 bg-background border border-input rounded-md text-sm"
                            required
                          >
                            <option value="" disabled>Pilih Material...</option>
                            {items.map(masterItem => (
                              <option key={masterItem.id} value={masterItem.id}>{masterItem.name}</option>
                            ))}
                            <option disabled>──────────</option>
                            <option value="new_item" className="text-primary font-medium">+ Daftarkan Item Baru</option>
                          </select>
                        </div>
                        <div className="col-span-1 md:col-span-2">
                          <input 
                            type="number" 
                            min="0.01" step="0.01"
                            value={item.quantity}
                            onChange={e => updateItem(item.id, 'quantity', e.target.value)}
                            placeholder="Qty"
                            className="w-full h-9 px-2 bg-background border border-input rounded-md text-sm"
                            required
                          />
                        </div>
                        <div className="col-span-1 md:col-span-2">
                          <input 
                            type="number" 
                            min="0"
                            value={item.unit_price}
                            onChange={e => updateItem(item.id, 'unit_price', e.target.value)}
                            placeholder="Rp / satuan"
                            className="w-full h-9 px-2 bg-background border border-input rounded-md text-sm"
                          />
                        </div>
                        <div className="col-span-1 md:col-span-3 text-right pr-2">
                          <span className="text-sm font-medium">Rp {total.toLocaleString('id-ID')}</span>
                        </div>
                        <div className="col-span-1 md:col-span-1 flex justify-center">
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
                  })
                )}
                
                <div className="flex justify-between items-center mt-4">
                  <button 
                    type="button" 
                    onClick={handleAddItem}
                    className="flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80"
                  >
                    <Plus className="w-4 h-4" /> Tambah Baris
                  </button>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Grand Total</p>
                    <p className="text-xl font-bold">Rp {grandTotal.toLocaleString('id-ID')}</p>
                  </div>
                </div>

              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
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
            form="receipt-form"
            className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 rounded-md flex items-center gap-2"
            disabled={isSubmitting}
          >
            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
            <Save className="w-4 h-4" />
            Simpan Penerimaan
          </button>
        </div>
      </div>

      {showQuickCreate && (
        <ItemManagementModal
          isNested={true}
          onClose={() => {
            setShowQuickCreate(false);
            setRowToUpdate(null);
          }}
          onSuccess={handleQuickCreateSuccess}
        />
      )}
    </div>
  );
}
