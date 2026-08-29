'use client';

import { useState, useRef } from 'react';
import {
  Upload, Download, X, CheckCircle2, AlertCircle,
  Loader2, FileSpreadsheet, ChevronRight,
} from 'lucide-react';
import {
  transactionImportService,
  ImportPreviewRow,
} from '@/lib/services/transactionImportService';

import { Project, Account } from '@/types/transaction';

interface TransactionImportModalProps {
  onClose: () => void;
  onImported: () => void; // callback to refresh the table
  projects: Project[];
  accounts: Account[];
}

type Step = 'upload' | 'preview' | 'done';

export function TransactionImportModal({ onClose, onImported, projects, accounts }: TransactionImportModalProps) {
  const [step, setStep] = useState<Step>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [previewRows, setPreviewRows] = useState<ImportPreviewRow[]>([]);
  const [validCount, setValidCount] = useState(0);
  const [errorCount, setErrorCount] = useState(0);
  const [selected, setSelected] = useState<Set<number>>(new Set()); // row numbers of selected valid rows
  const [resultMessage, setResultMessage] = useState('');
  
  // Format options
  const [format, setFormat] = useState<'new' | 'legacy'>('new');
  const [legacyProjectId, setLegacyProjectId] = useState<string>('');
  const [legacyCashAccountId, setLegacyCashAccountId] = useState<string>('');
  const [legacyRekAccountId, setLegacyRekAccountId] = useState<string>('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (f: File) => {
    setFile(f);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const handlePreview = async () => {
    if (!file) return;
    
    setIsLoading(true);
    try {
      const res = await transactionImportService.preview(file, {
        format,
        project_id: format === 'legacy' ? legacyProjectId : undefined,
        cash_account_id: format === 'legacy' ? legacyCashAccountId : undefined,
        rek_account_id: format === 'legacy' ? legacyRekAccountId : undefined,
      });
      setPreviewRows(res.rows);
      setValidCount(res.valid_count);
      setErrorCount(res.error_count);
      // Pre-select all valid rows
      const validRowNums = new Set(
        res.rows.filter(r => r.is_valid).map(r => r.row)
      );
      setSelected(validRowNums);
      setStep('preview');
    } catch (e: any) {
      alert(e?.message || 'Gagal memproses file. Pastikan format sesuai template.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleRow = (rowNum: number, isValid: boolean) => {
    if (!isValid) return; // can't select error rows
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(rowNum)) next.delete(rowNum);
      else next.add(rowNum);
      return next;
    });
  };

  const handleConfirm = async () => {
    const rowsToImport = previewRows
      .filter(r => r.is_valid && selected.has(r.row))
      .map(r => r.data);

    if (rowsToImport.length === 0) {
      alert('Tidak ada baris yang dipilih untuk diimport.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await transactionImportService.confirm(rowsToImport);
      const skipped = previewRows.filter(r => r.is_valid).length - rowsToImport.length;
      setResultMessage(
        `${res.imported_count} transaksi berhasil diimport` +
        (skipped > 0 ? `, ${skipped} baris valid dilewati` : '') +
        (errorCount > 0 ? `, ${errorCount} baris error diabaikan.` : '.')
      );
      setStep('done');
      onImported();
    } catch (e: any) {
      alert(e?.message || 'Gagal mengimport. Coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      await transactionImportService.downloadTemplate();
    } catch (e: any) {
      alert(e?.message || 'Gagal mendownload template.');
    }
  };

  const fmtCurrency = (v: number) =>
    v > 0 ? `Rp ${new Intl.NumberFormat('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v)}` : '-';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center text-brand">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold">Import Transaksi Kas</h2>
              <p className="text-xs text-muted-foreground">
                {step === 'upload' ? 'Upload file CSV/Excel' :
                 step === 'preview' ? `Preview: ${validCount} valid, ${errorCount} error` :
                 'Import selesai'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5">

          {/* ── Step: Upload ───────────────────────────────────── */}
          {step === 'upload' && (
            <div className="space-y-5">
              {/* Format Selector */}
              <div className="flex gap-4 p-4 border border-border rounded-xl bg-muted/10">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="format"
                    value="new"
                    checked={format === 'new'}
                    onChange={() => setFormat('new')}
                    className="accent-brand"
                  />
                  <span className="text-sm font-medium">Template Sistem (Terbaru)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="format"
                    value="legacy"
                    checked={format === 'legacy'}
                    onChange={() => setFormat('legacy')}
                    className="accent-brand"
                  />
                  <span className="text-sm font-medium">Format Laporan Arus Kas (Lama)</span>
                </label>
              </div>

              {/* Legacy Format Settings */}
              {format === 'legacy' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border border-amber-200 bg-amber-50 dark:border-amber-900/50 dark:bg-amber-900/10 rounded-xl">
                  <div>
                    <label className="block text-xs font-semibold mb-1 text-amber-900 dark:text-amber-500">
                      Project Terkunci
                    </label>
                    <select
                      value={legacyProjectId}
                      onChange={(e) => setLegacyProjectId(e.target.value)}
                      className="w-full text-sm border border-border rounded-lg p-2 bg-background focus:ring-2 focus:ring-amber-500/50"
                    >
                      <option value="">Pilih Project (Opsional)...</option>
                      {projects.map((p) => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1 text-amber-900 dark:text-amber-500">
                      Akun CASH (Default)
                    </label>
                    <select
                      value={legacyCashAccountId}
                      onChange={(e) => setLegacyCashAccountId(e.target.value)}
                      className="w-full text-sm border border-border rounded-lg p-2 bg-background focus:ring-2 focus:ring-amber-500/50"
                    >
                      <option value="">Pilih Akun Kas (Opsional)...</option>
                      {accounts.filter((a: any) => a.type === 'cash').map((a: any) => (
                        <option key={a.id} value={a.id}>{a.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1 text-amber-900 dark:text-amber-500">
                      Akun REK (Default)
                    </label>
                    <select
                      value={legacyRekAccountId}
                      onChange={(e) => setLegacyRekAccountId(e.target.value)}
                      className="w-full text-sm border border-border rounded-lg p-2 bg-background focus:ring-2 focus:ring-amber-500/50"
                    >
                      <option value="">Pilih Akun Bank (Opsional)...</option>
                      {accounts.filter((a: any) => a.type === 'bank').map((a: any) => (
                        <option key={a.id} value={a.id}>{a.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* Template download */}
              {format === 'new' && (
                <div className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
                  <div className="text-blue-600 dark:text-blue-400 shrink-0">
                    <Download className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-blue-800 dark:text-blue-300">Belum punya template?</p>
                    <p className="text-xs text-blue-600 dark:text-blue-400">
                      Download template Excel dengan format kolom yang benar, isi, lalu upload di sini.
                    </p>
                  </div>
                  <button
                    onClick={handleDownloadTemplate}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition-colors shrink-0"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download Template
                  </button>
                </div>
              )}

              {/* Drop zone */}
              <div
                onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`relative flex flex-col items-center justify-center gap-3 p-10 border-2 border-dashed rounded-xl cursor-pointer transition-all
                  ${isDragging
                    ? 'border-brand bg-brand/5 scale-[1.01]'
                    : 'border-border hover:border-brand/50 hover:bg-muted/30'
                  }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  className="hidden"
                  onChange={e => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }}
                />
                <Upload className="w-10 h-10 text-muted-foreground" />
                <div className="text-center">
                  <p className="font-medium text-sm">
                    {file ? file.name : 'Drag & drop file atau klik untuk pilih'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Format: .xlsx, .xls, .csv — Maks. 5 MB</p>
                </div>
                {file && (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-green-700 dark:text-green-400 font-medium">{file.name}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── Step: Preview ──────────────────────────────────── */}
          {step === 'preview' && (
            <div className="space-y-4">
              {/* Summary strip */}
              <div className="flex gap-3 flex-wrap">
                <div className="flex items-center gap-2 px-3 py-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-sm">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  <span className="font-medium text-green-700 dark:text-green-400">{validCount} baris valid</span>
                </div>
                {errorCount > 0 && (
                  <div className="flex items-center gap-2 px-3 py-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm">
                    <AlertCircle className="w-4 h-4 text-red-500" />
                    <span className="font-medium text-red-700 dark:text-red-400">{errorCount} baris error (tidak bisa diimport)</span>
                  </div>
                )}
                <div className="ml-auto text-xs text-muted-foreground flex items-center">
                  {selected.size} dari {validCount} baris valid dipilih
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto rounded-xl border border-border">
                <table className="w-full text-xs text-left">
                  <thead className="bg-muted/50 text-muted-foreground uppercase">
                    <tr>
                      <th className="px-3 py-2 w-8 text-center">✓</th>
                      <th className="px-3 py-2 w-10">#</th>
                      <th className="px-3 py-2">Tanggal</th>
                      <th className="px-3 py-2">Deskripsi</th>
                      <th className="px-3 py-2">Project</th>
                      <th className="px-3 py-2">Metode</th>
                      <th className="px-3 py-2 text-right">Pemasukan</th>
                      <th className="px-3 py-2 text-right">Pengeluaran</th>
                      <th className="px-3 py-2">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {previewRows.map(row => (
                      <tr
                        key={row.row}
                        onClick={() => toggleRow(row.row, row.is_valid)}
                        className={`transition-colors cursor-pointer
                          ${!row.is_valid
                            ? 'bg-red-50 dark:bg-red-900/10 opacity-75 cursor-default'
                            : selected.has(row.row)
                              ? 'bg-green-50/50 dark:bg-green-900/10 hover:bg-green-50 dark:hover:bg-green-900/20'
                              : 'bg-card hover:bg-muted/30'
                          }`}
                      >
                        <td className="px-3 py-2 text-center">
                          {row.is_valid ? (
                            <input
                              type="checkbox"
                              readOnly
                              checked={selected.has(row.row)}
                              className="w-3.5 h-3.5 accent-green-600 cursor-pointer"
                            />
                          ) : (
                            <X className="w-3.5 h-3.5 text-red-400 mx-auto" />
                          )}
                        </td>
                        <td className="px-3 py-2 text-muted-foreground font-mono">{row.row}</td>
                        <td className="px-3 py-2">{row.raw.tanggal}</td>
                        <td className="px-3 py-2 max-w-[200px] truncate" title={row.raw.deskripsi}>
                          {row.raw.deskripsi}
                        </td>
                        <td className="px-3 py-2 text-muted-foreground">{row.raw.project || '-'}</td>
                        <td className="px-3 py-2 uppercase font-mono">{row.raw.metode}</td>
                        <td className="px-3 py-2 text-right text-green-700 dark:text-green-400">
                          {fmtCurrency(row.raw.pemasukan)}
                        </td>
                        <td className="px-3 py-2 text-right text-red-600 dark:text-red-400">
                          {fmtCurrency(row.raw.pengeluaran)}
                        </td>
                        <td className="px-3 py-2">
                          {row.is_valid ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full text-[10px] font-medium">
                              <CheckCircle2 className="w-3 h-3" /> Valid
                            </span>
                          ) : (
                            <div className="space-y-0.5">
                              {row.errors.map((err, i) => (
                                <p key={i} className="text-red-600 dark:text-red-400 text-[10px] leading-tight">
                                  {err}
                                </p>
                              ))}
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── Step: Done ─────────────────────────────────────── */}
          {step === 'done' && (
            <div className="flex flex-col items-center justify-center py-12 gap-4 text-center">
              <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold">Import Berhasil!</h3>
              <p className="text-sm text-muted-foreground max-w-sm">{resultMessage}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 p-5 border-t border-border bg-muted/20">
          <button
            onClick={step === 'done' ? onClose : step === 'preview' ? () => { setStep('upload'); setPreviewRows([]); } : onClose}
            className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
          >
            {step === 'done' ? 'Tutup' : step === 'preview' ? '← Kembali' : 'Batal'}
          </button>

          <div className="flex items-center gap-2">
            {step === 'upload' && (
              <button
                onClick={handlePreview}
                disabled={!file || isLoading}
                className="flex items-center gap-2 px-4 py-2 bg-brand text-primary-foreground rounded-lg text-sm font-medium hover:bg-brand/80 transition-colors disabled:opacity-50"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ChevronRight className="w-4 h-4" />}
                Preview Data
              </button>
            )}

            {step === 'preview' && (
              <button
                onClick={handleConfirm}
                disabled={selected.size === 0 || isLoading}
                className="flex items-center gap-2 px-5 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                Konfirmasi Import ({selected.size} baris)
              </button>
            )}

            {step === 'done' && (
              <button
                onClick={onClose}
                className="px-4 py-2 bg-brand text-primary-foreground rounded-lg text-sm font-medium hover:bg-brand/80 transition-colors"
              >
                Selesai
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
