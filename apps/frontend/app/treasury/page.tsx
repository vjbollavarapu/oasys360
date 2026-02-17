"use client";

import { DashboardLayout } from "@/components/dashboard-layout";
import { TreasuryDashboard } from "@/components/treasury/treasury-dashboard";

export default function TreasuryPage() {
  return (
    <DashboardLayout>
      <TreasuryDashboard />
    </DashboardLayout>
  );
}

