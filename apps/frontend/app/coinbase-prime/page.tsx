"use client";

import { DashboardLayout } from "@/components/dashboard-layout";
import { CoinbasePrimeDashboard } from "@/components/coinbase-prime/coinbase-prime-dashboard";

export default function CoinbasePrimePage() {
  return (
    <DashboardLayout>
      <CoinbasePrimeDashboard />
    </DashboardLayout>
  );
}

