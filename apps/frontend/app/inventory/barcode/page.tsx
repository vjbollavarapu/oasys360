/**
 * Barcode Scanning Page
 * Main page for barcode scanning and management
 */

"use client";

import { DashboardLayout } from "@/components/dashboard-layout"
import { BarcodeScanningOverview } from "@/components/pages/inventory/barcode"

export default function BarcodePage() {
  return (
    <DashboardLayout>
      <div className="space-y-8 bg-soft-gradient -m-10 p-10 rounded-4xl">
        <BarcodeScanningOverview />
      </div>
    </DashboardLayout>
  )
}
