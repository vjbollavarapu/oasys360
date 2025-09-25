"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Lock,
  Unlock,
  Calendar,
  CheckCircle,
  AlertCircle,
} from "lucide-react"
import { useOrganization } from "@/hooks/use-organization"

export function FiscalPeriodsTable() {
  const { currentOrganization } = useOrganization()

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
      <CardHeader>
        <CardTitle className="text-blue-900 flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Fiscal Periods Management
        </CardTitle>
        <CardDescription className="text-blue-600">
          Manage fiscal periods and their lock status for {currentOrganization?.name}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border bg-white overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-blue-50">
                <TableHead className="font-semibold text-blue-900">Period</TableHead>
                <TableHead className="font-semibold text-blue-900">Start Date</TableHead>
                <TableHead className="font-semibold text-blue-900">End Date</TableHead>
                <TableHead className="font-semibold text-blue-900">Status</TableHead>
                <TableHead className="font-semibold text-blue-900">Lock Status</TableHead>
                <TableHead className="font-semibold text-blue-900">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentOrganization?.fiscalPeriods.map((period) => (
                <TableRow key={period.id} className="hover:bg-blue-25">
                  <TableCell className="font-medium text-blue-900">{period.name}</TableCell>
                  <TableCell className="text-blue-700">{period.startDate}</TableCell>
                  <TableCell className="text-blue-700">{period.endDate}</TableCell>
                  <TableCell>
                    <Badge
                      variant={period.isActive ? "default" : "secondary"}
                      className={period.isActive ? "bg-blue-100 text-blue-700 border-blue-300" : ""}
                    >
                      {period.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {period.isLocked ? (
                        <Lock className="w-4 h-4 text-blue-600" />
                      ) : (
                        <Unlock className="w-4 h-4 text-blue-600" />
                      )}
                      <Badge
                        variant={period.isLocked ? "destructive" : "default"}
                        className={!period.isLocked ? "bg-blue-100 text-blue-700 border-blue-300" : ""}
                      >
                        {period.isLocked ? "Locked" : "Open"}
                      </Badge>
                    </div>
                    {period.isLocked && period.lockedBy && (
                      <p className="text-xs text-blue-600 mt-1">
                        By: {period.lockedBy} on {period.lockedDate}
                      </p>
                    )}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant={period.isLocked ? "destructive" : "default"}
                      size="sm"
                      className={!period.isLocked ? "bg-blue-600 hover:bg-blue-700" : ""}
                    >
                      {period.isLocked ? (
                        <>
                          <Unlock className="w-4 h-4 mr-1" />
                          Unlock
                        </>
                      ) : (
                        <>
                          <Lock className="w-4 h-4 mr-1" />
                          Lock
                        </>
                      )}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
} 