'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { RapCategory, RapItem } from '@/types/rap';
import { formatCurrency } from '@/utils/formatters';
import { Edit2, Trash2, Loader2, Plus, Save, AlertCircle } from 'lucide-react';
import { rapService } from '@/lib/services/rapService';
import Decimal from 'decimal.js';
import { AddRapCategoryForm } from './AddRapCategoryForm';
import { RapDraftItemRow, RapDraftItem } from './RapDraftItemRow';
import { RapExistingItemRow, RapDirtyItemState, RapSyncStatus } from './RapExistingItemRow';

interface RapCategorySectionProps {
  category: RapCategory;
  depth?: number;
  pajakPct: number;
  syncStatuses?: Record<string, RapSyncStatus>;
  onRefresh: () => Promise<void>;
  projectId: number | string;
  onDirtyChange?: (categoryId: number, hasDirty: boolean) => void;
}

let draftKeyCounter = 0;
function newDraftKey() {
  return `draft_${++draftKeyCounter}`;
}

function newDraft(): RapDraftItem {
  return {
    _key: newDraftKey(),
    description: '',
    volume: '',
    unit: 'm2',
    unit_price: '',
  };
}

export function RapCategorySection({
  category,
  depth = 0,
  pajakPct,
  syncStatuses = {},
  onRefresh,
  projectId,
  onDirtyChange,
}: RapCategorySectionProps) {
  // Category edit state
  const [isEditingCategory, setIsEditingCategory] = useState(false);
  const [catCode, setCatCode] = useState(category.code || '');
  const [catName, setCatName] = useState(category.name);
  const [isSavingCat, setIsSavingCat] = useState(false);
  const [isDeletingCat, setIsDeletingCat] = useState(false);

  // Draft state (new items)
  const [draftItems, setDraftItems] = useState<RapDraftItem[]>([]);

  // Dirty state (existing items)
  const [dirtyItems, setDirtyItems] = useState<Map<number, RapDirtyItemState>>(new Map());

  const [isSavingBulk, setIsSavingBulk] = useState(false);
  const [bulkError, setBulkError] = useState<string | null>(null);

  const hasUnsavedChanges = draftItems.length > 0 || dirtyItems.size > 0;

  useEffect(() => {
    onDirtyChange?.(category.id, hasUnsavedChanges);
  }, [hasUnsavedChanges, category.id, onDirtyChange]);

  // Handlers: Draft items
  const handleAddDraftRow = useCallback(() => {
    setDraftItems((prev) => [...prev, newDraft()]);
  }, []);

  const handleDraftChange = useCallback((key: string, field: keyof RapDraftItem, value: string) => {
    setDraftItems((prev) =>
      prev.map((d) =>
        d._key === key
          ? { ...d, [field]: value, errors: d.errors ? { ...d.errors, [field]: '' } : undefined }
          : d,
      ),
    );
  }, []);

  const handleRemoveDraft = useCallback((key: string) => {
    setDraftItems((prev) => prev.filter((d) => d._key !== key));
  }, []);

  // Handlers: Dirty items
  const handleDirtyChange = useCallback((item: RapItem, field: keyof RapDirtyItemState, value: string) => {
    setDirtyItems((prev) => {
      let existing = prev.get(item.id);
      if (!existing) {
        existing = {
          description: item.description,
          volume: item.volume.toString(),
          unit: item.unit,
          unit_price: item.unit_price.toString(),
        };
      }
      const next = new Map(prev);
      next.set(item.id, {
        ...existing,
        [field]: value,
        errors: existing.errors ? { ...existing.errors, [field]: '' } : undefined,
      });
      return next;
    });
  }, []);

  const handleRevertDirty = useCallback((itemId: number) => {
    setDirtyItems((prev) => {
      const next = new Map(prev);
      next.delete(itemId);
      return next;
    });
  }, []);

  // Bulk Save
  const handleBulkSave = async () => {
    if (!hasUnsavedChanges) return;
    setIsSavingBulk(true);
    setBulkError(null);

    try {
      // 1. Bulk CREATE (draft items)
      if (draftItems.length > 0) {
        const payload = draftItems.map((d) => ({
          description: d.description,
          volume: parseFloat(d.volume) || 0,
          unit: d.unit,
          unit_price: parseFloat(d.unit_price) || 0,
        }));

        try {
          await rapService.bulkCreateItems(category.id, payload);
          setDraftItems([]);
        } catch (err: any) {
          if (err?.errors) {
            const updatedDrafts = [...draftItems];
            Object.entries(err.errors as Record<string, string[]>).forEach(([key, messages]) => {
              const match = key.match(/^items\.(\d+)\.(.+)$/);
              if (match) {
                const idx = parseInt(match[1], 10);
                const field = match[2] as keyof RapDraftItem;
                if (updatedDrafts[idx]) {
                  updatedDrafts[idx] = {
                    ...updatedDrafts[idx],
                    errors: {
                      ...(updatedDrafts[idx].errors || {}),
                      [field]: messages[0],
                    },
                  };
                }
              }
            });
            setDraftItems(updatedDrafts);
            setBulkError('Beberapa item baru gagal disimpan. Periksa error di baris yang ditandai.');
            return;
          }
          throw err;
        }
      }

      // 2. Bulk UPDATE (dirty existing items)
      if (dirtyItems.size > 0) {
        const payload = Array.from(dirtyItems.entries()).map(([id, state]) => ({
          id,
          description: state.description,
          volume: parseFloat(state.volume) || 0,
          unit: state.unit,
          unit_price: parseFloat(state.unit_price) || 0,
        }));

        try {
          await rapService.bulkUpdateItems(category.id, payload);
          setDirtyItems(new Map());
        } catch (err: any) {
          if (err?.errors) {
            const dirtyEntries = Array.from(dirtyItems.entries());
            const nextMap = new Map(dirtyItems);
            Object.entries(err.errors as Record<string, string[]>).forEach(([key, messages]) => {
              const match = key.match(/^items\.(\d+)\.(.+)$/);
              if (match) {
                const idx = parseInt(match[1], 10);
                const field = match[2] as keyof RapDirtyItemState;
                const [itemId, state] = dirtyEntries[idx] ?? [];
                if (itemId !== undefined) {
                  nextMap.set(itemId, {
                    ...state,
                    errors: { ...(state.errors || {}), [field]: messages[0] },
                  });
                }
              }
            });
            setDirtyItems(nextMap);
            setBulkError('Beberapa item gagal diperbarui. Periksa error di baris yang ditandai.');
            return;
          }
          throw err;
        }
      }

      // 3. Refresh
      await onRefresh();
    } catch (err: any) {
      console.error(err);
      setBulkError(err?.message || 'Terjadi kesalahan saat menyimpan.');
    } finally {
      setIsSavingBulk(false);
    }
  };

  // Category actions
  const handleSaveCategory = async () => {
    if (!catName.trim()) return;
    setIsSavingCat(true);
    try {
      await rapService.updateCategory(category.id, {
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
    if (
      !window.confirm(
        `Yakin ingin menghapus kategori "${category.name}"? Semua item dan sub-kategori di dalamnya akan ikut terhapus.`,
      )
    )
      return;
    setIsDeletingCat(true);
    try {
      await rapService.deleteCategory(category.id);
      await onRefresh();
    } catch (e: any) {
      alert(e?.message || 'Gagal menghapus kategori');
    } finally {
      setIsDeletingCat(false);
    }
  };

  const calculateTotalRecursively = (cat: RapCategory): Decimal => {
    const itemsTotal = cat.items.reduce((sum, item) => sum.plus(new Decimal(item.total_price || 0)), new Decimal(0));
    const childrenTotal = cat.children.reduce((sum, child) => sum.plus(calculateTotalRecursively(child)), new Decimal(0));
    return itemsTotal.plus(childrenTotal);
  };
  const categoryTotal = calculateTotalRecursively(category).toNumber();

  const pendingCount = draftItems.length + dirtyItems.size;

  const renderCategoryRow = () => {
    if (depth === 0) {
      return (
        <tr className="bg-yellow-300 dark:bg-yellow-500/80 font-bold border-y border-border group">
          <td
            colSpan={9}
            className="px-3 py-1.5 border-x border-border/50 text-center text-black dark:text-white uppercase relative"
          >
            {isEditingCategory ? (
              <div className="flex items-center justify-center gap-2 max-w-sm mx-auto">
                <input
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  placeholder="Nama Area/Lantai (Contoh: LANTAI 1)"
                  className="w-full px-2 py-1 text-xs border rounded bg-background text-foreground"
                />
                <button
                  onClick={handleSaveCategory}
                  disabled={isSavingCat}
                  className="text-emerald-700 bg-emerald-100 px-2 py-1 rounded text-xs"
                >
                  {isSavingCat ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Simpan'}
                </button>
                <button
                  onClick={() => setIsEditingCategory(false)}
                  className="text-muted-foreground bg-white/50 px-2 py-1 rounded text-xs"
                >
                  Batal
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-4">
                <span>{category.name}</span>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center absolute right-4 top-1/2 -translate-y-1/2">
                  <button
                    onClick={() => setIsEditingCategory(true)}
                    className="p-1 text-blue-800 hover:bg-white/20 rounded"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={handleDeleteCategory}
                    disabled={isDeletingCat}
                    className="p-1 text-rose-700 hover:bg-white/20 rounded"
                  >
                    {isDeletingCat ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>
            )}
          </td>
        </tr>
      );
    }

    const isDepth1 = depth === 1;
    return (
      <tr className={`border-y border-border group ${isDepth1 ? 'font-bold bg-muted/40' : 'font-bold bg-muted/10'}`}>
        <td className="px-3 py-1.5 border-x border-border/50 text-center">{category.code || ''}</td>
        <td colSpan={8} className="px-3 py-1.5 border-r border-border/50 relative">
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
              <button
                onClick={handleSaveCategory}
                disabled={isSavingCat}
                className="text-emerald-600 px-2 py-1 rounded text-xs hover:bg-emerald-50"
              >
                {isSavingCat ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Simpan'}
              </button>
              <button
                onClick={() => setIsEditingCategory(false)}
                className="text-muted-foreground px-2 py-1 rounded text-xs hover:bg-muted"
              >
                Batal
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className={isDepth1 ? 'uppercase' : 'capitalize italic'}>{category.name}</span>
                {pendingCount > 0 && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300 border border-amber-300 dark:border-amber-600">
                    <AlertCircle className="w-2.5 h-2.5" />
                    {pendingCount} belum disimpan
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 pr-2">
                {pendingCount > 0 && (
                  <button
                    onClick={handleBulkSave}
                    disabled={isSavingBulk}
                    className="inline-flex items-center gap-1.5 px-3 py-1 text-[11px] font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded transition-colors disabled:opacity-50"
                  >
                    {isSavingBulk ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <Save className="w-3 h-3" />
                    )}
                    Simpan Semua Perubahan
                  </button>
                )}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center">
                  <button
                    onClick={() => setIsEditingCategory(true)}
                    className="p-1 text-blue-600 hover:bg-background rounded"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={handleDeleteCategory}
                    disabled={isDeletingCat}
                    className="p-1 text-rose-600 hover:bg-background rounded"
                  >
                    {isDeletingCat ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
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

      {bulkError && (
        <tr>
          <td colSpan={9} className="px-4 py-2 bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800">
            <div className="flex items-center gap-2 text-red-700 dark:text-red-400 text-xs">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              {bulkError}
              <button onClick={() => setBulkError(null)} className="ml-auto text-red-400 hover:text-red-600">
                ✕
              </button>
            </div>
          </td>
        </tr>
      )}

      {/* Existing Items */}
      {category.items.map((item, idx) => {
        const dirtyState = dirtyItems.get(item.id);
        const syncStatus = syncStatuses[item.id.toString()];
        return (
          <RapExistingItemRow
            key={item.id}
            item={item}
            dirtyState={dirtyState}
            idx={idx}
            pajakPct={pajakPct}
            syncStatus={syncStatus}
            onQuickChange={handleDirtyChange}
            onRevert={handleRevertDirty}
            onSyncSuccess={onRefresh}
          />
        );
      })}

      {/* Draft (new) items */}
      {depth > 0 &&
        draftItems.map((draft, idx) => (
          <RapDraftItemRow
            key={draft._key}
            draft={draft}
            idx={idx}
            pajakPct={pajakPct}
            onChange={handleDraftChange}
            onRemove={handleRemoveDraft}
          />
        ))}

      {/* Add new item button */}
      {depth > 0 && (
        <tr>
          <td colSpan={9} className="px-3 py-1.5 border-b border-border/30">
            <button
              onClick={handleAddDraftRow}
              className="inline-flex items-center gap-1.5 text-[11px] text-blue-600 hover:text-blue-800 dark:hover:text-blue-400 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Tambah Baris Item
            </button>
          </td>
        </tr>
      )}

      {/* Sub Categories */}
      {category.children.map((child) => (
        <RapCategorySection
          key={child.id}
          category={child}
          depth={depth + 1}
          pajakPct={pajakPct}
          syncStatuses={syncStatuses}
          onRefresh={onRefresh}
          projectId={projectId}
          onDirtyChange={onDirtyChange}
        />
      ))}

      {/* Subtotal Row (Depth 1) */}
      {depth === 1 && (
        <tr className="font-bold border-y-2 border-border bg-muted/20 text-xs">
          <td colSpan={8} className="px-3 py-2 border-x border-border/50 text-right">
            Jumlah {category.code || category.name}
          </td>
          <td className="px-3 py-2 border-r border-border/50 text-right tabular-nums bg-yellow-50/50">
            {formatCurrency(categoryTotal).replace('Rp', '').trim()}
          </td>
        </tr>
      )}

      {/* Add Sub Category Form */}
      {depth <= 1 && (
        <AddRapCategoryForm
          projectId={projectId}
          parentId={category.id}
          onRefresh={onRefresh}
          level={depth + 1}
        />
      )}
    </React.Fragment>
  );
}
