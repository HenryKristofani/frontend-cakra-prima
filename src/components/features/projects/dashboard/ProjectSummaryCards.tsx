import { Project, TransactionSummary } from "@/types/transaction";
import { formatCurrency } from "@/utils/formatters";
import { Wallet, PieChart } from "lucide-react";
import Link from "next/link";

interface ProjectSummaryCardsProps {
  project: Project;
  summary: TransactionSummary;
}

export function ProjectSummaryCards({ project, summary }: ProjectSummaryCardsProps) {
  // TODO: Replace with actual RAB/Progress data from project API when available
  const mockProgress = 0; // Default or mock progress percentage

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      {/* Kas Card */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-sm flex flex-col justify-between">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Total Saldo Kas</p>
            <p className="text-3xl font-bold">{formatCurrency(summary.total_saldo_kas)}</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-brand/10 flex items-center justify-center text-brand">
            <Wallet className="w-6 h-6" />
          </div>
        </div>
        <div className="pt-4 border-t border-border">
          <Link 
            href={`/dashboard/projects/${project.id}/kas`}
            className="text-sm font-medium text-brand hover:text-brand-600 transition-colors inline-flex items-center"
          >
            Lihat Detail Laporan Kas &rarr;
          </Link>
        </div>
      </div>

      {/* RAB Card */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-sm flex flex-col justify-between">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Progress RAB</p>
            <p className="text-3xl font-bold">{mockProgress}%</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-500">
            <PieChart className="w-6 h-6" />
          </div>
        </div>
        <div className="pt-4 border-t border-border">
          <Link 
            href={`/dashboard/projects/${project.id}/rab`}
            className="text-sm font-medium text-blue-600 dark:text-blue-500 hover:text-blue-700 dark:hover:text-blue-400 transition-colors inline-flex items-center"
          >
            Lihat Detail RAB &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
