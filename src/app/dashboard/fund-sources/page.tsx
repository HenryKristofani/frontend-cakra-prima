import { FundSourceList } from "@/components/features/fund-sources/FundSourceList";

export const metadata = {
  title: "Sumber Modal | Cakra Prima",
};

export default function FundSourcesPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <FundSourceList />
    </div>
  );
}
