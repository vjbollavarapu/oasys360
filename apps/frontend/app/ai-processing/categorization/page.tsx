"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { useState, useEffect } from "react"
import { TransactionCategorizationOverview } from "@/components/pages/ai-processing/categorization"

export default function TransactionCategorizationPage() {
  return (
    <DashboardLayout>
      <TransactionCategorizationOverview />
    </DashboardLayout>
  )
}
