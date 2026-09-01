import { projectService } from '@/lib/services/projectService';
import { RapContainer } from '@/components/features/projects/rap/RapContainer';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { isNextRedirectError } from "@/utils/error";

export const dynamic = 'force-dynamic';

export default async function RAPPage({
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
          <h1 className="text-3xl font-bold tracking-tight">RAP — {project.name}</h1>
          <p className="text-muted-foreground">
            Rencana Anggaran Pelaksanaan project ini.
          </p>
        </div>
      </div>

      <RapContainer projectId={id} />
    </div>
  );
}
