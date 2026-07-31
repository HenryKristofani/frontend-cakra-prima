'use client';

import { useRABState } from './useRABState';
import { RABHeader } from './components/RABHeader';
import { RABActions } from './components/RABActions';
import { CategoryManager } from './components/CategoryManager';
import { RABTableSection } from './components/RABTableSection';
import { PenguranganSection } from './components/PenguranganSection';
import { RABFinalSummary } from './components/RABFinalSummary';

interface RABContainerProps {
  projectId: number;
}

export function RABContainer({ projectId }: RABContainerProps) {
  const state = useRABState();

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-full">
        {/* Header and Info Cards */}
        <RABHeader
          totalRAB={state.totalRAB}
          totalPengurangan={state.totalPengurangan}
          totalAkhir={state.totalAkhir}
        />

        {/* Action Buttons */}
        <RABActions
          onExport={state.exportToCSV}
          onManageCategory={() => state.setShowCategoryManager(!state.showCategoryManager)}
        />

        {/* Category Manager */}
        {state.showCategoryManager && (
          <CategoryManager
            categories={state.categories}
            editingCategoryId={state.editingCategoryId}
            editingCategoryName={state.editingCategoryName}
            onStartEdit={state.startEditCategory}
            onSaveEdit={state.saveEditCategory}
            onCancelEdit={() => state.setEditingCategoryId(null)}
            onAddCategory={state.addCategory}
            onRemoveCategory={state.removeCategory}
            onCategoryNameChange={state.setEditingCategoryName}
          />
        )}

        {/* RAB Section */}
        <RABTableSection
          categories={state.categories}
          items={state.items}
          expandedCategories={state.expandedCategories}
          onToggleCategory={state.toggleCategory}
          onAddRowToCategory={state.addRowToCategory}
          onDeleteRow={state.deleteRow}
          onUpdateItem={state.updateItem}
        />

        {/* Pengurangan Section */}
        <PenguranganSection
          showPengurangan={state.showPengurangan}
          totalPengurangan={state.totalPengurangan}
          penguranganItems={state.penguranganItems}
          onToggle={() => state.setShowPengurangan(!state.showPengurangan)}
          onAddRow={state.addPenguranganRow}
          onDeleteRow={state.deletePenguranganRow}
          onUpdateItem={state.updatePenguranganItem}
        />

        {/* Final Summary */}
        <RABFinalSummary
          totalRAB={state.totalRAB}
          totalPengurangan={state.totalPengurangan}
          totalAkhir={state.totalAkhir}
        />
      </div>
    </div>
  );
}
