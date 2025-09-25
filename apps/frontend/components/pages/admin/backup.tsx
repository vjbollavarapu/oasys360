"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Download, 
  Upload,
  RefreshCw,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Database,
  HardDrive,
  Cloud,
  Settings,
  Play,
  Pause,
  Stop
} from "lucide-react"

interface BackupJob {
  id: string
  name: string
  type: "full" | "incremental" | "differential"
  status: "running" | "completed" | "failed" | "scheduled"
  startTime: string
  endTime?: string
  size: string
  location: "local" | "cloud" | "hybrid"
  retention: string
}

export function BackupRestoreOverview() {
  const [backupJobs, setBackupJobs] = useState<BackupJob[]>([])
  const [isCreatingBackup, setIsCreatingBackup] = useState(false)

  // Mock data
  useEffect(() => {
    setBackupJobs([
      {
        id: "1",
        name: "Daily Full Backup",
        type: "full",
        status: "completed",
        startTime: "2024-01-15T02:00:00Z",
        endTime: "2024-01-15T03:30:00Z",
        size: "2.5 GB",
        location: "cloud",
        retention: "30 days"
      },
      {
        id: "2",
        name: "Hourly Incremental",
        type: "incremental",
        status: "running",
        startTime: "2024-01-15T10:00:00Z",
        size: "150 MB",
        location: "local",
        retention: "7 days"
      },
      {
        id: "3",
        name: "Weekly Full Backup",
        type: "full",
        status: "scheduled",
        startTime: "2024-01-16T02:00:00Z",
        size: "2.8 GB",
        location: "hybrid",
        retention: "90 days"
      },
      {
        id: "4",
        name: "Database Backup",
        type: "full",
        status: "failed",
        startTime: "2024-01-14T22:00:00Z",
        endTime: "2024-01-14T22:15:00Z",
        size: "500 MB",
        location: "cloud",
        retention: "30 days"
      }
    ])
  }, [])

  const handleCreateBackup = async () => {
    setIsCreatingBackup(true)
    // Simulate backup creation
    await new Promise(resolve => setTimeout(resolve, 2000))
    setIsCreatingBackup(false)
  }

  const handleRestore = async (backupId: string) => {
    if (confirm("Are you sure you want to restore this backup? This will overwrite current data.")) {
      // Simulate restore process
      console.log("Restoring backup:", backupId)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "running": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      case "failed": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      case "scheduled": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "full": return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
      case "incremental": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      case "differential": return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300"
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
    }
  }

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Backup & Restore</h1>
          <p className="text-muted-foreground">
            Manage system backups and data recovery
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
          <Button 
            onClick={handleCreateBackup}
            disabled={isCreatingBackup}
          >
            {isCreatingBackup ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            {isCreatingBackup ? "Creating..." : "Create Backup"}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="backups" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="backups">Backups</TabsTrigger>
          <TabsTrigger value="restore">Restore</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="backups" className="space-y-4">
          {/* Backup Jobs */}
          <div className="space-y-4">
            {backupJobs.map((job) => (
              <Card key={job.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold">{job.name}</h3>
                        <Badge className={getStatusColor(job.status)}>
                          {job.status}
                        </Badge>
                        <Badge className={getTypeColor(job.type)}>
                          {job.type}
                        </Badge>
                        <Badge variant="outline">
                          {job.location}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                        <div>
                          <span className="text-muted-foreground">Size:</span>
                          <span className="ml-2 font-medium">{job.size}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Retention:</span>
                          <span className="ml-2 font-medium">{job.retention}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Started:</span>
                          <span className="ml-2 font-medium">{formatTimestamp(job.startTime)}</span>
                        </div>
                        {job.endTime && (
                          <div>
                            <span className="text-muted-foreground">Completed:</span>
                            <span className="ml-2 font-medium">{formatTimestamp(job.endTime)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {job.status === "running" && (
                        <Button variant="outline" size="sm">
                          <Pause className="h-4 w-4" />
                        </Button>
                      )}
                      {job.status === "completed" && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleRestore(job.id)}
                        >
                          <Upload className="h-4 w-4" />
                        </Button>
                      )}
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="restore" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Restore from Backup</CardTitle>
              <CardDescription>
                Select a backup to restore your system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <h3 className="font-medium mb-2">⚠️ Important Notes</h3>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Restoring will overwrite current data</li>
                    <li>• Make sure to backup current data before restoring</li>
                    <li>• System will be unavailable during restore process</li>
                    <li>• Restore process cannot be interrupted</li>
                  </ul>
                </div>
                
                <div className="text-center text-muted-foreground">
                  <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Select a backup from the Backups tab to restore</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Backup Settings</CardTitle>
                <CardDescription>
                  Configure backup schedules and retention
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Backup Frequency</label>
                    <select className="w-full mt-1 p-2 border rounded text-sm">
                      <option>Daily</option>
                      <option>Weekly</option>
                      <option>Monthly</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Retention Period</label>
                    <select className="w-full mt-1 p-2 border rounded text-sm">
                      <option>7 days</option>
                      <option>30 days</option>
                      <option>90 days</option>
                      <option>1 year</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Backup Location</label>
                    <select className="w-full mt-1 p-2 border rounded text-sm">
                      <option>Local Storage</option>
                      <option>Cloud Storage</option>
                      <option>Hybrid (Local + Cloud)</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Storage Information</CardTitle>
                <CardDescription>
                  Current storage usage and capacity
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Local Storage</span>
                      <span>75% used</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: '75%' }}></div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">750 GB / 1 TB</p>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Cloud Storage</span>
                      <span>45% used</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{ width: '45%' }}></div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">4.5 TB / 10 TB</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
