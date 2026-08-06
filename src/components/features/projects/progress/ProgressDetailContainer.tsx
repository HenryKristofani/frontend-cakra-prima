"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { ChevronRight, ChevronDown, Calendar } from "lucide-react";
import { ProgressDetailCategory, ProgressDetailItem, ProgressDetailResponse, progressService } from "@/lib/services/progressService";
import { formatCurrency } from "@/utils/formatters";
import { ProgressHistoryPanel } from "./ProgressHistoryPanel";
import Link from "next/link";

interface ProgressDetailContainerProps {
  projectId: string | number;
  projectName: string;
}

export function ProgressDetailContainer({ projectId, projectName }: ProgressDetailContainerProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  
  const [data, setData] = useState<ProgressDetailResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [expandedItems, setExpandedItems] = useState<Record<number, boolean>>({});

  const currentDateParam = searchParams.get("date") || "";

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await progressService.getProgressDetail(projectId, currentDateParam);
        setData(response);
      } catch (e: any) {
        setError(e.message || "Failed to load progress details");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [projectId, currentDateParam]);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const params = new URLSearchParams(searchParams.toString());
    if (e.target.value) {
      params.set("date", e.target.value);
    } else {
      params.delete("date");
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  const toggleItem = (itemId: number) => {
    setExpandedItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  const renderCategory = (category: ProgressDetailCategory, depth = 0) => {
    return (
      <div key={category.id} className="w-full">
        {/* Category Header */}
        <div className={`bg-muted/50 border-b border-border py-3 px-4 flex items-center font-semibold text-sm`}>
          <div style={{ paddingLeft: `${depth * 1.5}rem` }} className="flex items-center gap-2">
            <span className="text-muted-foreground">{category.code || "-"}</span>
            <span>{category.name}</span>
          </div>
        </div>

        {/* Items */}
        {category.items.length > 0 && (
          <div className="divide-y divide-border">
            {category.items.map(item => (
              <div key={item.id} className="flex flex-col">
                <div 
                  onClick={() => toggleItem(item.id)}
                  className={`flex flex-col md:flex-row md:items-center py-3 px-4 hover:bg-muted/30 cursor-pointer transition-colors ${expandedItems[item.id] ? 'bg-muted/30' : ''}`}
                >
                  <div style={{ paddingLeft: `${depth * 1.5 + 2}rem` }} className="flex-1 flex items-center gap-2 mb-2 md:mb-0">
                    {expandedItems[item.id] ? (
                      <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                    )}
                    <span className="text-sm">{item.description}</span>
                  </div>
                  
                  <div className="flex items-center justify-between md:justify-end gap-6 md:w-[60%] pl-6 md:pl-0">
                    <div className="flex flex-col items-end w-24 shrink-0">
                      <span className="text-xs text-muted-foreground">Bobot RAB</span>
                      <span className="text-sm font-medium tabular-nums">{item.bobot_percentage.toFixed(2)}%</span>
                    </div>
                    
                    <div className="flex flex-col items-end w-32 shrink-0">
                      <span className="text-xs text-muted-foreground">Progress Saat Ini</span>
                      <span className="text-sm font-medium text-blue-600 dark:text-blue-500 tabular-nums">
                        {item.latest_percentage_complete.toFixed(2)}%
                      </span>
                    </div>
                    
                    <div className="flex flex-col items-end w-32 shrink-0">
                      <span className="text-xs text-muted-foreground">Kontribusi Bobot</span>
                      <span className="text-sm font-medium text-emerald-600 dark:text-emerald-500 tabular-nums">
                        {item.weighted_contribution.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Lazy Loaded History Panel */}
                {expandedItems[item.id] && (
                  <div className="border-t border-border">
                    <ProgressHistoryPanel itemId={item.id} />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Children Categories */}
        {category.children.length > 0 && (
          <div className="w-full">
            {category.children.map(child => renderCategory(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Detail Progress Project</h1>
          <p className="text-muted-foreground">
            {projectName}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Link href={`/dashboard/projects/${projectId}`} className="text-sm text-muted-foreground hover:text-foreground">
            &larr; Kembali ke Dashboard
          </Link>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input 
              type="date" 
              className="pl-9 pr-4 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              value={currentDateParam}
              onChange={handleDateChange}
            />
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="bg-card border border-border rounded-xl p-8 flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <span className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin"></span>
            <span>Memuat data...</span>
          </div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-6">
          {error}
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
          <div className="p-5 border-b border-border flex justify-between items-center bg-muted/10">
            <div>
              <h3 className="font-semibold">Rincian per Kategori/Item RAB</h3>
              <p className="text-sm text-muted-foreground">
                As of {data?.date ? new Date(data.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Hari Ini'}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground mb-1">Total RAB Aktif</p>
              <p className="font-bold tabular-nums text-foreground">
                {formatCurrency(data?.total_rab_aktif || 0)}
              </p>
            </div>
          </div>
          
          <div className="w-full flex flex-col">
            {data?.categories.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                Belum ada kategori RAB untuk project ini.
              </div>
            ) : (
              data?.categories.map(cat => renderCategory(cat, 0))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
