'use client';

import { useState } from 'react';
import { Loader2, Plus } from 'lucide-react';
import { rapService } from '@/lib/services/rapService';

interface AddRapCategoryFormProps {
  projectId: number | string;
  onRefresh: () => Promise<void>;
  parentId?: number | null;
  level?: number;
}

export function AddRapCategoryForm({ projectId, onRefresh, parentId = null, level = 0 }: AddRapCategoryFormProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getLabels = () => {
    switch (level) {
      case 0:
        return {
          button: 'Tambah Area / Lantai',
          placeholderName: 'Nama Area (misal: LANTAI 1)',
        };
      case 1:
        return {
          button: 'Tambah Kategori Pekerjaan',
          placeholderName: 'Nama Kategori (misal: PEKERJAAN PERSIAPAN)',
        };
      case 2:
      default:
        return {
          button: 'Tambah Subkategori',
          placeholderName: 'Nama Subkategori (misal: Plafon Teras)',
        };
    }
  };

  const labels = getLabels();

  const handleSubmit = async () => {
    if (!name.trim()) return alert('Nama wajib diisi');
    setIsSubmitting(true);
    try {
      await rapService.createCategory(projectId, {
        code: code.trim() || undefined,
        name: name.trim(),
        parent_id: parentId,
      });
      setCode('');
      setName('');
      setIsAdding(false);
      await onRefresh();
    } catch (e: any) {
      console.error(e);
      alert(e?.message || 'Gagal menambahkan data');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAdding) {
    return (
      <tr>
        <td colSpan={9} className="px-4 py-2 border-x border-border/50 text-center bg-muted/10">
          <button
            onClick={() => setIsAdding(true)}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            {labels.button}
          </button>
        </td>
      </tr>
    );
  }

  return (
    <tr className="bg-blue-50/50 dark:bg-blue-950/20">
      <td colSpan={9} className="px-4 py-3 border-x border-border/50">
        <div className="flex items-center gap-3 justify-center">
          <div className="flex items-center gap-2">
            {level === 1 && (
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Kode (A, B...)"
                className="w-24 bg-background border border-border rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            )}
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={labels.placeholderName}
              className="w-64 bg-background border border-border rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              autoFocus
            />
          </div>
          <div className="flex gap-1.5">
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
            >
              {isSubmitting ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Simpan'}
            </button>
            <button
              onClick={() => setIsAdding(false)}
              disabled={isSubmitting}
              className="px-3 py-1 text-sm font-medium text-muted-foreground bg-muted hover:bg-muted/80 rounded transition-colors disabled:opacity-50"
            >
              Batal
            </button>
          </div>
        </div>
      </td>
    </tr>
  );
}
