import { ProgressDetailContainer } from "@/components/features/projects/progress/ProgressDetailContainer";
import { fetchApi } from "@/lib/api";
import { Project } from "@/types/transaction";
import { notFound } from "next/navigation";
import { isNextRedirectError } from "@/utils/error";

export const dynamic = "force-dynamic";

export default async function ProjectProgressPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  if (!id) notFound();

  // Fetch project details for the title
  let projectName = "Detail Project";
  try {
    const project = await fetchApi<Project>(`/projects/${id}`);
    projectName = project.name;
  } catch (error) {
    if (isNextRedirectError(error)) throw error;
    console.error("Failed to fetch project for progress page", error);
  }

  return (
    <div className="container mx-auto py-6">
      <ProgressDetailContainer projectId={id} projectName={projectName} />
    </div>
  );
}
