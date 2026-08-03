'use client';

import React, { useState } from 'react';
import { RabCategory, RabItem } from '@/types/rab';
import { formatCurrency } from '@/utils/formatters';
import { Edit2, Trash2, Loader2, ListTodo } from 'lucide-react';
import { AddItemRow } from './AddItemRow';
import { EditItemRow } from './EditItemRow';
import { ProgressReportPanel } from './ProgressReportPanel';
import { rabService } from '@/lib/services/rabService';
import { AddCategoryForm } from './AddCategoryForm';

interface RabCategorySectionProps {
  category: RabCategory;
  depth?: number;
  onRefresh: () => Promise<void>;
  projectId: number | string;
}

export function RabCategorySection({
  category,
  depth = 0,
  onRefresh,
  projectId,
}: RabCategorySectionProps) {
  const [isEditingCategory, setIsEditingCategory] = useState(false);
  const [catCode, setCatCode] = useState(category.code || '');
  const [catName, setCatName] = useState(category.name);
  const [isSavingCat, setIsSavingCat] = useState(false);
  const [isDeletingCat, setIsDeletingCat] = useState(false);

  const [editingItemId, setEditingItemId] = useState<number | null>(null);
  const [reportItemId, setReportItemId] = useState<number | null>(null);

  const handleSaveCategory = async () => {
    if (!catName.trim()) return;
    setIsSavingCat(true);
    try {
      await rabService.updateCategory(category.id, {
        code: catCode.trim() || undefined,
        name: catName.trim(),
      });
      await onRefresh();
      setIsEditingCategory(false);
    } catch (e: any) {
      alert(e?.message || 'Gagal menyimpan kategori');
    } finally {
      setIsSavingCat(false);
    }
  };

  const handleDeleteCategory = async () => {
    if (!window.confirm(`Yakin ingin menghapus kategori "${category.name}"? Semua item dan sub-kategori di dalamnya akan ikut terhapus.`)) return;
    setIsDeletingCat(true);
    try {
      await rabService.deleteCategory(category.id);
      await onRefresh();
    } catch (e: any) {
      alert(e?.message || 'Gagal menghapus kategori');
    } finally {
      setIsDeletingCat(false);
    }
  };

  // Calculate total Rekapitulasi (items + children)
  const calculateTotalRecursively = (cat: RabCategory): number => {
    const itemsTotal = cat.items.reduce((sum, item) => sum + (item.status !== 'dikurangi' ? item.total_price : 0), 0);
    const childrenTotal = cat.children.reduce((sum, child) => sum + calculateTotalRecursively(child), 0);
    return itemsTotal + childrenTotal;
  };
  const categoryTotal = calculateTotalRecursively(category);

  // Render Category Row based on depth
  const renderCategoryRow = () => {
    if (depth === 0) {
      // Area / Lantai (Yellow row, colspan 10)
      return (
        <tr className="bg-yellow-300 dark:bg-yellow-500/80 font-bold border-y border-border group">
          <td colSpan={10} className="px-3 py-1.5 border-x border-border/50 text-center text-black dark:text-white uppercase relative">
            {isEditingCategory ? (
              <div className="flex items-center justify-center gap-2 max-w-sm mx-auto">
                <input
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  placeholder="Nama Area/Lantai (Contoh: LANTAI 1)"
                  className="w-full px-2 py-1 text-xs border rounded bg-background text-foreground"
                />
                <button onClick={handleSaveCategory} disabled={isSavingCat} className="text-emerald-700 bg-emerald-100 px-2 py-1 rounded text-xs">
                  {isSavingCat ? <Loader2 className="w-3 h-3 animate-spin" /> : "Simpan"}
                </button>
                <button onClick={() => setIsEditingCategory(false)} className="text-muted-foreground bg-white/50 px-2 py-1 rounded text-xs">
                  Batal
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-4">
                <span>{category.name}</span>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center absolute right-4 top-1/2 -translate-y-1/2">
                  <button onClick={() => setIsEditingCategory(true)} className="p-1 text-blue-800 hover:bg-white/20 rounded">
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={handleDeleteCategory} disabled={isDeletingCat} className="p-1 text-rose-700 hover:bg-white/20 rounded">
                    {isDeletingCat ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            )}
          </td>
        </tr>
      );
    }

    // Kategori Pekerjaan (Depth 1) atau Subkategori (Depth 2+)
    const isDepth1 = depth === 1;
    return (
      <tr className={`border-y border-border group ${isDepth1 ? 'font-bold bg-muted/40' : 'font-bold bg-muted/10'}`}>
        <td className="px-3 py-1.5 border-x border-border/50 text-center">{category.code || ''}</td>
        <td colSpan={9} className="px-3 py-1.5 border-r border-border/50 relative">
          {isEditingCategory ? (
            <div className="flex items-center gap-2 max-w-sm">
              <input
                value={catCode}
                onChange={(e) => setCatCode(e.target.value)}
                placeholder="Kode"
                className="w-12 px-2 py-1 text-xs border rounded bg-background"
              />
              <input
                value={catName}
                onChange={(e) => setCatName(e.target.value)}
                placeholder="Nama Kategori/Subkategori"
                className="flex-1 px-2 py-1 text-xs border rounded bg-background"
              />
              <button onClick={handleSaveCategory} disabled={isSavingCat} className="text-emerald-600 px-2 py-1 rounded text-xs hover:bg-emerald-50">
                {isSavingCat ? <Loader2 className="w-3 h-3 animate-spin" /> : "Simpan"}
              </button>
              <button onClick={() => setIsEditingCategory(false)} className="text-muted-foreground px-2 py-1 rounded text-xs hover:bg-muted">
                Batal
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <span className={isDepth1 ? 'uppercase' : 'capitalize italic'}>{category.name}</span>
              <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center pr-2">
                <button onClick={() => setIsEditingCategory(true)} className="p-1 text-blue-600 hover:bg-background rounded">
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button onClick={handleDeleteCategory} disabled={isDeletingCat} className="p-1 text-rose-600 hover:bg-background rounded">
                  {isDeletingCat ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          )}
        </td>
      </tr>
    );
  };

  return (
    <React.Fragment>
      {renderCategoryRow()}

      {/* Items */}
      {category.items.map((item, idx) => {
        if (editingItemId === item.id) {
          return (
            <EditItemRow
              key={item.id}
              item={item}
              idx={idx}
              onRefresh={onRefresh}
              onCancel={() => setEditingItemId(null)}
            />
          );
        }

        return (
          <React.Fragment key={item.id}>
            <tr className="border-b border-border/30 hover:bg-muted/10 group">
              <td className="px-3 py-1.5 border-x border-border/50 text-center text-xs align-top pt-2.5">
                {idx + 1}
              </td>
              <td className="px-3 py-1.5 border-r border-border/50 text-xs align-top pt-2.5">
                <div className="flex items-start justify-between">
                  <div>
                    {item.description}
                    {item.status === 'dikurangi' && (
                      <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-medium bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400">
                        Dikurangi
                      </span>
                    )}
                  </div>
                  {/* Item Actions */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => setEditingItemId(item.id)}
                      className="p-1 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded"
                      title="Edit Item"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                    {item.status === 'aktif' && (
                      <button
                        onClick={() => setReportItemId(reportItemId === item.id ? null : item.id)}
                        className="p-1 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded"
                        title="Laporan Progress"
                      >
                        <ListTodo className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              </td>
              <td className="px-3 py-1.5 border-r border-border/50 text-right text-xs align-top pt-2.5">
                {item.volume}
              </td>
              <td className="px-3 py-1.5 border-r border-border/50 text-center text-xs align-top pt-2.5">
                {item.unit}
              </td>
              <td className="px-3 py-1.5 border-r border-border/50 text-right text-xs align-top pt-2.5 tabular-nums">
                {item.unit_price > 0 ? formatCurrency(item.unit_price).replace('Rp', '').trim() : '-'}
              </td>
              {/* Jumlah Harga Rp */}
              <td className="px-3 py-1.5 border-r border-border/50 text-right text-xs align-top pt-2.5 tabular-nums font-medium">
                {item.total_price > 0 ? formatCurrency(item.total_price).replace('Rp', '').trim() : '-'}
              </td>
              {/* Rekapitulasi Rp (Empty for items) */}
              <td className="px-3 py-1.5 border-r border-border/50 text-right text-xs align-top pt-2.5 bg-yellow-50/10">
                -
              </td>
              {/* Bobot % */}
              <td className="px-3 py-1.5 border-r border-border/50 text-center text-xs align-top pt-2.5">
                {item.bobot_percentage.toFixed(2)}%
              </td>
              {/* Progress % */}
              <td className="px-3 py-1.5 border-r border-border/50 text-center text-xs align-top pt-2.5 bg-blue-50/20">
                <span className="font-semibold text-blue-700 dark:text-blue-300">
                  {item.latest_progress_percentage}%
                </span>
              </td>
              {/* Total % */}
              <td className="px-3 py-1.5 border-r border-border/50 text-center text-xs align-top pt-2.5">
                {item.total_percentage.toFixed(2)}%
              </td>
            </tr>
            {/* Progress Report Panel */}
            {reportItemId === item.id && (
              <ProgressReportPanel
                item={item}
                onRefresh={onRefresh}
                onClose={() => setReportItemId(null)}
              />
            )}
          </React.Fragment>
        );
      })}

      {/* Add Item Form (Only if depth > 0, we don't want standalone items at Root Level typically, but it's safe to render if needed) */}
      {depth > 0 && <AddItemRow categoryId={category.id} onRefresh={onRefresh} />}

      {/* Sub Categories */}
      {category.children.map((child) => (
        <RabCategorySection
          key={child.id}
          category={child}
          depth={depth + 1}
          onRefresh={onRefresh}
          projectId={projectId}
        />
      ))}

      {/* Subtotal Row (Hanya ditampilkan pada Depth 1 sesuai struktur) */}
      {depth === 1 && (
        <tr className="font-bold border-y-2 border-border bg-muted/20 text-xs">
          <td colSpan={5} className="px-3 py-2 border-x border-border/50 text-right">
            Jumlah {category.code || category.name}
          </td>
          <td className="px-3 py-2 border-r border-border/50 text-right">-</td>
          {/* Rekapitulasi Rp (Total dari semua child dan items di kedalaman ini) */}
          <td className="px-3 py-2 border-r border-border/50 text-right tabular-nums bg-yellow-50/50">
            {formatCurrency(categoryTotal).replace('Rp', '').trim()}
          </td>
          <td className="px-3 py-2 border-r border-border/50 text-center text-muted-foreground">
            {category.total_bobot_percentage.toFixed(2)}%
          </td>
          <td className="px-3 py-2 border-r border-border/50 text-center">
            {/* Optional Prog if needed */}
          </td>
          <td className="px-3 py-2 border-r border-border/50 text-center">
            {/* Optional Total if needed */}
          </td>
        </tr>
      )}

      {/* Add Sub Category Form 
          Depth 0: Allow adding Depth 1 (Kategori Pekerjaan)
          Depth 1: Allow adding Depth 2 (Subkategori) */}
      {depth <= 1 && (
        <AddCategoryForm projectId={projectId} parentId={category.id} onRefresh={onRefresh} level={depth + 1} />
      )}
    </React.Fragment>
  );
}
