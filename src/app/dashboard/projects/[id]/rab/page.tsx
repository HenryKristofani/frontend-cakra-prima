import { projectService } from '@/lib/services/projectService';
import { rabService } from '@/lib/services/rabService';
import { RabContainer } from '@/components/features/projects/rab/RabContainer';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { isNextRedirectError } from "@/utils/error";

export const dynamic = 'force-dynamic';

export default async function RABPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  if (!id) notFound();

  let project;
  try {
    project = await projectService.getProjectById(id);
  } catch (error) {
    if (isNextRedirectError(error)) throw error;
    notFound();
  }

  const rabSummary = await rabService.getRabSummary(id).catch((error) => {
    if (isNextRedirectError(error)) throw error;
    return {
      total_rab_aktif: 0,
      total_deduction: 0,
      final_total: 0,
      rounded_total: 0,
      overall_progress_percentage: 0,
      categories: [],
      deductions: [],
    };
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href={`/dashboard/projects/${id}`}
          className="p-2 hover:bg-muted rounded-full transition-colors"
          title="Kembali ke Dashboard Project"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold tracking-tight">RAB — {project.name}</h1>
          <p className="text-muted-foreground">
            Rencana Anggaran Biaya dan progress pengerjaan project ini.
          </p>
        </div>
      </div>

      <RabContainer initialData={rabSummary} projectId={id} />
    </div>
  );
}
