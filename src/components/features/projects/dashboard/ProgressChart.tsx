"use client";

import { useEffect, useState } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { rabService } from "@/lib/services/rabService";
import { Loader2 } from "lucide-react";
import Link from "next/link";

interface ProgressChartProps {
  projectId: string | number;
  currentProgress: number;
}

type GroupBy = 'day' | 'week' | 'month';

export function ProgressChart({ projectId, currentProgress }: ProgressChartProps) {
  const [groupBy, setGroupBy] = useState<GroupBy>('day');
  const [data, setData] = useState<{ date: string, overall_progress_percentage: number }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await rabService.getProgressTimeline(projectId, groupBy);
        setData(response.data);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch timeline');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [projectId, groupBy]);

  return (
    <div className="bg-card border border-border rounded-xl p-5 shadow-sm mb-6 w-full">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-1">Progress Project</p>
          <div className="flex items-end gap-3">
            <p className="text-4xl font-bold text-blue-600 dark:text-blue-500">
              {currentProgress.toFixed(1)}%
            </p>
            <Link 
              href={`/dashboard/projects/${projectId}/progress`}
              className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 mb-1 font-medium transition-colors"
            >
              Lihat Detail &rarr;
            </Link>
          </div>
        </div>
        
        <div className="flex bg-muted rounded-lg p-1 w-fit">
          <button 
            onClick={() => setGroupBy('day')}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${groupBy === 'day' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
          >
            Harian
          </button>
          <button 
            onClick={() => setGroupBy('week')}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${groupBy === 'week' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
          >
            Mingguan
          </button>
          <button 
            onClick={() => setGroupBy('month')}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${groupBy === 'month' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
          >
            Bulanan
          </button>
        </div>
      </div>

      <div className="h-[250px] w-full relative">
        {isLoading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/50 backdrop-blur-sm rounded-lg">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        )}
        
        {error ? (
          <div className="h-full flex items-center justify-center text-red-500 text-sm">
            {error}
          </div>
        ) : data.length === 0 && !isLoading ? (
          <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
            Belum ada data progres.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorProgress" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="opacity-10" />
              <XAxis 
                dataKey="date" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: 'currentColor' }}
                className="text-muted-foreground"
                tickFormatter={(value) => {
                  const d = new Date(value);
                  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
                }}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: 'currentColor' }}
                className="text-muted-foreground"
                domain={[0, 100]}
                tickFormatter={(val) => `${val}%`}
              />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--card)', color: 'var(--foreground)' }}
                itemStyle={{ color: 'var(--foreground)' }}
                labelFormatter={(label) => new Date(label as string | number).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                formatter={(value: any) => [`${Number(value || 0).toFixed(2)}%`, 'Progres']}
              />
              <Area 
                type="monotone" 
                dataKey="overall_progress_percentage" 
                stroke="#2563eb" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorProgress)" 
                animationDuration={1000}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
