import { HutangContainer } from "@/components/features/hutang/HutangContainer";
import { PaginatedDebtGroupResponse } from "@/types/hutang";
import { fetchApi } from "@/lib/api";

export const dynamic = "force-dynamic";

async function getDebtGroups(): Promise<PaginatedDebtGroupResponse | null> {
  try {
    const res = await fetchApi<PaginatedDebtGroupResponse>("/debt-groups", {
      cache: "no-store",
    });
    return res;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export default async function HutangPage() {
  const initialData = await getDebtGroups();

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Hutang</h1>
        <p className="text-muted-foreground">Kelola daftar hutang proyek, rincian item, dan riwayat pembayaran.</p>
      </div>
      
      <HutangContainer initialData={initialData} />
    </div>
  );
}
