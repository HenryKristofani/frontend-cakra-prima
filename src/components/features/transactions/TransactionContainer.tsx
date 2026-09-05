"use client";

import { PaginatedResponse, Transaction, TransactionFilters, TransactionSummary } from "@/types/transaction";
import { useTransactions } from "@/hooks/useTransactions";
import { TransactionSummaryCards } from "./TransactionSummaryCards";
import { TransactionTable } from "./TransactionTable";

interface TransactionContainerProps {
  initialData: PaginatedResponse<Transaction>;
  initialSummary: TransactionSummary;
  initialFilters?: TransactionFilters;
  lockedProjectId?: number | string;
  lockedProjectName?: string;
}

export function TransactionContainer({ 
  initialData, 
  initialSummary, 
  initialFilters = {},
  lockedProjectId,
  lockedProjectName,
}: TransactionContainerProps) {
  const {
    transactions,
    pagination,
    summary,
    isLoading,
    changePage,
    changePerPage,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    bulkSaveTransactions,
  } = useTransactions(initialData, initialSummary, initialFilters);

  return (
    <>
      <TransactionSummaryCards summary={summary} />
      <TransactionTable 
        transactions={transactions}
        pagination={pagination}
        isLoading={isLoading}
        changePage={changePage}
        changePerPage={changePerPage}
        bulkSaveTransactions={bulkSaveTransactions}
        addTransaction={addTransaction}
        updateTransaction={updateTransaction}
        deleteTransaction={deleteTransaction}
        lockedProjectId={lockedProjectId}
        lockedProjectName={lockedProjectName}
      />
    </>
  );
}