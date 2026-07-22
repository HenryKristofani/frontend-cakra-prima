import { ArrowUpRight, ArrowDownRight, DollarSign, Users, CreditCard, Activity } from "lucide-react";

export default function Dashboard() {
  const stats = [
    { name: "Total Revenue", value: "Rp 45.231.000", change: "+20.1%", trend: "up", icon: DollarSign },
    { name: "Active Members", value: "+2350", change: "+180.1%", trend: "up", icon: Users },
    { name: "Sales", value: "+12,234", change: "+19%", trend: "up", icon: CreditCard },
    { name: "Active Now", value: "+573", change: "-201", trend: "down", icon: Activity },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Dashboard Overview</h1>
          <p className="text-muted-foreground mt-1">Welcome back, here's what's happening today.</p>
        </div>
        <button className="bg-brand text-white px-4 py-2 rounded-lg font-medium hover:bg-brand-hover transition-colors shadow-sm">
          Download Report
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.name} className="p-6 bg-card rounded-xl border border-border shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{stat.name}</p>
                <h3 className="text-2xl font-bold mt-2 text-card-foreground">{stat.value}</h3>
              </div>
              <div className="p-2 bg-brand/10 rounded-lg text-brand">
                <stat.icon className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-1 text-sm">
              {stat.trend === "up" ? (
                <ArrowUpRight className="w-4 h-4 text-emerald-500" />
              ) : (
                <ArrowDownRight className="w-4 h-4 text-rose-500" />
              )}
              <span className={stat.trend === "up" ? "text-emerald-500 font-medium" : "text-rose-500 font-medium"}>
                {stat.change}
              </span>
              <span className="text-muted-foreground ml-1">from last month</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <div className="p-6 bg-card rounded-xl border border-border shadow-sm h-80 flex flex-col justify-center items-center text-muted-foreground">
          <Activity className="w-12 h-12 mb-4 opacity-20" />
          <p>Revenue Chart Placeholder</p>
        </div>
        <div className="p-6 bg-card rounded-xl border border-border shadow-sm h-80 flex flex-col justify-center items-center text-muted-foreground">
          <Users className="w-12 h-12 mb-4 opacity-20" />
          <p>User Growth Chart Placeholder</p>
        </div>
      </div>
    </div>
  );
}
