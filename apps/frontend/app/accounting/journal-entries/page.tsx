/**
 * Journal Entries Page
 * Main page for managing journal entries
 */

"use client";

import { DashboardLayout } from "@/components/dashboard-layout"
import { JournalEntriesOverview } from "@/components/pages/accounting/journal-entries"

export default function JournalEntriesPage() {
  return (
    <DashboardLayout>
      <div className="space-y-8 bg-soft-gradient -m-10 p-10 rounded-4xl">
        <JournalEntriesOverview />
      </div>
    </DashboardLayout>
  )
}
