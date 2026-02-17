/**
 * Digital Signatures Page
 * Main page for digital signature management
 */

"use client";

import { DashboardLayout } from "@/components/dashboard-layout"
import { DigitalSignaturesOverview } from "@/components/pages/invoicing/signatures"

export default function SignaturesPage() {
  return (
    <DashboardLayout>
      <div className="space-y-8 bg-soft-gradient -m-10 p-10 rounded-4xl">
        <DigitalSignaturesOverview />
      </div>
    </DashboardLayout>
  )
}
