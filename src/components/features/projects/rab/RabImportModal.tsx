'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import {
  Upload, X, CheckCircle2, AlertCircle, Loader2,
  FileSpreadsheet, ChevronRight, Table2, RefreshCw
} from 'lucide-react';
import { rabImportService } from '@/lib/services/rabImportService';

interface RabImportModalProps {
  projectId: number | string;
  onClose: () => void;
  onImported: () => void;
}

type Step = 'upload' | 'select-sheet' | 'map-columns' | 'processing' | 'done';

const COLUMN_LETTERS = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P'];

const REQUIRED_FIELDS: { key: string; label: string }[] = [
  { key: 'uraian', label: 'Uraian Pekerjaan' },
  { key: 'satuan', label: 'Satuan' },
  { key: 'volume', label: 'Volume' },
  { key: 'harga', label: 'Harga Satuan' },
];

export function RabImportModal({ projectId, onClose, onImported }: RabImportModalProps) {
  const [step, setStep] = useState<Step>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Step 1 → 2
  const [sheets, setSheets] = useState<string[]>([]);
  const [filePath, setFilePath] = useState<string>('');

  // Step 2 → 3
  const [selectedSheet, setSelectedSheet] = useState('');
  const [previewRows, setPreviewRows] = useState<(string | number | null)[][]>([]);

  // Step 3
  const [mapping, setMapping] = useState<Record<string, number>>({
    uraian: 2, // default: kolom C (0-indexed)
    satuan: 3,
    volume: 4,
    harga: 5,
  });
  const [startRow, setStartRow] = useState(5); // 1-indexed

  // Step 4 — polling
  const [batchId, setBatchId] = useState<string>('');
  const [progress, setProgress] = useState(0);
  const [hasFailures, setHasFailures] = useState(false);
  const [resultMessage, setResultMessage] = useState('');
  const [isDuplicate, setIsDuplicate] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const clearPoll = () => {
    if (pollRef.current) clearInterval(pollRef.current);
  };

  useEffect(() => () => clearPoll(), []);

  // ─── File Selection ─────────────────────────────────────────────────────────
  const handleFile = (f: File) => {
    setError(null);
    setFile(f);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  // ─── Step 1: Upload ─────────────────────────────────────────────────────────
  const handleUpload = async () => {
    if (!file) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await rabImportService.upload(projectId, file);
      setFilePath(res.file_path);
      setSheets(res.sheets);
      setSelectedSheet(res.sheets[0] || '');
      setStep('select-sheet');
    } catch (e: any) {
      setError(e?.message || 'Gagal mengunggah file.');
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Step 2: Preview Sheet ───────────────────────────────────────────────────
  const handlePreviewSheet = async () => {
    if (!selectedSheet) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await rabImportService.preview(projectId, filePath, selectedSheet);
      setPreviewRows(res.preview_rows);
      setStep('map-columns');
    } catch (e: any) {
      setError(e?.message || 'Gagal membaca sheet.');
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Step 3: Dispatch Job ────────────────────────────────────────────────────
  const handleProcess = async (force = false) => {
    setIsLoading(true);
    setError(null);
    setIsDuplicate(false);
    try {
      const res = await rabImportService.process(projectId, {
        file_path: filePath,
        sheet: selectedSheet,
        mapping,
        start_row: startRow,
        force,
      });
      setBatchId(res.batch_id);
      setProgress(0);
      setStep('processing');
      // Start polling
      pollRef.current = setInterval(async () => {
        try {
          const status = await rabImportService.status(projectId, res.batch_id);
          setProgress(status.progress);
          if (status.finished) {
            clearPoll();
            setHasFailures(status.has_failures);
            setResultMessage(status.has_failures
              ? (status.failure_detail || 'Import gagal — semua data di-rollback. Tidak ada partial import.')
              : 'Import berhasil! Semua item telah ditambahkan ke RAB.');
            setStep('done');
            if (!status.has_failures) onImported();
          }
        } catch {}
      }, 2000);
    } catch (e: any) {
      if (e?.status === 409 || e?.response?.status === 409) {
        setIsDuplicate(true);
        setError(e?.message || 'File ini sepertinya sudah pernah diimport.');
      } else {
        setError(e?.message || 'Gagal memulai proses import.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Helpers ────────────────────────────────────────────────────────────────
  const stepLabel = (s: Step) => {
    const map: Record<Step, string> = {
      'upload': 'Upload File',
      'select-sheet': 'Pilih Sheet',
      'map-columns': 'Mapping Kolom',
      'processing': 'Proses',
      'done': 'Selesai',
    };
    return map[s];
  };
  const steps: Step[] = ['upload', 'select-sheet', 'map-columns', 'processing', 'done'];
  const stepIdx = steps.indexOf(step);

  const displayRows = previewRows.slice(0, 20);
  const numCols = displayRows[0]?.length ?? 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-t-2xl flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <FileSpreadsheet className="w-5 h-5" />
            <h2 className="font-semibold text-base">Import RAB dari Excel</h2>
          </div>
          <button onClick={onClose} className="rounded-full p-1 hover:bg-white/20 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Stepper */}
        <div className="flex items-center gap-0 px-6 py-3 border-b border-border bg-muted/30 flex-shrink-0 text-xs">
          {steps.map((s, i) => (
            <div key={s} className="flex items-center gap-0">
              <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full font-medium transition-colors
                ${i < stepIdx ? 'text-green-600' : i === stepIdx ? 'text-blue-600 bg-blue-100' : 'text-muted-foreground'}`}>
                {i < stepIdx
                  ? <CheckCircle2 className="w-3.5 h-3.5" />
                  : <span className="w-3.5 h-3.5 rounded-full border-2 border-current flex items-center justify-center text-[9px] font-bold">{i+1}</span>
                }
                {stepLabel(s)}
              </div>
              {i < steps.length - 1 && <ChevronRight className="w-3.5 h-3.5 text-muted-foreground mx-0.5" />}
            </div>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">

          {/* Error Banner */}
          {error && (
            <div className="mb-4 flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <p>{error}</p>
            </div>
          )}

          {/* ── Step 1: Upload ──────────────────────────────────────────────── */}
          {step === 'upload' && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Upload file RAB/BOQ Excel (.xlsx / .xls). Setelah upload, Anda akan memilih sheet dan mapping kolom secara interaktif.
              </p>
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors
                  ${isDragging ? 'border-blue-500 bg-blue-50/50' : 'border-border hover:border-blue-400 hover:bg-blue-50/20'}`}
              >
                <Upload className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
                {file
                  ? <p className="font-semibold text-foreground">{file.name} <span className="text-muted-foreground font-normal">({(file.size / 1024 / 1024).toFixed(1)} MB)</span></p>
                  : <p className="text-muted-foreground">Drag & drop atau klik untuk pilih file</p>
                }
                <p className="text-xs text-muted-foreground mt-1">xlsx, xls — maks 20 MB</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                />
              </div>
            </div>
          )}

          {/* ── Step 2: Select Sheet ─────────────────────────────────────────── */}
          {step === 'select-sheet' && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">File memiliki <strong>{sheets.length} sheet</strong>. Pilih sheet yang berisi data RAB/BOQ:</p>
              <div className="grid grid-cols-2 gap-2">
                {sheets.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSelectedSheet(s)}
                    className={`flex items-center gap-2 p-3 rounded-lg border text-sm text-left transition-colors
                      ${selectedSheet === s
                        ? 'border-blue-500 bg-blue-50 text-blue-700 font-semibold'
                        : 'border-border hover:border-blue-300 hover:bg-blue-50/30'
                      }`}
                  >
                    <Table2 className="w-4 h-4 flex-shrink-0" />
                    {s}
                    {selectedSheet === s && <CheckCircle2 className="w-4 h-4 ml-auto text-blue-500" />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── Step 3: Map Columns ──────────────────────────────────────────── */}
          {step === 'map-columns' && (
            <div className="space-y-5">
              <p className="text-sm text-muted-foreground">
                Tentukan kolom dan baris awal data. Preview menampilkan 20 baris pertama — cari baris pertama yang berisi <strong>item</strong> (bukan header divisi).
              </p>

              {/* Column Mapping UI */}
              <div className="grid grid-cols-2 gap-3">
                {REQUIRED_FIELDS.map((f) => (
                  <div key={f.key} className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{f.label}</label>
                    <select
                      value={mapping[f.key]}
                      onChange={(e) => setMapping(prev => ({ ...prev, [f.key]: Number(e.target.value) }))}
                      className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background"
                    >
                      {COLUMN_LETTERS.map((l, i) => (
                        <option key={i} value={i}>Kolom {l} (indeks {i})</option>
                      ))}
                    </select>
                  </div>
                ))}
                <div className="space-y-1 col-span-2">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Baris awal data (1-indexed)</label>
                  <input
                    type="number"
                    min={1}
                    value={startRow}
                    onChange={(e) => setStartRow(Number(e.target.value))}
                    className="w-32 border border-border rounded-lg px-3 py-2 text-sm bg-background"
                  />
                  <p className="text-xs text-muted-foreground">Baris divisi/header kosong sebelumnya akan otomatis dilewati.</p>
                </div>
              </div>

              {/* Preview Table */}
              {displayRows.length > 0 && (
                <div className="rounded-lg border border-border overflow-hidden">
                  <div className="px-3 py-2 bg-muted/50 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Preview ({displayRows.length} baris)
                  </div>
                  <div className="overflow-x-auto max-h-52">
                    <table className="w-full text-xs border-collapse">
                      <thead>
                        <tr className="bg-muted/30">
                          <th className="px-2 py-1.5 border-b border-r border-border text-center w-8 text-muted-foreground">#</th>
                          {Array.from({ length: numCols }, (_, i) => (
                            <th key={i} className={`px-2 py-1.5 border-b border-r border-border text-center min-w-[80px]
                              ${Object.values(mapping).includes(i) ? 'bg-blue-100/50 text-blue-700' : ''}`}>
                              {COLUMN_LETTERS[i] ?? i}
                              {Object.entries(mapping).find(([,v]) => v === i)
                                ? <span className="block text-[9px] font-bold text-blue-600">
                                    {REQUIRED_FIELDS.find(f => f.key === Object.keys(mapping).find(k => mapping[k] === i))?.label}
                                  </span>
                                : null
                              }
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {displayRows.map((row, ri) => (
                          <tr key={ri} className={`${ri + 1 >= startRow ? '' : 'opacity-40'} hover:bg-muted/20`}>
                            <td className="px-2 py-1 border-b border-r border-border text-center text-muted-foreground">{ri + 1}</td>
                            {Array.from({ length: numCols }, (_, ci) => (
                              <td key={ci} className={`px-2 py-1 border-b border-r border-border max-w-[150px] truncate
                                ${Object.values(mapping).includes(ci) ? 'bg-blue-50/40' : ''}`}>
                                {row[ci] != null ? String(row[ci]) : ''}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Step 4: Processing ───────────────────────────────────────────── */}
          {step === 'processing' && (
            <div className="text-center space-y-6 py-6">
              <div className="w-16 h-16 mx-auto rounded-full bg-blue-100 flex items-center justify-center">
                <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
              </div>
              <div>
                <p className="font-semibold text-foreground">Proses import berjalan...</p>
                <p className="text-sm text-muted-foreground mt-1">File besar membutuhkan waktu lebih lama. Jangan tutup halaman ini.</p>
              </div>
              <div className="w-full bg-muted rounded-full h-2.5">
                <div
                  className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground">{progress}% selesai</p>
            </div>
          )}

          {/* ── Step 5: Done ────────────────────────────────────────────────── */}
          {step === 'done' && (
            <div className="text-center space-y-4 py-6">
              <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center
                ${hasFailures ? 'bg-yellow-100' : 'bg-green-100'}`}>
                {hasFailures
                  ? <AlertCircle className="w-8 h-8 text-yellow-600" />
                  : <CheckCircle2 className="w-8 h-8 text-green-600" />
                }
              </div>
              <div>
                <p className="font-semibold text-foreground">{hasFailures ? 'Import Selesai (ada galat)' : 'Import Berhasil!'}</p>
                <p className="text-sm text-muted-foreground mt-1">{resultMessage}</p>
                {hasFailures && (
                  <p className="text-xs text-muted-foreground mt-2">Baris dengan formula error (#REF!, #VALUE!) dilewati dan dicatat di log server.</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center px-6 py-4 border-t border-border flex-shrink-0 bg-muted/20">
          <button onClick={onClose} className="px-4 py-2 rounded-lg border border-border text-sm hover:bg-muted transition-colors">
            {step === 'done' ? 'Tutup' : 'Batal'}
          </button>

          <div className="flex gap-2">
            {step === 'select-sheet' && (
              <button
                onClick={() => setStep('upload')}
                className="px-4 py-2 rounded-lg border border-border text-sm hover:bg-muted transition-colors"
              >
                Kembali
              </button>
            )}
            {step === 'map-columns' && (
              <button
                onClick={() => setStep('select-sheet')}
                className="px-4 py-2 rounded-lg border border-border text-sm hover:bg-muted transition-colors"
              >
                Kembali
              </button>
            )}

            {step === 'upload' && (
              <button
                onClick={handleUpload}
                disabled={!file || isLoading}
                className="inline-flex items-center gap-2 px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                Upload & Baca Sheet
              </button>
            )}
            {step === 'select-sheet' && (
              <button
                onClick={handlePreviewSheet}
                disabled={!selectedSheet || isLoading}
                className="inline-flex items-center gap-2 px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Table2 className="w-4 h-4" />}
                Preview Sheet
              </button>
            )}
            {step === 'map-columns' && (
              <>
                {isDuplicate && (
                  <div className="flex flex-col gap-2 items-end">
                    <button
                      onClick={() => handleProcess(true)}
                      disabled={isLoading}
                      className="inline-flex items-center gap-2 px-5 py-2 bg-yellow-500 text-white rounded-lg text-sm font-semibold hover:bg-yellow-600 disabled:opacity-50 transition-colors"
                    >
                      {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <AlertCircle className="w-4 h-4" />}
                      Import Paksa (duplikasi)
                    </button>
                  </div>
                )}
                {!isDuplicate && (
                  <button
                    onClick={() => handleProcess(false)}
                    disabled={isLoading}
                    className="inline-flex items-center gap-2 px-5 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 disabled:opacity-50 transition-colors"
                  >
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                    Mulai Import
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
