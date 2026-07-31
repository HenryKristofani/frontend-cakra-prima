"use client";

import { Project } from "@/types/transaction";
import { useProjects } from "@/hooks/useProjects";
import { ProjectTable } from "./ProjectTable";

interface ProjectContainerProps {
  initialData: Project[];
}

export function ProjectContainer({ initialData }: ProjectContainerProps) {
  const {
    projects,
    isLoading,
    addProject,
    updateProject,
    bulkUpdateProjects,
    deleteProject,
  } = useProjects(initialData);

  return (
    <ProjectTable
      projects={projects}
      isLoading={isLoading}
      addProject={addProject}
      updateProject={updateProject}
      bulkUpdateProjects={bulkUpdateProjects}
      deleteProject={deleteProject}
    />
  );
}
