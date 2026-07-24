"use client";

import { Loader2 } from "lucide-react";
import { useState } from "react";
import { Project } from "@/types/transaction";

interface NewProjectRowProps {
  onAdd: (data: Omit<Project, "id">) => Promise<void>;
}

export function NewProjectRow({ onAdd }: NewProjectRowProps) {
  const [name, setName] = useState("");
  const [status, setStatus] = useState<"aktif" | "nonaktif">("aktif");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!name) return alert("Nama project wajib diisi");
    setIsSubmitting(true);
    try {
      await onAdd({
        name,
        status,
      });
      setName("");
      setStatus("aktif");
    } catch (e) {
      console.error(e);
      alert("Gagal menambahkan project");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <tr className="bg-muted/20 border-b-2 border-border text-foreground">
      <td className="px-4 py-3 font-medium text-xs text-muted-foreground text-center">BARU</td>
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
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="px-3.5 py-1.5 bg-foreground text-background rounded-lg text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Tambah"}
        </button>
      </td>
    </tr>
  );
}
