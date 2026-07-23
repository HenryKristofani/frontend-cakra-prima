import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex flex-col gap-2">
        <div className="h-9 w-48 bg-muted rounded-md"></div>
        <div className="h-5 w-96 bg-muted rounded-md"></div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-card border border-border rounded-xl p-4 shadow-sm flex items-center justify-between h-[88px]">
            <div className="space-y-2">
              <div className="h-4 w-24 bg-muted rounded"></div>
              <div className="h-8 w-32 bg-muted rounded"></div>
            </div>
            <div className="w-10 h-10 rounded-full bg-muted"></div>
          </div>
        ))}
      </div>
      
      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden h-[400px] flex items-center justify-center">
        <div className="flex flex-col items-center text-muted-foreground">
          <Loader2 className="w-8 h-8 animate-spin text-brand mb-2" />
          <p>Memuat data transaksi...</p>
        </div>
      </div>
    </div>
  );
}
