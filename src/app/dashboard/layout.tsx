import { ReactNode, Suspense } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DashboardLayout>{children}</DashboardLayout>
    </Suspense>
  );
}
