"use client";

import { Loader2 } from "lucide-react";
import { useState } from "react";
import { Project } from "@/types/transaction";

interface NewProjectRowProps {
  onAdd: (data: Omit<Project, "id">) => Promise<void>;
}

export function NewProjectRow({ onAdd }: NewProjectRowProps) {
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [rabDate, setRabDate] = useState("");
  const [status, setStatus] = useState<"aktif" | "nonaktif">("aktif");
  const [isIsolatedCash, setIsIsolatedCash] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!name) return alert("Nama project wajib diisi");
    setIsSubmitting(true);
    try {
      await onAdd({
        name,
        location: location || null,
        rab_date: rabDate || null,
        status,
        is_isolated_cash: isIsolatedCash,
      });
      setName("");
      setLocation("");
      setRabDate("");
      setStatus("aktif");
      setIsIsolatedCash(false);
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
        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Lokasi..."
          className="w-full bg-background border border-border rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand/50"
        />
      </td>
      <td className="px-4 py-3">
        <input
          type="date"
          value={rabDate}
          onChange={(e) => setRabDate(e.target.value)}
          className="w-full bg-background border border-border rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand/50"
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
      <td className="px-4 py-3 text-center">
        <label className="relative inline-flex items-center cursor-pointer" title="Kas Mandiri — transaksi project ini terpisah total dari Kas Buku Besar kantor, tidak akan pernah tergabung ke saldo kantor">
          <input
            type="checkbox"
            className="sr-only peer"
            checked={isIsolatedCash}
            onChange={(e) => setIsIsolatedCash(e.target.checked)}
          />
          <div className="w-9 h-5 bg-border/50 hover:bg-border peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-brand/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-border after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand"></div>
        </label>
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
