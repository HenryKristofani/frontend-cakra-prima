import { Project, TransactionSummary } from "@/types/transaction";
import { formatCurrency } from "@/utils/formatters";
import { Wallet, PieChart, FileText, Calculator } from "lucide-react";
import Link from "next/link";
import { ProgressChart } from "./ProgressChart";

interface ProjectSummaryCardsProps {
  project: Project;
  summary: TransactionSummary;
  rabSummary?: any;
  labaRugi?: any;
}

export function ProjectSummaryCards({ project, summary, rabSummary, labaRugi }: ProjectSummaryCardsProps) {
  const progressRAB = rabSummary?.overall_progress_percentage ?? 0;
  const totalRAB = rabSummary?.rounded_total ?? rabSummary?.final_total ?? 0;
  const totalRAP = labaRugi?.summary?.total_rencana ?? 0;
  const labaRugiAmount = labaRugi?.summary?.total_selisih ?? 0;

  return (
    <>
      <ProgressChart projectId={project.id} currentProgress={progressRAB} />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
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
            <p className="text-sm font-medium text-muted-foreground mb-1">Rencana Anggaran Biaya (RAB)</p>
            <p className="text-2xl font-bold whitespace-nowrap">
              {totalRAB > 0 ? formatCurrency(totalRAB) : "-"}
            </p>
            <p className="text-sm font-semibold text-blue-600 dark:text-blue-500 mt-1">
              Progres: {progressRAB.toFixed(2)}%
            </p>
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

      {/* RAP Card */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-sm flex flex-col justify-between">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Rencana Anggaran Pelaksanaan (RAP)</p>
            <p className="text-3xl font-bold">
              {totalRAP > 0 ? formatCurrency(totalRAP) : "-"}
            </p>
          </div>
          <div className="w-12 h-12 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-600 dark:text-orange-500">
            <FileText className="w-6 h-6" />
          </div>
        </div>
        <div className="pt-4 border-t border-border">
          <Link 
            href={`/dashboard/projects/${project.id}/rap`}
            className="text-sm font-medium text-orange-600 dark:text-orange-500 hover:text-orange-700 dark:hover:text-orange-400 transition-colors inline-flex items-center"
          >
            Lihat Detail RAP &rarr;
          </Link>
        </div>
      </div>

      {/* Laba / Rugi Card */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-sm flex flex-col justify-between">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Laba / Rugi (RAP vs KAS)</p>
            <p className={`text-3xl font-bold ${labaRugiAmount > 0 ? 'text-emerald-600 dark:text-emerald-500' : labaRugiAmount < 0 ? 'text-rose-600 dark:text-rose-500' : ''}`}>
              {labaRugiAmount !== 0 ? formatCurrency(labaRugiAmount) : "-"}
            </p>
          </div>
          <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-500">
            <Calculator className="w-6 h-6" />
          </div>
        </div>
        <div className="pt-4 border-t border-border">
          <Link 
            href={`/dashboard/projects/${project.id}/laba-rugi`}
            className="text-sm font-medium text-emerald-600 dark:text-emerald-500 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors inline-flex items-center"
          >
            Lihat Laporan Laba/Rugi &rarr;
          </Link>
        </div>
      </div>
    </div>
    </>
  );
}
