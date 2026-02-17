"use client";

import { DashboardLayout } from "@/components/dashboard-layout";
import { FxConverter } from "@/components/fx-conversion/fx-converter";

export default function FxConversionPage() {
  return (
    <DashboardLayout>
      <FxConverter />
    </DashboardLayout>
  );
}

