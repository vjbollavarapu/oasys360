"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { useState, useEffect } from "react"
import { CustomersOverview } from "@/components/pages/sales/customers"

export default function CustomersPage() {
  return (
    <DashboardLayout>
      <CustomersOverview />
    </DashboardLayout>
  )
}
