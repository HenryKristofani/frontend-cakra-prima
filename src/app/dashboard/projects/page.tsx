import { projectService } from "@/lib/services/projectService";
import { ProjectContainer } from "@/components/features/projects/ProjectContainer";

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  // Fetch initial data on the server
  const initialData = await projectService.getProjects();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
        <p className="text-muted-foreground">
          Kelola daftar project perusahaan untuk pengategorian transaksi.
        </p>
      </div>

      <ProjectContainer initialData={initialData} />
    </div>
  );
}
