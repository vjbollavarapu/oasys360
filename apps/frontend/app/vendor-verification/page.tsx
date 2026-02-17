"use client";

import { DashboardLayout } from "@/components/dashboard-layout";
import { VendorVerificationDashboard } from "@/components/vendor-verification/vendor-verification-dashboard";

export default function VendorVerificationPage() {
  return (
    <DashboardLayout>
      <VendorVerificationDashboard />
    </DashboardLayout>
  );
}

