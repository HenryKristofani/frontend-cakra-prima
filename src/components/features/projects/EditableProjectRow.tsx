"use client";

import { Loader2, Trash2 } from "lucide-react";
import { useState } from "react";
import { Project } from "@/types/transaction";

interface EditableProjectRowProps {
  project: Project;
  onUpdate: (id: number, data: Partial<Project>) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}

export function EditableProjectRow({ project, onUpdate, onDelete }: EditableProjectRowProps) {
  const [name, setName] = useState(project.name);
  const [status, setStatus] = useState<"aktif" | "nonaktif">(
    project.status === "nonaktif" ? "nonaktif" : "aktif"
  );
  
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onUpdate(project.id, {
        name,
        status,
      });
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
          onChange={(e) => setName(e.target.value)}
          placeholder="Nama Project..."
          className="w-full min-w-[200px] bg-background border border-border rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand/50"
        />
      </td>
      <td className="px-4 py-3">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as "aktif" | "nonaktif")}
          className="w-full bg-background border border-border rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand/50"
        >
          <option value="aktif">Aktif</option>
          <option value="nonaktif">Non-aktif</option>
        </select>
      </td>
      <td className="px-4 py-3 text-right">
        <div className="flex items-center justify-end gap-1">
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
