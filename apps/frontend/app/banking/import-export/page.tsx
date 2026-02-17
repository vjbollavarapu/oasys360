/**
 * Import/Export Page
 * Main page for importing and exporting banking data
 */

"use client";

import { DashboardLayout } from "@/components/dashboard-layout"
import { BankImportExportOverview } from "@/components/pages/banking/import-export"

export default function ImportExportPage() {
  return (
    <DashboardLayout>
      <div className="space-y-8 bg-soft-gradient -m-10 p-10 rounded-4xl">
        <BankImportExportOverview />
      </div>
    </DashboardLayout>
  )
}

