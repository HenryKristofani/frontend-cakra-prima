import { projectService } from "@/lib/services/projectService";
import { transactionService } from "@/lib/services/transactionService";
import { TransactionContainer } from "@/components/features/transactions/TransactionContainer";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ProjectKasPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { id } = await params;
  const sp = await searchParams;

  if (!id) notFound();

  const year = typeof sp.year === "string" ? sp.year : undefined;
  const month = typeof sp.month === "string" ? sp.month : undefined;

  const filters: Record<string, any> = { page: 1, project_id: id };
  if (year && year !== "all") filters.year = year;
  if (month && month !== "all") filters.month = month;

  let project;
  try {
    project = await projectService.getProjectById(id);
  } catch {
    notFound();
  }

  const [initialData, initialSummary] = await Promise.all([
    transactionService.getTransactions(filters),
    transactionService.getSummary({ project_id: id }),
  ]);

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
          <h1 className="text-3xl font-bold tracking-tight">Kas — {project.name}</h1>
          <p className="text-muted-foreground">
            Laporan arus kas khusus untuk project ini. Transaksi baru otomatis terpaut ke project ini.
          </p>
        </div>
      </div>

      <TransactionContainer
        key={`${year ?? "all"}-${month ?? "all"}`}
        initialData={initialData}
        initialSummary={initialSummary}
        initialFilters={filters}
        lockedProjectId={Number(id)}
        lockedProjectName={project.name}
      />
    </div>
  );
}
