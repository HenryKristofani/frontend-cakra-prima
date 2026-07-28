import { projectService } from "@/lib/services/projectService";
import { transactionService } from "@/lib/services/transactionService";
import { ProjectDashboardContainer } from "@/components/features/projects/dashboard/ProjectDashboardContainer";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function ProjectDashboardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  
  if (!id) {
    notFound();
  }

  try {
    // Fetch project details and transaction summary specific to this project
    const [project, initialSummary] = await Promise.all([
      projectService.getProjectById(id),
      transactionService.getSummary({ project_id: id })
    ]);

    if (!project) {
      notFound();
    }

    return <ProjectDashboardContainer project={project} initialSummary={initialSummary} />;
  } catch (error) {
    console.error("Failed to load project dashboard:", error);
    notFound();
  }
}
