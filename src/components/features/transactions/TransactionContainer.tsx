"use client";

import { PaginatedResponse, Transaction, TransactionSummary } from "@/types/transaction";
import { useTransactions } from "@/hooks/useTransactions";
import { TransactionSummaryCards } from "./TransactionSummaryCards";
import { TransactionTable } from "./TransactionTable";

interface TransactionContainerProps {
  initialData: PaginatedResponse<Transaction>;
  initialSummary: TransactionSummary;
}

export function TransactionContainer({ initialData, initialSummary }: TransactionContainerProps) {
  const {
    transactions,
    pagination,
    summary,
    isLoading,
    changePage,
    addTransaction,
    updateTransaction,
    deleteTransaction,
  } = useTransactions(initialData, initialSummary);

  return (
    <>
      <TransactionSummaryCards summary={summary} />
      <TransactionTable 
        transactions={transactions}
        pagination={pagination}
        isLoading={isLoading}
        changePage={changePage}
        addTransaction={addTransaction}
        updateTransaction={updateTransaction}
        deleteTransaction={deleteTransaction}
      />
    </>
  );
}
