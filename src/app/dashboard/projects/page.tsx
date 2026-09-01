import { projectService } from "@/lib/services/projectService";
import { ProjectContainer } from "@/components/features/projects/ProjectContainer";
import { isNextRedirectError } from "@/utils/error";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  // Fetch initial data on the server
  let initialData;
  try {
    initialData = await projectService.getProjects();
  } catch (error) {
    if (isNextRedirectError(error)) throw error;
    console.error("Failed to fetch projects list:", error);
    notFound();
  }

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
