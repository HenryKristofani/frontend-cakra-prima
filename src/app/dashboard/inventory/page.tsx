import { InventoryContainer } from "@/components/features/inventory/InventoryContainer";
import { PackageSearch } from "lucide-react";

export const dynamic = "force-dynamic";

export default function InventoryPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <PackageSearch className="w-5 h-5" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Persediaan Material</h1>
        </div>
        <p className="text-muted-foreground max-w-2xl">
          Pantau stok material konstruksi secara agregat maupun spesifik per gudang, serta kelola pergerakan aset fisik dari gudang pusat ke setiap site project.
        </p>
      </div>

      <InventoryContainer />
    </div>
  );
}
