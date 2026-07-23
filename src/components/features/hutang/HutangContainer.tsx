"use client";

import { useState } from "react";
import { PaginatedDebtGroupResponse } from "@/types/hutang";
import { DebtGroupTable } from "./DebtGroupTable";
import { DebtGroupDetail } from "./DebtGroupDetail";

export function HutangContainer({ initialData }: { initialData: PaginatedDebtGroupResponse | null }) {
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);

  if (selectedGroupId) {
    return (
      <DebtGroupDetail 
        groupId={selectedGroupId} 
        onBack={() => setSelectedGroupId(null)} 
      />
    );
  }

  return (
    <DebtGroupTable 
      initialData={initialData} 
      onSelectGroup={setSelectedGroupId} 
    />
  );
}
