"use client";

import { useState, useEffect, useRef } from "react";
import { ArrowLeft, Plus, Loader2, Trash2, Save, CheckSquare, TableIcon, X, FileSpreadsheet, Upload, Download } from "lucide-react";
import { DebtGroup, DebtItem, DebtPayment } from "@/types/hutang";
import { fetchApi } from "@/lib/api";

// ─── Types for local dirty state ────────────────────────────────────────────
type DirtyItem = {
  id: number;
  no: string;
  description: string;
  trans_date: string;
  amount: string;
};

type DirtyPayment = {
  id: number;
  description: string;
  payment_date: string;
  amount: string;
};

// ─── Editable Item Row ──────────────────────────────────────────────────────
function EditableItemRow({ 
  item, 
  onDirtyChange,
  onDelete 
}: { 
  item: DebtItem;
  onDirtyChange: (dirty: DirtyItem | null) => void;
  onDelete: (id: number) => void;
}) {
  const [no, setNo] = useState(item.no?.toString() ?? "");
  const [description, setDescription] = useState(item.description);
  const [transDate, setTransDate] = useState(item.trans_date?.split("T")[0] ?? "");
  const [amount, setAmount] = useState(item.amount.toString());

  const isDirty =
    no !== (item.no?.toString() ?? "") ||
    description !== item.description ||
    transDate !== (item.trans_date?.split("T")[0] ?? "") ||
    amount !== item.amount.toString();

  // Notify parent when dirty state changes
  useEffect(() => {
    if (isDirty) {
      onDirtyChange({ id: item.id, no, description, trans_date: transDate, amount });
    } else {
      onDirtyChange(null);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [no, description, transDate, amount]);

  return (
    <tr className="border-b border-black/20 hover:bg-muted/30 transition-colors group">
      <td className="border-r border-black/20 px-2 py-1.5">
        <input type="number" value={no} onChange={e => setNo(e.target.value)}
          className="w-full bg-transparent border border-transparent group-hover:border-border focus:border-brand focus:bg-background rounded px-2 py-1 text-sm text-center min-w-[45px] focus:outline-none transition-colors" />
      </td>
      <td className="border-r border-black/20 px-2 py-1.5">
        <input type="text" value={description} onChange={e => setDescription(e.target.value)}
          className="w-full bg-transparent border border-transparent group-hover:border-border focus:border-brand focus:bg-background rounded px-2 py-1 text-sm min-w-[200px] focus:outline-none transition-colors" />
      </td>
      <td className="border-r border-black/20 px-2 py-1.5">
        <input type="date" value={transDate} onChange={e => setTransDate(e.target.value)}
          className="w-full bg-transparent border border-transparent group-hover:border-border focus:border-brand focus:bg-background rounded px-2 py-1 text-sm focus:outline-none transition-colors" />
      </td>
      <td className="border-r border-black/20 px-2 py-1.5">
        <input type="number" value={amount} onChange={e => setAmount(e.target.value)}
          className="w-full bg-transparent border border-transparent group-hover:border-border focus:border-brand focus:bg-background rounded px-2 py-1 text-sm text-right min-w-[130px] focus:outline-none transition-colors" />
      </td>
      <td className="px-2 py-1.5">
        <div className="flex items-center justify-center gap-1">
          {isDirty && <span className="w-2 h-2 bg-amber-400 rounded-full" title="Ada perubahan belum disimpan" />}
          <button onClick={() => onDelete(item.id)} title="Hapus"
            className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded transition-colors">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </td>
    </tr>
  );
}

// ─── Editable Payment Row ────────────────────────────────────────────────────
function EditablePaymentRow({ 
  payment,
  onDirtyChange,
  onDelete 
}: { 
  payment: DebtPayment;
  onDirtyChange: (dirty: DirtyPayment | null) => void;
  onDelete: (id: number) => void;
}) {
  const [description, setDescription] = useState(payment.description);
  const [paymentDate, setPaymentDate] = useState(payment.payment_date?.split("T")[0] ?? "");
  const [amount, setAmount] = useState(payment.amount.toString());

  const isDirty =
    description !== payment.description ||
    paymentDate !== (payment.payment_date?.split("T")[0] ?? "") ||
    amount !== payment.amount.toString();

  useEffect(() => {
    if (isDirty) {
      onDirtyChange({ id: payment.id, description, payment_date: paymentDate, amount });
    } else {
      onDirtyChange(null);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [description, paymentDate, amount]);

  return (
    <tr className="bg-[#92D050] text-black border-b border-black group">
      <td colSpan={2} className="border-r border-black px-2 py-1.5">
        <input type="text" value={description} onChange={e => setDescription(e.target.value)}
          className="w-full bg-transparent border border-transparent group-hover:border-black/30 focus:border-black focus:bg-white/30 rounded px-2 py-1 text-sm uppercase min-w-[200px] focus:outline-none transition-colors" />
      </td>
      <td className="border-r border-black px-2 py-1.5">
        <input type="date" value={paymentDate} onChange={e => setPaymentDate(e.target.value)}
          className="w-full bg-transparent border border-transparent group-hover:border-black/30 focus:border-black focus:bg-white/30 rounded px-2 py-1 text-sm focus:outline-none transition-colors" />
      </td>
      <td className="border-r border-black px-2 py-1.5">
        <input type="number" value={amount} onChange={e => setAmount(e.target.value)}
          className="w-full bg-transparent border border-transparent group-hover:border-black/30 focus:border-black focus:bg-white/30 rounded px-2 py-1 text-sm text-right min-w-[130px] focus:outline-none transition-colors" />
      </td>
      <td className="px-2 py-1.5">
        <div className="flex items-center justify-center gap-1">
          {isDirty && <span className="w-2 h-2 bg-amber-500 rounded-full" title="Ada perubahan belum disimpan" />}
          <button onClick={() => onDelete(payment.id)} title="Hapus"
            className="p-1.5 text-black/60 hover:text-black hover:bg-black/10 rounded transition-colors">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </td>
    </tr>
  );
}

// ─── Bulk Insert Modal ────────────────────────────────────────────────────────
type BulkRow = { no: string; description: string; trans_date: string; amount: string };

function BulkInsertModal({ 
  groupId, 
  type,
  onClose, 
  onSuccess 
}: { 
  groupId: number;
  type: "items" | "payments";
  onClose: () => void; 
  onSuccess: () => void; 
}) {
  const initRow = (): BulkRow => ({ no: "", description: "", trans_date: "", amount: "" });
  const [rows, setRows] = useState<BulkRow[]>([initRow(), initRow(), initRow()]);
  const [isSaving, setIsSaving] = useState(false);

  const addRow = () => setRows(r => [...r, initRow()]);
  const removeRow = (i: number) => setRows(r => r.filter((_, idx) => idx !== i));
  const updateRow = (i: number, field: keyof BulkRow, value: string) => {
    setRows(r => r.map((row, idx) => idx === i ? { ...row, [field]: value } : row));
  };

  const validRows = rows.filter(r => r.description && r.amount);

  const handleSubmit = async () => {
    if (!validRows.length) return alert("Isi minimal satu baris");
    setIsSaving(true);
    try {
      if (type === "items") {
        await fetchApi(`/debt-groups/${groupId}/items/bulk`, {
          method: "POST",
          body: JSON.stringify({
            items: validRows.map(r => ({
              no: r.no ? Number(r.no) : null,
              description: r.description,
              trans_date: r.trans_date || null,
              amount: Number(r.amount),
            }))
          })
        });
      } else {
        await fetchApi(`/debt-groups/${groupId}/payments/bulk`, {
          method: "POST",
          body: JSON.stringify({
            payments: validRows.map(r => ({
              description: r.description,
              payment_date: r.trans_date || null,
              amount: Number(r.amount),
            }))
          })
        });
      }
      onSuccess();
      onClose();
    } catch (e) {
      console.error(e);
      alert("Gagal menyimpan data bulk");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-3xl mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/30">
          <div className="flex items-center gap-2">
            <TableIcon className="w-5 h-5 text-brand" />
            <h3 className="font-bold text-lg">
              Bulk Insert — {type === "items" ? "Item Hutang" : "Pembayaran"}
            </h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-full transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto max-h-[60vh] overflow-y-auto p-4">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-muted text-muted-foreground">
                {type === "items" && <th className="px-3 py-2 text-left font-medium w-16">No</th>}
                <th className="px-3 py-2 text-left font-medium">Deskripsi *</th>
                <th className="px-3 py-2 text-left font-medium w-36">
                  {type === "items" ? "Tanggal" : "Tanggal Bayar"}
                </th>
                <th className="px-3 py-2 text-right font-medium w-36">Nominal *</th>
                <th className="w-10"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i} className="border-b border-border hover:bg-muted/20">
                  {type === "items" && (
                    <td className="px-2 py-1.5">
                      <input type="number" value={row.no} onChange={e => updateRow(i, "no", e.target.value)}
                        placeholder="No" className="w-full bg-background border border-border rounded px-2 py-1 text-sm" />
                    </td>
                  )}
                  <td className="px-2 py-1.5">
                    <input type="text" value={row.description} onChange={e => updateRow(i, "description", e.target.value)}
                      placeholder="Deskripsi..." className="w-full bg-background border border-border rounded px-2 py-1 text-sm min-w-[180px]" />
                  </td>
                  <td className="px-2 py-1.5">
                    <input type="date" value={row.trans_date} onChange={e => updateRow(i, "trans_date", e.target.value)}
                      className="w-full bg-background border border-border rounded px-2 py-1 text-sm" />
                  </td>
                  <td className="px-2 py-1.5">
                    <input type="number" value={row.amount} onChange={e => updateRow(i, "amount", e.target.value)}
                      placeholder="0" className="w-full bg-background border border-border rounded px-2 py-1 text-sm text-right" />
                  </td>
                  <td className="px-2 py-1.5 text-center">
                    <button onClick={() => removeRow(i)} className="text-muted-foreground hover:text-rose-500 transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-muted/20">
          <button onClick={addRow}
            className="flex items-center gap-2 px-3 py-1.5 border border-border bg-background rounded-lg text-sm hover:bg-muted transition-colors">
            <Plus className="w-4 h-4" /> Tambah Baris
          </button>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">{validRows.length} baris valid dari {rows.length}</span>
            <button onClick={onClose} className="px-4 py-2 border border-border bg-background rounded-lg text-sm hover:bg-muted transition-colors">
              Batal
            </button>
            <button onClick={handleSubmit} disabled={isSaving || !validRows.length}
              className="flex items-center gap-2 px-4 py-2 bg-brand text-brand-foreground rounded-lg text-sm font-medium hover:bg-brand/90 disabled:opacity-50 transition-colors">
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Simpan {validRows.length} Data
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────
export function DebtGroupDetail({ groupId, onBack }: { groupId: number; onBack: () => void }) {
  const [group, setGroup] = useState<DebtGroup | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingAll, setIsSavingAll] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState<"items" | "payments" | null>(null);

  // Track dirty state lifted from child rows
  const dirtyItemsRef = useRef<Map<number, DirtyItem>>(new Map());
  const dirtyPaymentsRef = useRef<Map<number, DirtyPayment>>(new Map());
  const [dirtyCount, setDirtyCount] = useState(0);

  // New Item State
  const [newItemNo, setNewItemNo] = useState("");
  const [newItemDesc, setNewItemDesc] = useState("");
  const [newItemDate, setNewItemDate] = useState("");
  const [newItemAmount, setNewItemAmount] = useState("");
  const [isAddingItem, setIsAddingItem] = useState(false);

  // New Payment State
  const [newPaymentDesc, setNewPaymentDesc] = useState("");
  const [newPaymentDate, setNewPaymentDate] = useState("");
  const [newPaymentAmount, setNewPaymentAmount] = useState("");
  const [isAddingPayment, setIsAddingPayment] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isImporting, setIsImporting] = useState(false);

  const fetchGroup = async () => {
    try {
      const res = await fetchApi<DebtGroup>(`/debt-groups/${groupId}`);
      setGroup(res);
      // Reset dirty state on refresh
      dirtyItemsRef.current.clear();
      dirtyPaymentsRef.current.clear();
      setDirtyCount(0);
    } catch (error) {
      console.error(error);
      alert("Gagal memuat detail grup hutang");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchGroup(); }, [groupId]);

  const handleItemDirty = (dirty: DirtyItem | null, id: number) => {
    if (dirty) {
      dirtyItemsRef.current.set(id, dirty);
    } else {
      dirtyItemsRef.current.delete(id);
    }
    setDirtyCount(dirtyItemsRef.current.size + dirtyPaymentsRef.current.size);
  };

  const handlePaymentDirty = (dirty: DirtyPayment | null, id: number) => {
    if (dirty) {
      dirtyPaymentsRef.current.set(id, dirty);
    } else {
      dirtyPaymentsRef.current.delete(id);
    }
    setDirtyCount(dirtyItemsRef.current.size + dirtyPaymentsRef.current.size);
  };

  const handleSaveAll = async () => {
    const dirtyItems = Array.from(dirtyItemsRef.current.values());
    const dirtyPayments = Array.from(dirtyPaymentsRef.current.values());
    if (!dirtyItems.length && !dirtyPayments.length) return;

    setIsSavingAll(true);
    try {
      const requests: Promise<any>[] = [];

      if (dirtyItems.length > 0) {
        requests.push(fetchApi(`/debt-groups/${groupId}/items/bulk`, {
          method: "PUT",
          body: JSON.stringify({
            items: dirtyItems.map(d => ({
              id: d.id,
              no: d.no ? Number(d.no) : null,
              description: d.description,
              trans_date: d.trans_date || null,
              amount: Number(d.amount),
            }))
          })
        }));
      }

      if (dirtyPayments.length > 0) {
        requests.push(fetchApi(`/debt-groups/${groupId}/payments/bulk`, {
          method: "PUT",
          body: JSON.stringify({
            payments: dirtyPayments.map(d => ({
              id: d.id,
              description: d.description,
              payment_date: d.payment_date || null,
              amount: Number(d.amount),
            }))
          })
        }));
      }

      await Promise.all(requests);
      fetchGroup();
    } catch (e) {
      console.error(e);
      alert("Gagal menyimpan perubahan");
    } finally {
      setIsSavingAll(false);
    }
  };

  const handleAddItem = async () => {
    if (!newItemDesc || !newItemAmount) return alert("Deskripsi dan Nominal wajib diisi");
    setIsAddingItem(true);
    try {
      await fetchApi(`/debt-groups/${groupId}/items`, {
        method: "POST",
        body: JSON.stringify({ no: newItemNo ? Number(newItemNo) : null, description: newItemDesc, trans_date: newItemDate || null, amount: Number(newItemAmount) })
      });
      setNewItemNo(""); setNewItemDesc(""); setNewItemDate(""); setNewItemAmount("");
      fetchGroup();
    } catch (e) { console.error(e); alert("Gagal menambahkan item"); }
    finally { setIsAddingItem(false); }
  };

  const handleAddPayment = async () => {
    if (!newPaymentDesc || !newPaymentAmount) return alert("Deskripsi dan Nominal wajib diisi");
    setIsAddingPayment(true);
    try {
      await fetchApi(`/debt-groups/${groupId}/payments`, {
        method: "POST",
        body: JSON.stringify({ description: newPaymentDesc, payment_date: newPaymentDate || null, amount: Number(newPaymentAmount) })
      });
      setNewPaymentDesc(""); setNewPaymentDate(""); setNewPaymentAmount("");
      fetchGroup();
    } catch (e) { console.error(e); alert("Gagal menambahkan pembayaran"); }
    finally { setIsAddingPayment(false); }
  };

  const handleDeleteItem = async (itemId: number) => {
    if (!window.confirm("Hapus item ini?")) return;
    try {
      await fetchApi(`/debt-groups/${groupId}/items/${itemId}`, { method: "DELETE" });
      fetchGroup();
    } catch (e) { console.error(e); alert("Gagal menghapus item"); }
  };

  const handleDeletePayment = async (paymentId: number) => {
    if (!window.confirm("Hapus pembayaran ini?")) return;
    try {
      await fetchApi(`/debt-groups/${groupId}/payments/${paymentId}`, { method: "DELETE" });
      fetchGroup();
    } catch (e) { console.error(e); alert("Gagal menghapus pembayaran"); }
  };

  const handleExportExcel = () => {
    if (!group) return;
    setIsSavingAll(true);
    try {
      const url = `${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api"}/debt-groups/${groupId}/export`;
      const a = document.createElement("a");
      a.href = url;
      a.download = `${group.name.replace(/\s+/g, "_")}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (e) {
      console.error(e);
      alert("Gagal mengunduh file Excel");
    } finally {
      setIsSavingAll(false);
    }
  };

  const handleDownloadTemplate = () => {
    handleExportExcel();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    setIsImporting(true);
    try {
      await fetchApi(`/debt-groups/${groupId}/import`, {
        method: "POST",
        body: formData,
      });
      alert("Import berhasil!");
      fetchGroup();
    } catch (error) {
      console.error(error);
      alert("Gagal mengimpor data. Pastikan format sesuai template.");
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-brand" />
      </div>
    );
  }
  if (!group) return <div>Grup tidak ditemukan</div>;

  return (
    <>
      {showBulkModal && (
        <BulkInsertModal
          groupId={groupId}
          type={showBulkModal}
          onClose={() => setShowBulkModal(null)}
          onSuccess={fetchGroup}
        />
      )}

      <div className="space-y-4">
        {/* Header */}
        <div className="flex flex-wrap items-center gap-3">
          <button onClick={onBack} className="p-2 hover:bg-muted rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-2xl font-bold tracking-tight uppercase flex-1">{group.name}</h2>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <button onClick={() => setShowBulkModal("items")}
              className="flex items-center gap-2 px-3 py-2 border border-border bg-background rounded-lg text-sm hover:bg-muted transition-colors">
              <TableIcon className="w-4 h-4" /> Bulk Item
            </button>
            <button onClick={() => setShowBulkModal("payments")}
              className="flex items-center gap-2 px-3 py-2 border border-border bg-[#92D050]/20 text-black dark:text-foreground rounded-lg text-sm hover:bg-[#92D050]/40 transition-colors">
              <TableIcon className="w-4 h-4" /> Bulk Pembayaran
            </button>
            <button onClick={handleDownloadTemplate}
              className="flex items-center gap-2 px-3 py-2 border border-border bg-background rounded-lg text-sm hover:bg-muted transition-colors">
              <Download className="w-4 h-4 text-brand" /> Template
            </button>
            <button onClick={() => fileInputRef.current?.click()} disabled={isImporting}
              className="flex items-center gap-2 px-3 py-2 border border-border bg-background rounded-lg text-sm hover:bg-muted transition-colors disabled:opacity-50">
              {isImporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4 text-brand" />}
              Import CSV
            </button>
            <input 
              type="file" 
              accept=".csv,.xlsx" 
              ref={fileInputRef} 
              className="hidden" 
              onChange={handleFileChange} 
            />
            <button onClick={handleExportExcel} disabled={isSavingAll}
              className="flex items-center gap-2 px-3 py-2 border border-border bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50">
              {isSavingAll && !dirtyCount ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileSpreadsheet className="w-4 h-4" />}
              Export Excel
            </button>
            {dirtyCount > 0 && (
              <button onClick={handleSaveAll} disabled={isSavingAll}
                className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg text-sm font-semibold hover:bg-amber-600 disabled:opacity-50 transition-colors shadow-md">
                {isSavingAll
                  ? <Loader2 className="w-4 h-4 animate-spin" />
                  : <CheckSquare className="w-4 h-4" />}
                Simpan Semua ({dirtyCount})
              </button>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="bg-card border border-border shadow-sm rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-amber-400 text-black border-b border-black">
                  <th className="border-r border-black px-4 py-2 w-16 text-center font-bold">NO</th>
                  <th className="border-r border-black px-4 py-2 text-left font-bold uppercase">{group.name}</th>
                  <th className="border-r border-black px-4 py-2 w-36 text-center font-bold">TANGGAL</th>
                  <th className="border-r border-black px-4 py-2 w-48 text-right font-bold">NOMINAL</th>
                  <th className="px-4 py-2 w-16 text-center font-bold">AKSI</th>
                </tr>
              </thead>
              <tbody>
                {/* --- ITEMS --- */}
                {group.items?.map((item) => (
                  <EditableItemRow
                    key={item.id}
                    item={item}
                    onDirtyChange={(dirty) => handleItemDirty(dirty, item.id)}
                    onDelete={handleDeleteItem}
                  />
                ))}

                {/* New Item Row */}
                <tr className="border-b-2 border-black bg-muted/10">
                  <td className="border-r border-black/20 px-2 py-2">
                    <input type="number" value={newItemNo} onChange={e => setNewItemNo(e.target.value)} placeholder="No"
                      className="w-full bg-background border border-border rounded px-2 py-1 text-sm min-w-[45px]" />
                  </td>
                  <td className="border-r border-black/20 px-2 py-2">
                    <input type="text" value={newItemDesc} onChange={e => setNewItemDesc(e.target.value)} placeholder="Deskripsi Hutang Baru..."
                      className="w-full bg-background border border-border rounded px-2 py-1 text-sm min-w-[200px]" />
                  </td>
                  <td className="border-r border-black/20 px-2 py-2">
                    <input type="date" value={newItemDate} onChange={e => setNewItemDate(e.target.value)}
                      className="w-full bg-background border border-border rounded px-2 py-1 text-sm" />
                  </td>
                  <td className="border-r border-black/20 px-2 py-2">
                    <input type="number" value={newItemAmount} onChange={e => setNewItemAmount(e.target.value)} placeholder="Nominal"
                      className="w-full bg-background border border-border rounded px-2 py-1 text-sm text-right min-w-[130px]" />
                  </td>
                  <td className="px-2 py-2 text-center">
                    <button onClick={handleAddItem} disabled={isAddingItem || !newItemDesc || !newItemAmount}
                      className="bg-foreground text-background rounded p-1.5 hover:opacity-90 disabled:opacity-50 mx-auto">
                      {isAddingItem ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                    </button>
                  </td>
                </tr>

                {/* Total Hutang */}
                <tr className="bg-yellow-300 text-black border-b border-black font-bold">
                  <td colSpan={3} className="border-r border-black px-4 py-2 text-center uppercase">TOTAL HUTANG</td>
                  <td className="border-r border-black px-4 py-2 text-right text-base">Rp {Number(group.total_amount).toLocaleString('id-ID')}</td>
                  <td></td>
                </tr>

                {/* --- PAYMENTS --- */}
                {group.payments?.map((payment) => (
                  <EditablePaymentRow
                    key={payment.id}
                    payment={payment}
                    onDirtyChange={(dirty) => handlePaymentDirty(dirty, payment.id)}
                    onDelete={handleDeletePayment}
                  />
                ))}

                {/* New Payment Row */}
                <tr className="bg-[#92D050]/40 border-b border-black">
                  <td colSpan={2} className="border-r border-black px-2 py-2">
                    <input type="text" value={newPaymentDesc} onChange={e => setNewPaymentDesc(e.target.value)} placeholder="Deskripsi Pembayaran Baru..."
                      className="w-full bg-background text-foreground border border-border rounded px-2 py-1 text-sm min-w-[200px]" />
                  </td>
                  <td className="border-r border-black px-2 py-2">
                    <input type="date" value={newPaymentDate} onChange={e => setNewPaymentDate(e.target.value)}
                      className="w-full bg-background text-foreground border border-border rounded px-2 py-1 text-sm" />
                  </td>
                  <td className="border-r border-black px-2 py-2">
                    <input type="number" value={newPaymentAmount} onChange={e => setNewPaymentAmount(e.target.value)} placeholder="Nominal Bayar"
                      className="w-full bg-background text-foreground border border-border rounded px-2 py-1 text-sm text-right min-w-[130px]" />
                  </td>
                  <td className="px-2 py-2 text-center">
                    <button onClick={handleAddPayment} disabled={isAddingPayment || !newPaymentDesc || !newPaymentAmount}
                      className="bg-foreground text-background rounded p-1.5 hover:opacity-90 disabled:opacity-50 mx-auto">
                      {isAddingPayment ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                    </button>
                  </td>
                </tr>

                {/* Sisa Hutang */}
                <tr className="bg-background text-foreground font-bold">
                  <td colSpan={3} className="border-r border-black px-4 py-3 text-center uppercase">SISA HUTANG</td>
                  <td className="border-r border-black px-4 py-3 text-right text-rose-500 text-lg">Rp {Number(group.remaining_amount).toLocaleString('id-ID')}</td>
                  <td></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
