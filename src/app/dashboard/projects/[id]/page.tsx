import { projectService } from "@/lib/services/projectService";
import { transactionService } from "@/lib/services/transactionService";
import { rabService } from "@/lib/services/rabService";
import { rapService } from "@/lib/services/rapService";
import { ProjectDashboardContainer } from "@/components/features/projects/dashboard/ProjectDashboardContainer";
import { notFound } from "next/navigation";
import { isNextRedirectError } from "@/utils/error";

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
    const [project, initialSummary, rabSummary, labaRugi] = await Promise.all([
      projectService.getProjectById(id),
      transactionService.getSummary({ project_id: id }),
      rabService.getRabSummary(id).catch((error) => {
        if (isNextRedirectError(error)) throw error;
        return null;
      }),
      rapService.getLabaRugi(id).catch((error) => {
        if (isNextRedirectError(error)) throw error;
        return null;
      }),
    ]);

    if (!project) {
      notFound();
    }

    return (
      <ProjectDashboardContainer 
        project={project} 
        initialSummary={initialSummary}
        rabSummary={rabSummary}
        labaRugi={labaRugi}
      />
    );
  } catch (error) {
    if (isNextRedirectError(error)) throw error;
    console.error("Failed to load project dashboard:", error);
    notFound();
  }
}
