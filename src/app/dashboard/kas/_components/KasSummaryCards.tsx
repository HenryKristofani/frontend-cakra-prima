export function KasSummaryCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div className="p-6 bg-brand text-white rounded-xl shadow-sm relative overflow-hidden">
        <div className="relative z-10">
          <p className="text-brand-100 font-medium text-sm">Total Saldo Kas</p>
          <h3 className="text-2xl font-bold mt-2">Rp 24.500.000</h3>
        </div>
        <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
      </div>
      <div className="p-6 bg-card border border-border rounded-xl shadow-sm">
        <p className="text-muted-foreground font-medium text-sm">Pemasukan Bulan Ini</p>
        <h3 className="text-2xl font-bold mt-2 text-emerald-600">Rp 5.250.000</h3>
      </div>
      <div className="p-6 bg-card border border-border rounded-xl shadow-sm">
        <p className="text-muted-foreground font-medium text-sm">Pengeluaran Bulan Ini</p>
        <h3 className="text-2xl font-bold mt-2 text-rose-600">Rp 1.170.000</h3>
      </div>
      <div className="p-6 bg-card border border-border rounded-xl shadow-sm">
        <p className="text-muted-foreground font-medium text-sm">Total Saldo Cash</p>
        <h3 className="text-2xl font-bold mt-2 text-blue-600">Rp 15.170.000</h3>
      </div>
    </div>
  );
}
