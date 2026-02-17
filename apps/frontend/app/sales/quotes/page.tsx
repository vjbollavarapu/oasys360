"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { useState, useEffect } from "react"
import { QuotesOverview } from "@/components/pages/sales/quotes"

export default function QuotesPage() {
  return (
    <DashboardLayout>
      <QuotesOverview />
    </DashboardLayout>
  )
}
