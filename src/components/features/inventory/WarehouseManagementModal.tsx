"use client";

import { useState, useEffect } from "react";
import { X, Plus, Edit2, Loader2, Save, Building2, CheckCircle2, AlertTriangle, History } from "lucide-react";
import { inventoryService } from "@/lib/services/inventoryService";
import { Warehouse, WarehouseRequest } from "@/types/inventory";
import { useRouter } from "next/navigation";

interface WarehouseManagementModalProps {
  onClose: () => void;
  onSuccess: () => void;
  warehouses: Warehouse[];
}

export function WarehouseManagementModal({ onClose, onSuccess, warehouses: initialWarehouses }: WarehouseManagementModalProps) {
  const router = useRouter();
  const [warehouses, setWarehouses] = useState<Warehouse[]>(initialWarehouses);
  
  useEffect(() => {
    setWarehouses(initialWarehouses);
  }, [initialWarehouses]);
  
  const [projects, setProjects] = useState<{ id: number; name: string }[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);
  
  const [isEditing, setIsEditing] = useState<number | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  
  const [formData, setFormData] = useState<WarehouseRequest>({
    name: "",
    type: "main",
    project_id: null,
    location: "",
    is_active: true
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      setIsLoadingProjects(true);
      try {
        const data = await inventoryService.getProjects();
        setProjects(data);
      } catch (e: any) {
        console.error("Gagal memuat project", e);
      } finally {
        setIsLoadingProjects(false);
      }
    };
    fetchProjects();
  }, []);

  const resetForm = () => {
    setFormData({
      name: "",
      type: "main",
      project_id: null,
      location: "",
      is_active: true
    });
    setIsCreating(false);
    setIsEditing(null);
    setError(null);
  };

  const handleEditClick = (w: Warehouse) => {
    setFormData({
      name: w.name,
      type: w.type,
      project_id: w.project_id,
      location: w.location || "",
      is_active: w.is_active ?? true
    });
    setIsEditing(w.id);
    setIsCreating(false);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      setError("Nama Gudang harus diisi.");
      return;
    }
    if (formData.type === 'project' && !formData.project_id) {
      setError("Pilih Project untuk tipe Gudang Project.");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      const payload = { ...formData };
      if (payload.type === 'main') {
        payload.project_id = null; // Ensure null for main
      }
      
      if (isEditing) {
        await inventoryService.updateWarehouse(isEditing, payload);
        setSuccess("Gudang berhasil diupdate.");
      } else {
        await inventoryService.createWarehouse(payload);
        setSuccess("Gudang berhasil ditambahkan.");
      }
      
      // Update local state is not enough since parent needs it, just call onSuccess
      setTimeout(() => {
        setSuccess(null);
        resetForm();
        onSuccess();
      }, 1500);
      
    } catch (e: any) {
      setError(e.message || "Gagal menyimpan gudang");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleActive = async (w: Warehouse) => {
    if (!confirm(`Apakah Anda yakin ingin menonaktifkan gudang ${w.name}?`)) return;
    try {
      await inventoryService.updateWarehouse(w.id, {
        is_active: !(w.is_active ?? true)
      });
      onSuccess();
    } catch (e: any) {
      setError(e.message || "Gagal merubah status gudang");
    }
  };

  const showForm = isCreating || isEditing !== null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-background w-full max-w-4xl rounded-xl shadow-lg border border-border flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div>
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Building2 className="w-5 h-5 text-indigo-600" />
              Kelola Gudang (Warehouse)
            </h3>
            <p className="text-sm text-muted-foreground">Manajemen lokasi penyimpanan material (Gudang Utama & Project).</p>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-muted rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 overflow-y-auto flex-1">
          {success && (
            <div className="mb-4 flex items-center gap-2 p-3 bg-green-50 text-green-700 border border-green-200 rounded-lg text-sm">
              <CheckCircle2 className="w-4 h-4" /> {success}
            </div>
          )}
          
          {error && (
            <div className="mb-4 flex items-center gap-2 p-3 bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm">
              <AlertTriangle className="w-4 h-4" /> {error}
            </div>
          )}

          {showForm ? (
            <div className="bg-muted/30 p-4 rounded-lg border border-border mb-6">
              <h4 className="font-medium mb-4">{isEditing ? 'Edit Gudang' : 'Tambah Gudang Baru'}</h4>
              <form id="warehouse-form" onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Nama Gudang</label>
                    <input 
                      type="text" 
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      placeholder="Cth: Gudang Utama Jombor"
                      className="w-full h-10 px-3 bg-background border border-input rounded-md text-sm"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Tipe Gudang</label>
                    <select 
                      value={formData.type}
                      onChange={e => setFormData({...formData, type: e.target.value as 'main'|'project', project_id: null})}
                      className="w-full h-10 px-3 bg-background border border-input rounded-md text-sm"
                      required
                    >
                      <option value="main">Gudang Utama (Bebas)</option>
                      <option value="project">Gudang Project (Terikat)</option>
                    </select>
                  </div>

                  {formData.type === 'project' && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Pilih Project Terikat</label>
                      {isLoadingProjects ? (
                        <div className="h-10 flex items-center text-sm text-muted-foreground"><Loader2 className="w-4 h-4 animate-spin mr-2" /> Memuat...</div>
                      ) : (
                        <select 
                          value={formData.project_id || ""}
                          onChange={e => setFormData({...formData, project_id: Number(e.target.value)})}
                          className="w-full h-10 px-3 bg-background border border-input rounded-md text-sm"
                          required
                        >
                          <option value="" disabled>-- Pilih Project --</option>
                          {projects.map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                          ))}
                        </select>
                      )}
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Lokasi / Alamat (Opsional)</label>
                    <input 
                      type="text" 
                      value={formData.location || ""}
                      onChange={e => setFormData({...formData, location: e.target.value})}
                      placeholder="Cth: Jl. Magelang KM 5"
                      className="w-full h-10 px-3 bg-background border border-input rounded-md text-sm"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button 
                    type="button" 
                    onClick={resetForm}
                    className="px-4 py-2 text-sm font-medium border border-input bg-background hover:bg-accent rounded-md"
                    disabled={isSubmitting}
                  >
                    Batal
                  </button>
                  <button 
                    type="submit" 
                    className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 rounded-md flex items-center gap-2"
                    disabled={isSubmitting}
                  >
                    {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                    <Save className="w-4 h-4" />
                    Simpan Gudang
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="flex justify-end mb-4">
              <button 
                onClick={() => setIsCreating(true)}
                className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-400 dark:hover:bg-indigo-900/50 rounded-md text-sm font-medium transition-colors"
              >
                <Plus className="w-4 h-4" /> Tambah Gudang
              </button>
            </div>
          )}

          <div className="overflow-x-auto rounded-xl border border-border bg-card">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/50 text-muted-foreground uppercase text-[11px] font-semibold tracking-wider">
                <tr>
                  <th className="px-4 py-3">Nama Gudang</th>
                  <th className="px-4 py-3">Tipe</th>
                  <th className="px-4 py-3">Project Terkait</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {warehouses.map((w) => (
                  <tr key={w.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 font-medium text-foreground">
                      {w.name}
                      {w.location && <div className="text-xs text-muted-foreground font-normal mt-0.5">{w.location}</div>}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        w.type === 'main' ? 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                      }`}>
                        {w.type === 'main' ? 'Utama' : 'Project'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {w.type === 'project' ? (w.project?.name || `ID: ${w.project_id}`) : '-'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {(w.is_active ?? true) ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400">Aktif</span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400">Nonaktif</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button 
                          onClick={() => {
                            onClose();
                            router.push(`/dashboard/inventory/warehouses/${w.id}`);
                          }}
                          disabled={showForm}
                          className="p-1.5 text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 rounded-md disabled:opacity-50"
                          title="Lihat Histori Gudang"
                        >
                          <History className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleEditClick(w)}
                          disabled={showForm}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-md disabled:opacity-50"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleToggleActive(w)}
                          disabled={showForm}
                          className={`p-1.5 rounded-md disabled:opacity-50 ${
                            (w.is_active ?? true) 
                              ? "text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/30" 
                              : "text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30"
                          }`}
                          title={(w.is_active ?? true) ? "Nonaktifkan" : "Aktifkan"}
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {warehouses.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                      Belum ada gudang yang terdaftar.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
