"use client";

import { Loader2, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Project } from "@/types/transaction";

interface EditableProjectRowProps {
  project: Project;
  onUpdate: (id: number, data: Partial<Project>) => Promise<void>;
  onChange?: (id: number, data: Partial<Project>) => void;
  onSaved?: (id: number) => void;
  isPending?: boolean;
  onDelete: (id: number) => Promise<void>;
}

export function EditableProjectRow({ project, onUpdate, onChange, onSaved, onDelete, isPending }: EditableProjectRowProps) {
  const [name, setName] = useState(project.name);
  const [location, setLocation] = useState(project.location ?? "");
  const [rabDate, setRabDate] = useState(project.rab_date ?? "");
  const [status, setStatus] = useState<"aktif" | "nonaktif">(
    project.status === "nonaktif" ? "nonaktif" : "aktif"
  );
  const [isIsolatedCash, setIsIsolatedCash] = useState(project.is_isolated_cash ?? false);
  
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const notifyChange = (changes: Partial<Project>) => {
    if (onChange) {
      onChange(project.id, changes);
    }
  };

  const handleToggleIsolatedCash = (checked: boolean) => {
    const action = checked ? "MENGAKTIFKAN" : "MENONAKTIFKAN";
    const warnMessage = checked
      ? "PERINGATAN PENTING:\n\nJika project ini sudah punya transaksi Kas sebelumnya, transaksi LAMA tersebut TIDAK akan ikut pindah. Hanya transaksi BARU yang akan tersimpan terpisah dari Kas Buku Besar.\n\nLanjutkan MENGAKTIFKAN Kas Mandiri?"
      : "PERINGATAN PENTING:\n\nJika project ini sudah punya transaksi Kas Mandiri, data LAMA tersebut TIDAK otomatis pindah ke Kas Buku Besar dan akan tertinggal.\n\nLanjutkan MENONAKTIFKAN Kas Mandiri?";

    if (!window.confirm(warnMessage)) return;

    setIsIsolatedCash(checked);
    notifyChange({ is_isolated_cash: checked });
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onUpdate(project.id, {
        name,
        location,
        rab_date: rabDate || null,
        status,
        is_isolated_cash: isIsolatedCash,
      });
      if (onSaved) {
        onSaved(project.id);
      }
    } catch (e) {
      console.error(e);
      alert("Gagal memperbarui project");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus project ini?")) return;
    setIsDeleting(true);
    try {
      await onDelete(project.id);
    } catch (e) {
      console.error(e);
      alert("Gagal menghapus project");
      setIsDeleting(false);
    }
  };

  return (
    <tr className="bg-card hover:bg-muted/50 transition-colors text-foreground">
      <td className="px-4 py-3 font-medium text-xs text-muted-foreground text-center">{project.id}</td>
      <td className="px-4 py-3">
        <input
          type="text"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            notifyChange({ name: e.target.value });
          }}
          placeholder="Nama Project..."
          className="w-full min-w-[200px] bg-background border border-border rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand/50"
        />
      </td>
      <td className="px-4 py-3">
        <input
          type="text"
          value={location}
          onChange={(e) => {
            setLocation(e.target.value);
            notifyChange({ location: e.target.value });
          }}
          placeholder="Lokasi..."
          className="w-full bg-background border border-border rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand/50"
        />
      </td>
      <td className="px-4 py-3">
        <input
          type="date"
          value={rabDate}
          onChange={(e) => {
            setRabDate(e.target.value);
            notifyChange({ rab_date: e.target.value || null });
          }}
          className="w-full bg-background border border-border rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand/50"
        />
      </td>
      <td className="px-4 py-3">
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value as "aktif" | "nonaktif");
            notifyChange({ status: e.target.value as "aktif" | "nonaktif" });
          }}
          className="w-full bg-background border border-border rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand/50"
        >
          <option value="aktif">Aktif</option>
          <option value="nonaktif">Non-aktif</option>
        </select>
      </td>
      <td className="px-4 py-3 text-center">
        <label className="relative inline-flex items-center cursor-pointer" title="Kas Mandiri — transaksi project ini terpisah total dari Kas Buku Besar kantor, tidak akan pernah tergabung ke saldo kantor">
          <input
            type="checkbox"
            className="sr-only peer"
            checked={isIsolatedCash}
            onChange={(e) => handleToggleIsolatedCash(e.target.checked)}
          />
          <div className="w-9 h-5 bg-border/50 hover:bg-border peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-brand/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-border after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand"></div>
        </label>
      </td>
      <td className="px-4 py-3 text-right">
        <div className="flex flex-col md:flex-row items-end md:items-center justify-end gap-1">
          {isPending && (
            <span className="text-xs text-amber-600">Perubahan belum disimpan</span>
          )}
          <button
            onClick={handleSave}
            disabled={isSaving || isDeleting}
            className="px-3 py-1.5 text-xs font-medium text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 rounded-md transition-colors disabled:opacity-50"
          >
            {isSaving ? <Loader2 className="w-3 h-3 animate-spin" /> : "Simpan"}
          </button>
          <a
            href={`/dashboard/projects/${project.id}`}
            className="px-3 py-1.5 text-xs font-medium text-brand bg-brand/10 dark:bg-brand/20 dark:text-brand-300 hover:bg-brand/20 dark:hover:bg-brand/30 rounded-md transition-colors flex items-center justify-center"
          >
            Buka
          </a>
          <button
            onClick={handleDelete}
            disabled={isSaving || isDeleting}
            className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-md transition-colors disabled:opacity-50"
          >
            {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
          </button>
        </div>
      </td>
    </tr>
  );
}
