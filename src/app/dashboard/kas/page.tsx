import { transactionService } from "@/lib/services/transactionService";
import { TransactionContainer } from "@/components/features/transactions/TransactionContainer";

export const dynamic = "force-dynamic";

export default async function KasPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const year = typeof params.year === "string" ? params.year : undefined;
  const month = typeof params.month === "string" ? params.month : undefined;
  
  const filters: Record<string, any> = { page: 1 };
  if (year && year !== "all") filters.year = year;
  if (month && month !== "all") filters.month = month;

  // Fetch initial data on the server
  // This runs on the server and avoids client request waterfalls
  const [initialData, initialSummary] = await Promise.all([
    transactionService.getTransactions(filters),
    transactionService.getSummary(filters)
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Kas Kantor</h1>
        <p className="text-muted-foreground">Kelola arus kas, pemasukan, dan pengeluaran operasional perusahaan.</p>
      </div>
      
      <TransactionContainer 
        key={`${year ?? 'all'}-${month ?? 'all'}`}
        initialData={initialData}
        initialSummary={initialSummary}
        initialFilters={filters}
      />
    </div>
  );
}
