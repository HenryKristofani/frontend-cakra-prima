import { FundMovementList } from "@/components/features/fund-sources/FundMovementList";

export const metadata = {
  title: "Mutasi Modal | Cakra Prima",
};

export default function FundMovementsPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <FundMovementList />
    </div>
  );
}
