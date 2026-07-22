import { KasHeader } from "./_components/KasHeader";
import { KasSummaryCards } from "./_components/KasSummaryCards";
import { KasTransactionTable } from "./_components/KasTransactionTable";

export default function KasPage() {
  return (
    <div className="space-y-6">
      <KasHeader />
      <KasSummaryCards />
      <KasTransactionTable />
    </div>
  );
}
