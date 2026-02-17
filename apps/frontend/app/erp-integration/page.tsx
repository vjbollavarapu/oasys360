"use client";

import { DashboardLayout } from "@/components/dashboard-layout";
import { ErpIntegrationDashboard } from "@/components/erp-integration/erp-integration-dashboard";

export default function ErpIntegrationPage() {
  return (
    <DashboardLayout>
      <ErpIntegrationDashboard />
    </DashboardLayout>
  );
}

