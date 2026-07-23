import { transactionService } from "@/lib/services/transactionService";
import { TransactionContainer } from "@/components/features/transactions/TransactionContainer";

export const dynamic = "force-dynamic";

export default async function KasPage() {
  // Fetch initial data on the server
  // This runs on the server and avoids client request waterfalls
  const [initialData, initialSummary] = await Promise.all([
    transactionService.getTransactions({ page: 1 }),
    transactionService.getSummary()
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Kas Kantor</h1>
        <p className="text-muted-foreground">Kelola arus kas, pemasukan, dan pengeluaran operasional perusahaan.</p>
      </div>
      
      <TransactionContainer 
        initialData={initialData}
        initialSummary={initialSummary}
      />
    </div>
  );
}
