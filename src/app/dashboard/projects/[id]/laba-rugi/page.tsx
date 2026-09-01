import { projectService } from '@/lib/services/projectService';
import { LabaRugiContainer } from '@/components/features/projects/laba-rugi/LabaRugiContainer';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { isNextRedirectError } from "@/utils/error";

export const dynamic = 'force-dynamic';

export default async function LabaRugiPage({
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
          <h1 className="text-3xl font-bold tracking-tight">Laba / Rugi — {project.name}</h1>
          <p className="text-muted-foreground">
            RAP vs realisasi biaya KAS.
          </p>
        </div>
      </div>

      <LabaRugiContainer projectId={id} />
    </div>
  );
}
