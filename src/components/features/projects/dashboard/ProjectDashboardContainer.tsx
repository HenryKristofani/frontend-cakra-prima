"use client";

import { Project, TransactionSummary } from "@/types/transaction";
import { ProjectSummaryCards } from "./ProjectSummaryCards";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

interface ProjectDashboardContainerProps {
  project: Project;
  initialSummary: TransactionSummary;
}

export function ProjectDashboardContainer({ project, initialSummary }: ProjectDashboardContainerProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Link 
          href="/dashboard/projects"
          className="p-2 hover:bg-muted rounded-full transition-colors"
          title="Kembali ke Daftar Project"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">{project.name}</h1>
            <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
              project.status === 'aktif' 
                ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400'
                : 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400'
            }`}>
              {project.status === 'aktif' ? 'Aktif' : 'Non-aktif'}
            </span>
          </div>
          <p className="text-muted-foreground mt-1">
            Dashboard ringkasan kas dan progres RAB khusus untuk project ini.
          </p>
        </div>
      </div>

      <ProjectSummaryCards project={project} summary={initialSummary} />

      {/* Additional sections for project specific features can go here later */}
    </div>
  );
}
