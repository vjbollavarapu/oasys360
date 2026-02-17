"use client";

import { DashboardLayout } from "@/components/dashboard-layout";
import { GnosisSafeDashboard } from "@/components/gnosis-safe/gnosis-safe-dashboard";

export default function GnosisSafePage() {
  return (
    <DashboardLayout>
      <GnosisSafeDashboard />
    </DashboardLayout>
  );
}

