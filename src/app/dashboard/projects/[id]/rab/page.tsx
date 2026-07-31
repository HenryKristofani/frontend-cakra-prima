import { projectService } from "@/lib/services/projectService";
import { RABContainer } from "@/components/features/projects/rab/RABContainer";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function RABPage({ params }: { params: { id: string } }) {
  const { id } = params;
  if (!id) {
    notFound();
  }

  let project;
  try {
    project = await projectService.getProjectById(id);
  } catch (error) {
    console.error("Failed to load project for RAB page:", error);
    notFound();
  }

  return (
    <div className="space-y-6">
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
            Detail RAB khusus untuk project ini. Gunakan halaman ini untuk mengelola kategori dan biaya RAB.
          </p>
        </div>
      </div>

      <RABContainer projectId={Number(id)} />
    </div>
  );
}
