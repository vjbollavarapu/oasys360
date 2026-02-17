"use client";

import { DashboardLayout } from "@/components/dashboard-layout";
import { TaxDashboard } from "@/components/tax-optimization/tax-dashboard";

export default function TaxOptimizationPage() {
  return (
    <DashboardLayout>
      <TaxDashboard />
    </DashboardLayout>
  );
}

