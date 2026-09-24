import { FundSourceDetail } from "@/components/features/fund-sources/FundSourceDetail";

export const metadata = {
  title: "Detail Sumber Modal | Cakra Prima",
};

export default async function FundSourceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <div className="max-w-7xl mx-auto">
      <FundSourceDetail id={id} />
    </div>
  );
}
