"use client";

import { useEffect, useState } from "react";
import { projectService } from "@/lib/services/projectService";
import { formatCurrency } from "@/utils/formatters";
import { PiggyBank } from "lucide-react";
import Link from "next/link";

interface ProjectFundSourceItem {
  fund_source_id: number;
  fund_source_name: string;
  current_amount: number;
}

export function ProjectFundSources({ projectId }: { projectId: number | string }) {
  const [items, setItems] = useState<ProjectFundSourceItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await projectService.getProjectFundSources(projectId);
        setItems(res.fund_sources);
      } catch (e) {
        console.error("Failed to fetch project fund sources", e);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [projectId]);

  if (!loading && items.length === 0) return null;

  return (
    <div className="bg-card border border-border/50 rounded-xl shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-border/50 flex items-center gap-2">
        <PiggyBank className="w-4 h-4 text-muted-foreground" />
        <h3 className="font-semibold text-foreground text-sm">Sumber Modal Project Ini</h3>
      </div>
      {loading ? (
        <div className="px-6 py-4 text-sm text-muted-foreground">Memuat sumber modal...</div>
      ) : (
        <div className="divide-y divide-border/50">
          {items.map((item) => (
            <div key={item.fund_source_id} className="px-6 py-3 flex items-center justify-between">
              <Link
                href={`/dashboard/fund-sources/${item.fund_source_id}`}
                className="text-sm font-medium text-foreground hover:text-primary transition-colors"
              >
                {item.fund_source_name}
              </Link>
              <span className="text-sm font-semibold text-primary">
                {formatCurrency(item.current_amount)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
