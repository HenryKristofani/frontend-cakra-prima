"use client";

import { Search, Loader2 } from "lucide-react";
import { Project } from "@/types/transaction";
import { NewProjectRow } from "./NewProjectRow";
import { EditableProjectRow } from "./EditableProjectRow";
import { useState, useMemo } from "react";

interface ProjectTableProps {
  projects: Project[];
  isLoading: boolean;
  addProject: (data: Omit<Project, "id">) => Promise<void>;
  updateProject: (id: number, data: Partial<Project>) => Promise<void>;
  bulkUpdateProjects: (changes: Record<number, Partial<Project>>) => Promise<void>;
  deleteProject: (id: number) => Promise<void>;
}

export function ProjectTable({
  projects,
  isLoading,
  addProject,
  updateProject,
  bulkUpdateProjects,
  deleteProject,
}: ProjectTableProps) {
  const [search, setSearch] = useState("");
  const [pendingUpdates, setPendingUpdates] = useState<Record<number, Partial<Project>>>({});

  const filteredProjects = useMemo(() => {
    if (!search) return projects;
    const lowerSearch = search.toLowerCase();
    return projects.filter(p => p.name.toLowerCase().includes(lowerSearch));
  }, [projects, search]);

  const handleRowChange = (id: number, values: Partial<Project>) => {
    setPendingUpdates((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        ...values,
      },
    }));
  };

  const handleRowSaved = (id: number) => {
    setPendingUpdates((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const handleSaveAll = async () => {
    if (!Object.keys(pendingUpdates).length) return;
    await bulkUpdateProjects(pendingUpdates);
    setPendingUpdates({});
  };

  const hasPendingChanges = Object.keys(pendingUpdates).length > 0;

  return (
    <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
      <div className="p-4 border-b border-border flex flex-col md:flex-row gap-3 justify-between items-center bg-muted/30">
        <div className="relative w-full md:max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Cari project..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-background border border-border rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/50 text-foreground"
          />
        </div>
      </div>

      <div className="overflow-x-auto relative min-h-[200px]">
        {isLoading && (
          <div className="absolute inset-0 z-10 bg-background/50 flex items-center justify-center backdrop-blur-sm">
            <Loader2 className="w-8 h-8 animate-spin text-brand" />
          </div>
        )}
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b border-border">
            <tr>
              <th className="px-4 py-3 font-medium text-center w-16">ID</th>
              <th className="px-4 py-3 font-medium">Nama Project</th>
              <th className="px-4 py-3 font-medium">Lokasi</th>
              <th className="px-4 py-3 font-medium">Tanggal RAB</th>
              <th className="px-4 py-3 font-medium w-40">Status</th>
              <th className="px-4 py-3 font-medium text-center" title="Kas Mandiri — transaksi project ini terpisah total dari Kas Buku Besar kantor, tidak akan pernah tergabung ke saldo kantor">Kas Mandiri</th>
              <th className="px-4 py-3 font-medium text-right w-32">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            <NewProjectRow onAdd={addProject} />
            {filteredProjects.map((project) => (
              <EditableProjectRow
                key={project.id}
                project={project}
                onUpdate={updateProject}
                onChange={handleRowChange}
                onSaved={handleRowSaved}
                isPending={Boolean(pendingUpdates[project.id])}
                onDelete={deleteProject}
              />
            ))}
          </tbody>
        </table>
      </div>
      <div className="p-4 border-t border-border flex flex-col md:flex-row justify-between items-center gap-3 text-sm text-muted-foreground bg-muted/20">
        <p>Menampilkan {filteredProjects.length} project</p>
        <button
          onClick={handleSaveAll}
          disabled={!hasPendingChanges || isLoading}
          className="px-4 py-2 rounded-lg bg-brand text-white text-sm font-semibold hover:bg-brand/80 transition disabled:opacity-50"
        >
          Simpan Massal
        </button>
      </div>
    </div>
  );
}
