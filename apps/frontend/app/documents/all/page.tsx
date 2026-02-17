"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { useState, useEffect } from "react"
import { AllDocumentsOverview } from "@/components/pages/documents/all"

export default function AllDocumentsPage() {
  return (
    <DashboardLayout>
      <AllDocumentsOverview />
    </DashboardLayout>
  )
}
