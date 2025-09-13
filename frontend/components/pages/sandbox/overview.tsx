"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  TestTube,
  Play,
  RotateCcw,
  Save,
  Download,
  Upload,
  Settings,
  Brain,
  TrendingUp,
  BarChart3,
  Package,
  DollarSign,
  Clock,
  Eye,
  AlertTriangle,
  CheckCircle,
  Activity,
  Target,
  Shuffle,
  FastForward,
  Pause,
  SkipForward,
  Database,
  FileText,
  BookOpen,
  LineChart,
  GitBranch,
  Copy,
  RefreshCw,
  Plus,
} from "lucide-react"

// Mock data for sandbox scenarios
const sandboxScenarios = [
  {
    id: "scenario-1",
    name: "Q4 Revenue Growth",
    description: "Simulate 25% revenue increase with corresponding expense adjustments",
    category: "Revenue Simulation",
    duration: "3 months",
    complexity: "Medium",
    parameters: {
      revenueGrowth: 25,
      expenseGrowth: 15,
      customerGrowth: 20,
      inventoryTurnover: 1.5,
    },
    status: "Ready",
    lastRun: null,
  },
  {
    id: "scenario-2",
    name: "Inventory Optimization",
    description: "Test AI-driven inventory reorder points and demand forecasting",
    category: "Inventory Simulation",
    duration: "6 months",
    complexity: "High",
    parameters: {
      demandVariability: 30,
      leadTimeVariation: 20,
      seasonalityFactor: 1.8,
      stockoutTolerance: 5,
    },
    status: "Running",
    lastRun: "2024-01-15 14:30",
  },
  {
    id: "scenario-3",
    name: "Cash Flow Stress Test",
    description: "Simulate delayed payments and cash flow challenges",
    category: "Financial Simulation",
    duration: "1 month",
    complexity: "Low",
    parameters: {
      paymentDelays: 45,
      collectionRate: 85,
      emergencyExpenses: 50000,
      creditUtilization: 70,
    },
    status: "Completed",
    lastRun: "2024-01-14 09:15",
  },
]

// Mock simulation results
const simulationResults = {
  accounting: {
    journalEntries: 247,
    ledgerAccounts: 45,
    trialBalanceVariance: 0.02,
    complianceScore: 98.5,
    auditTrailIntegrity: 100,
  },
  inventory: {
    stockMovements: 1834,
    reorderTriggers: 23,
    stockoutPrevention: 94.7,
    carryingCostReduction: 12.3,
    turnoverImprovement: 18.5,
  },
  financial: {
    cashFlowProjection: 6,
    profitabilityImpact: 8.7,
    riskAssessment: "Medium",
    complianceGaps: 2,
    recommendedActions: 12,
  },
}

// Mock ledger preview data
const ledgerPreview = [
  {
    account: "1000 - Cash and Cash Equivalents",
    currentBalance: 247392.0,
    simulatedBalance: 289456.0,
    variance: 42064.0,
    variancePercent: 17.0,
    impact: "Positive",
  },
  {
    account: "1200 - Accounts Receivable",
    currentBalance: 89247.0,
    simulatedBalance: 111559.0,
    variance: 22312.0,
    variancePercent: 25.0,
    impact: "Positive",
  },
  {
    account: "2000 - Accounts Payable",
    currentBalance: 34892.0,
    simulatedBalance: 40126.0,
    variance: 5234.0,
    variancePercent: 15.0,
    impact: "Neutral",
  },
  {
    account: "4000 - Revenue",
    currentBalance: 1247392.0,
    simulatedBalance: 1559240.0,
    variance: 311848.0,
    variancePercent: 25.0,
    impact: "Positive",
  },
]

// Mock inventory simulation data
const inventorySimulation = [
  {
    product: 'MacBook Pro 16" M3',
    currentStock: 45,
    projectedDemand: 67,
    suggestedReorder: 85,
    stockoutRisk: "Low",
    carryingCost: 2847.5,
    optimalStock: 72,
    forecastAccuracy: 94.2,
  },
  {
    product: "Dell XPS 13",
    currentStock: 12,
    projectedDemand: 28,
    suggestedReorder: 35,
    stockoutRisk: "High",
    carryingCost: 1456.8,
    optimalStock: 25,
    forecastAccuracy: 89.7,
  },
  {
    product: "Office Chair Pro",
    currentStock: 0,
    projectedDemand: 15,
    suggestedReorder: 25,
    stockoutRisk: "Critical",
    carryingCost: 0,
    optimalStock: 18,
    forecastAccuracy: 91.3,
  },
]

export function SandboxOverview() {
  const [activeTab, setActiveTab] = useState("overview")
  const [selectedScenario, setSelectedScenario] = useState(null)
  const [simulationSpeed, setSimulationSpeed] = useState([1])
  const [isSimulationRunning, setIsSimulationRunning] = useState(false)
  const [simulationProgress, setSimulationProgress] = useState(0)
  const [autoSave, setAutoSave] = useState(true)
  const [realTimeUpdates, setRealTimeUpdates] = useState(true)

  const handleRunSimulation = (scenarioId: string) => {
    setIsSimulationRunning(true)
    setSimulationProgress(0)

    // Simulate progress
    const interval = setInterval(() => {
      setSimulationProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsSimulationRunning(false)
          return 100
        }
        return prev + 10
      })
    }, 500)
  }

  const handleResetSandbox = () => {
    setSimulationProgress(0)
    setIsSimulationRunning(false)
    setSelectedScenario(null)
  }

  return (
    <div className="space-y-8 bg-soft-gradient -m-10 p-10 rounded-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <TestTube className="w-8 h-8 text-primary" />
            Sandbox Environment
          </h1>
          <p className="text-muted-foreground mt-2">
            Test and simulate accounting operations, ledger behaviors, and inventory movements safely
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="rounded-full">
            <Database className="w-3 h-3 mr-1" />
            Test Environment
          </Badge>
          <Button variant="outline" size="lg" className="rounded-full">
            <Upload className="w-4 h-4 mr-2" />
            Load Scenario
          </Button>
          <Button variant="outline" size="lg" className="rounded-full">
            <Save className="w-4 h-4 mr-2" />
            Save State
          </Button>
          <Button
            onClick={handleResetSandbox}
            variant="outline"
            size="lg"
            className="rounded-full border-destructive/50 text-destructive hover:bg-destructive/10"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>
        </div>
      </div>

      {/* Simulation Status */}
      {isSimulationRunning && (
        <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="animate-spin">
                  <RefreshCw className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">Simulation Running</h3>
                  <p className="text-sm text-muted-foreground">Processing scenario parameters...</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-primary">{simulationProgress}%</div>
                <div className="text-sm text-muted-foreground">Complete</div>
              </div>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-500"
                style={{ width: `${simulationProgress}%` }}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Control Panel */}
      <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Simulation Controls
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="space-y-3">
              <Label>Simulation Speed</Label>
              <div className="space-y-2">
                <Slider
                  value={simulationSpeed}
                  onValueChange={setSimulationSpeed}
                  max={10}
                  min={0.1}
                  step={0.1}
                  className="w-full"
                />
                <div className="text-sm text-muted-foreground">{simulationSpeed[0]}x speed</div>
              </div>
            </div>
            <div className="space-y-3">
              <Label>Auto-Save</Label>
              <div className="flex items-center space-x-2">
                <Switch checked={autoSave} onCheckedChange={setAutoSave} />
                <span className="text-sm text-muted-foreground">Save progress automatically</span>
              </div>
            </div>
            <div className="space-y-3">
              <Label>Real-time Updates</Label>
              <div className="flex items-center space-x-2">
                <Switch checked={realTimeUpdates} onCheckedChange={setRealTimeUpdates} />
                <span className="text-sm text-muted-foreground">Live data updates</span>
              </div>
            </div>
            <div className="space-y-3">
              <Label>Quick Actions</Label>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="rounded-xl">
                  <FastForward className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="outline" className="rounded-xl">
                  <Pause className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="outline" className="rounded-xl">
                  <SkipForward className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-card/50 backdrop-blur-sm p-2 rounded-full h-auto border">
          <TabsTrigger
            value="overview"
            className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <Activity className="w-4 h-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger
            value="accounting"
            className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <FileText className="w-4 h-4 mr-2" />
            Accounting Simulation
          </TabsTrigger>
          <TabsTrigger
            value="ledger"
            className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <BookOpen className="w-4 h-4 mr-2" />
            Ledger Preview
          </TabsTrigger>
          <TabsTrigger
            value="inventory"
            className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <Package className="w-4 h-4 mr-2" />
            Inventory Forecast
          </TabsTrigger>
          <TabsTrigger
            value="scenarios"
            className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <GitBranch className="w-4 h-4 mr-2" />
            Scenarios
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-2xl">
                  <TestTube className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <Badge variant="secondary" className="rounded-full">Active</Badge>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Active Simulations</p>
                <p className="text-2xl font-bold">3</p>
                <p className="text-sm text-muted-foreground mt-1">2 running, 1 completed</p>
              </div>
            </Card>

            <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-2xl">
                  <Target className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <Badge variant="secondary" className="rounded-full">Accuracy</Badge>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Simulation Accuracy</p>
                <p className="text-2xl font-bold">94.7%</p>
                <p className="text-sm text-muted-foreground mt-1">+2.3% from last run</p>
              </div>
            </Card>

            <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-2xl">
                  <Database className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <Badge variant="secondary" className="rounded-full">Processed</Badge>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Data Points Processed</p>
                <p className="text-2xl font-bold">2.4M</p>
                <p className="text-sm text-muted-foreground mt-1">Across all simulations</p>
              </div>
            </Card>

            <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-orange-100 dark:bg-orange-900/20 rounded-2xl">
                  <Brain className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </div>
                <Badge variant="secondary" className="rounded-full">Insights</Badge>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Insights Generated</p>
                <p className="text-2xl font-bold">47</p>
                <p className="text-sm text-muted-foreground mt-1">12 actionable recommendations</p>
              </div>
            </Card>
          </div>

          {/* Simulation Results Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Accounting Results
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Journal Entries</span>
                  <span className="font-medium">{simulationResults.accounting.journalEntries}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Ledger Accounts</span>
                  <span className="font-medium">{simulationResults.accounting.ledgerAccounts}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Compliance Score</span>
                  <span className="font-medium">{simulationResults.accounting.complianceScore}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Audit Integrity</span>
                  <span className="font-medium">
                    {simulationResults.accounting.auditTrailIntegrity}%
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Inventory Results
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Stock Movements</span>
                  <span className="font-medium">{simulationResults.inventory.stockMovements}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Reorder Triggers</span>
                  <span className="font-medium">{simulationResults.inventory.reorderTriggers}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Stockout Prevention</span>
                  <span className="font-medium">{simulationResults.inventory.stockoutPrevention}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Cost Reduction</span>
                  <span className="font-medium">
                    {simulationResults.inventory.carryingCostReduction}%
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Financial Impact
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Cash Flow Months</span>
                  <span className="font-medium">{simulationResults.financial.cashFlowProjection}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Profitability Impact</span>
                  <span className="font-medium">
                    +{simulationResults.financial.profitabilityImpact}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Risk Assessment</span>
                  <Badge className="bg-[#FFC700]/20 text-[#FFC700] border-[#FFC700]/30">
                    {simulationResults.financial.riskAssessment}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Recommendations</span>
                  <span className="font-medium">{simulationResults.financial.recommendedActions}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark">
            <CardHeader>
              <CardTitle>Quick Simulation Actions</CardTitle>
              <CardDescription>
                Run common simulation scenarios with one click
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Button
                  className="bg-primary text-primary-foreground hover:bg-primary/90 h-auto p-4 flex-col rounded-2xl"
                  onClick={() => handleRunSimulation("revenue-growth")}
                >
                  <TrendingUp className="w-6 h-6 mb-2" />
                  <span className="font-medium">Revenue Growth</span>
                  <span className="text-xs opacity-80">25% increase simulation</span>
                </Button>
                <Button
                  className="bg-secondary text-secondary-foreground hover:bg-secondary/90 h-auto p-4 flex-col rounded-2xl"
                  onClick={() => handleRunSimulation("inventory-optimization")}
                >
                  <Package className="w-6 h-6 mb-2" />
                  <span className="font-medium">Inventory Optimization</span>
                  <span className="text-xs opacity-80">AI-driven reorder points</span>
                </Button>
                <Button
                  variant="outline"
                  className="border-orange-500/50 text-orange-600 hover:bg-orange-500/10 h-auto p-4 flex-col rounded-2xl"
                  onClick={() => handleRunSimulation("cash-flow-stress")}
                >
                  <DollarSign className="w-6 h-6 mb-2" />
                  <span className="font-medium">Cash Flow Stress</span>
                  <span className="text-xs opacity-80">Payment delay scenarios</span>
                </Button>
                <Button
                  variant="outline"
                  className="border-green-500/50 text-green-600 hover:bg-green-500/10 h-auto p-4 flex-col rounded-2xl"
                  onClick={() => handleRunSimulation("compliance-audit")}
                >
                  <CheckCircle className="w-6 h-6 mb-2" />
                  <span className="font-medium">Compliance Audit</span>
                  <span className="text-xs opacity-80">Regulatory compliance test</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Accounting Simulation Tab */}
        <TabsContent value="accounting" className="space-y-6">
          <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    Accounting Action Simulator
                    <Badge variant="secondary" className="rounded-full">
                      <TestTube className="w-3 h-3 mr-1" />
                      Test Mode
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    Simulate journal entries, ledger postings, and financial operations
                  </CardDescription>
                </div>
                <Button className="rounded-full">
                  <Play className="w-4 h-4 mr-2" />
                  Run Simulation
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Simulation Parameters */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold">Transaction Volume</h3>
                  <div className="space-y-3">
                    <Label>Daily Transactions</Label>
                    <Input
                      type="number"
                      defaultValue="150"
                      className="rounded-xl"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label>Simulation Period</Label>
                    <Select>
                      <SelectTrigger className="rounded-xl">
                        <SelectValue placeholder="Select period" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1-week">1 Week</SelectItem>
                        <SelectItem value="1-month">1 Month</SelectItem>
                        <SelectItem value="3-months">3 Months</SelectItem>
                        <SelectItem value="1-year">1 Year</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold">Transaction Types</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Sales Invoices</Label>
                      <div className="flex items-center space-x-2">
                        <Switch defaultChecked />
                        <span className="text-sm text-muted-foreground">40%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Purchase Orders</Label>
                      <div className="flex items-center space-x-2">
                        <Switch defaultChecked />
                        <span className="text-sm text-muted-foreground">25%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Expense Claims</Label>
                      <div className="flex items-center space-x-2">
                        <Switch defaultChecked />
                        <span className="text-sm text-muted-foreground">20%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Bank Transfers</Label>
                      <div className="flex items-center space-x-2">
                        <Switch defaultChecked />
                        <span className="text-sm text-muted-foreground">15%</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold">AI Parameters</h3>
                  <div className="space-y-3">
                    <Label>Categorization Accuracy</Label>
                    <Slider defaultValue={[95]} max={100} min={80} step={1} />
                    <div className="text-sm text-muted-foreground">95% accuracy</div>
                  </div>
                  <div className="space-y-3">
                    <Label>Error Rate</Label>
                    <Slider defaultValue={[2]} max={10} min={0} step={0.5} />
                    <div className="text-sm text-muted-foreground">2% error rate</div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch defaultChecked />
                    <Label className="text-muted-foreground">Enable Learning Mode</Label>
                  </div>
                </div>
              </div>

              {/* Live Simulation Feed */}
              <div className="space-y-4">
                <h3 className="font-semibold">Live Simulation Feed</h3>
                <div className="bg-muted/20 border rounded-2xl p-4 h-64 overflow-y-auto">
                  <div className="space-y-2 font-mono text-sm">
                    <div className="flex items-center gap-2 text-primary">
                      <Clock className="w-3 h-3" />
                      <span>14:32:15</span>
                      <span>Journal Entry JE-2024-247 created - Sales Invoice $12,500</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-3 h-3" />
                      <span>14:32:16</span>
                      <span>AI Categorization: Revenue (98.5% confidence)</span>
                    </div>
                    <div className="flex items-center gap-2 text-primary">
                      <Clock className="w-3 h-3" />
                      <span>14:32:17</span>
                      <span>Ledger posting: DR Accounts Receivable $12,500</span>
                    </div>
                    <div className="flex items-center gap-2 text-primary">
                      <Clock className="w-3 h-3" />
                      <span>14:32:18</span>
                      <span>Ledger posting: CR Revenue $12,500</span>
                    </div>
                    <div className="flex items-center gap-2 text-orange-600">
                      <Clock className="w-3 h-3" />
                      <span>14:32:19</span>
                      <span>Blockchain hash generated: 0x1a2b3c4d...</span>
                    </div>
                    <div className="flex items-center gap-2 text-green-600">
                      <Clock className="w-3 h-3" />
                      <span>14:32:20</span>
                      <span>Compliance check: PASSED</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Ledger Preview Tab */}
        <TabsContent value="ledger" className="space-y-6">
          <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    Ledger Behavior Preview
                    <Badge variant="secondary" className="rounded-full">
                      <Eye className="w-3 h-3 mr-1" />
                      Preview Mode
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    Compare current vs simulated ledger balances and impacts
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" className="rounded-full">
                    <Download className="w-4 h-4 mr-2" />
                    Export Preview
                  </Button>
                  <Button className="rounded-full">
                    <Shuffle className="w-4 h-4 mr-2" />
                    Generate Preview
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-2xl border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="font-semibold">Account</TableHead>
                      <TableHead className="font-semibold">Current Balance</TableHead>
                      <TableHead className="font-semibold">Simulated Balance</TableHead>
                      <TableHead className="font-semibold">Variance</TableHead>
                      <TableHead className="font-semibold">% Change</TableHead>
                      <TableHead className="font-semibold">Impact</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ledgerPreview.map((account, index) => (
                      <TableRow key={index} className="hover:bg-muted/30 transition-colors">
                        <TableCell className="font-medium">{account.account}</TableCell>
                        <TableCell>${account.currentBalance.toLocaleString()}</TableCell>
                        <TableCell>${account.simulatedBalance.toLocaleString()}</TableCell>
                        <TableCell className={`font-medium ${account.variance > 0 ? "text-green-600" : "text-red-600"}`}>
                          {account.variance > 0 ? "+" : ""}${account.variance.toLocaleString()}
                        </TableCell>
                        <TableCell
                          className={`font-medium ${account.variancePercent > 0 ? "text-green-600" : "text-red-600"}`}
                        >
                          {account.variancePercent > 0 ? "+" : ""}
                          {account.variancePercent}%
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              account.impact === "Positive" ? "default" :
                              account.impact === "Negative" ? "destructive" : "secondary"
                            }
                            className="rounded-full"
                          >
                            {account.impact}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Impact Analysis */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Financial Ratios Impact
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Current Ratio</span>
                  <div className="text-right">
                    <div className="font-medium">2.34 → 2.67</div>
                    <div className="text-xs text-green-600">+14.1% improvement</div>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Quick Ratio</span>
                  <div className="text-right">
                    <div className="font-medium">1.89 → 2.12</div>
                    <div className="text-xs text-green-600">+12.2% improvement</div>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Debt-to-Equity</span>
                  <div className="text-right">
                    <div className="font-medium">0.23 → 0.17</div>
                    <div className="text-xs text-green-600">-26.1% improvement</div>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">ROA</span>
                  <div className="text-right">
                    <div className="font-medium">16.1% → 19.8%</div>
                    <div className="text-xs text-green-600">+3.7% improvement</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Risk Assessment
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                    <span className="font-medium text-green-600 dark:text-green-400">Low Risk</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Improved liquidity ratios and reduced leverage indicate lower financial risk.
                  </p>
                </div>
                <div className="p-3 bg-orange-100 dark:bg-orange-900/20 rounded-xl border border-orange-200 dark:border-orange-800">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                    <span className="font-medium text-orange-600 dark:text-orange-400">Monitor</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Increased accounts receivable may impact cash flow timing.
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Overall Risk Score</span>
                    <span className="text-green-600 font-medium">23/100 (Low)</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: "23%" }} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Inventory Forecast Tab */}
        <TabsContent value="inventory" className="space-y-6">
          <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-[#F3F4F6] flex items-center gap-2">
                    Inventory Movement Simulation
                    <Badge className="bg-[#00FFC6]/20 text-[#00FFC6] border-[#00FFC6]/30">
                      <Brain className="w-3 h-3 mr-1" />
                      AI Forecast
                    </Badge>
                  </CardTitle>
                  <CardDescription className="text-[#F3F4F6]/70">
                    Simulate demand patterns, stock movements, and optimization scenarios
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" className="border-[#4B0082]/50 text-[#F3F4F6] hover:bg-[#4B0082]/20">
                    <Settings className="w-4 h-4 mr-2" />
                    Configure
                  </Button>
                  <Button className="bg-[#00FFC6] text-[#1B1D23] hover:bg-[#00FFC6]/90">
                    <Play className="w-4 h-4 mr-2" />
                    Run Forecast
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Forecast Parameters */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="space-y-4">
                  <h3 className="font-semibold text-[#F3F4F6]">Forecast Period</h3>
                  <Select>
                    <SelectTrigger className="bg-[#1B1D23] border-[#4B0082]/30 text-[#F3F4F6]">
                      <SelectValue placeholder="Select period" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1B1D23] border-[#4B0082]/30">
                      <SelectItem value="1-month">1 Month</SelectItem>
                      <SelectItem value="3-months">3 Months</SelectItem>
                      <SelectItem value="6-months">6 Months</SelectItem>
                      <SelectItem value="1-year">1 Year</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="space-y-2">
                    <Label className="text-[#F3F4F6]">Demand Variability</Label>
                    <Slider defaultValue={[30]} max={100} min={0} step={5} />
                    <div className="text-sm text-[#F3F4F6]/70">30% variability</div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-[#F3F4F6]">Market Conditions</h3>
                  <div className="space-y-2">
                    <Label className="text-[#F3F4F6]">Seasonality Factor</Label>
                    <Slider defaultValue={[150]} max={300} min={50} step={10} />
                    <div className="text-sm text-[#F3F4F6]/70">1.5x seasonal multiplier</div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[#F3F4F6]">Market Growth</Label>
                    <Slider defaultValue={[15]} max={50} min={-20} step={1} />
                    <div className="text-sm text-[#F3F4F6]/70">+15% growth rate</div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-[#F3F4F6]">Supply Chain</h3>
                  <div className="space-y-2">
                    <Label className="text-[#F3F4F6]">Lead Time Variation</Label>
                    <Slider defaultValue={[20]} max={100} min={0} step={5} />
                    <div className="text-sm text-[#F3F4F6]/70">±20% variation</div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch defaultChecked />
                    <Label className="text-[#F3F4F6]">Enable Safety Stock</Label>
                  </div>
                </div>
              </div>

              {/* Simulation Results */}
              <Table>
                <TableHeader>
                  <TableRow className="border-[#4B0082]/30">
                    <TableHead className="text-[#F3F4F6]/80">Product</TableHead>
                    <TableHead className="text-[#F3F4F6]/80">Current Stock</TableHead>
                    <TableHead className="text-[#F3F4F6]/80">Projected Demand</TableHead>
                    <TableHead className="text-[#F3F4F6]/80">Suggested Reorder</TableHead>
                    <TableHead className="text-[#F3F4F6]/80">Stockout Risk</TableHead>
                    <TableHead className="text-[#F3F4F6]/80">Optimal Stock</TableHead>
                    <TableHead className="text-[#F3F4F6]/80">Forecast Accuracy</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {inventorySimulation.map((item, index) => (
                    <TableRow key={index} className="border-[#4B0082]/20">
                      <TableCell className="text-[#F3F4F6] font-medium">{item.product}</TableCell>
                      <TableCell className="text-[#F3F4F6]">{item.currentStock}</TableCell>
                      <TableCell className="text-[#F3F4F6]">{item.projectedDemand}</TableCell>
                      <TableCell className="text-[#00FFC6] font-medium">{item.suggestedReorder}</TableCell>
                      <TableCell>
                        <Badge
                          className={
                            item.stockoutRisk === "Low"
                              ? "bg-[#00FFC6]/20 text-[#00FFC6] border-[#00FFC6]/30"
                              : item.stockoutRisk === "High"
                                ? "bg-[#FFC700]/20 text-[#FFC700] border-[#FFC700]/30"
                                : "bg-red-500/20 text-red-400 border-red-500/30"
                          }
                        >
                          {item.stockoutRisk}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-[#F3F4F6]">{item.optimalStock}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="text-[#F3F4F6]">{item.forecastAccuracy}%</span>
                          <div
                            className={`w-2 h-2 rounded-full ${
                              item.forecastAccuracy > 90
                                ? "bg-[#00FFC6]"
                                : item.forecastAccuracy > 80
                                  ? "bg-[#FFC700]"
                                  : "bg-red-400"
                            }`}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Forecast Visualization */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark">
              <CardHeader>
                <CardTitle className="text-[#F3F4F6] flex items-center gap-2">
                  <LineChart className="w-5 h-5" />
                  Demand Forecast Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="h-48 bg-[#4B0082]/10 rounded-lg border border-[#4B0082]/30 flex items-center justify-center">
                    <div className="text-center">
                      <BarChart3 className="w-12 h-12 text-[#4B0082] mx-auto mb-2" />
                      <p className="text-[#F3F4F6]/70">Interactive forecast chart would appear here</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-lg font-bold text-[#00FFC6]">+18.5%</div>
                      <div className="text-xs text-[#F3F4F6]/70">Demand Growth</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-[#FFC700]">94.7%</div>
                      <div className="text-xs text-[#F3F4F6]/70">Accuracy</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-[#4B0082]">23</div>
                      <div className="text-xs text-[#F3F4F6]/70">Reorder Alerts</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark">
              <CardHeader>
                <CardTitle className="text-[#F3F4F6] flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Optimization Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 bg-[#00FFC6]/10 rounded-lg border border-[#00FFC6]/30">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-4 h-4 text-[#00FFC6]" />
                    <span className="font-medium text-[#00FFC6]">Reduce Carrying Costs</span>
                  </div>
                  <p className="text-sm text-[#F3F4F6]/70">
                    Optimize reorder points to reduce carrying costs by 12.3% while maintaining service levels.
                  </p>
                </div>
                <div className="p-3 bg-[#FFC700]/10 rounded-lg border border-[#FFC700]/30">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-4 h-4 text-[#FFC700]" />
                    <span className="font-medium text-[#FFC700]">Stockout Prevention</span>
                  </div>
                  <p className="text-sm text-[#F3F4F6]/70">
                    Increase safety stock for Dell XPS 13 and Office Chair Pro to prevent stockouts.
                  </p>
                </div>
                <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-xl border border-purple-200 dark:border-purple-800">
                  <div className="flex items-center gap-2 mb-2">
                    <Brain className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    <span className="font-medium text-purple-600 dark:text-purple-400">AI Insights</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Seasonal patterns detected. Consider increasing inventory 30% before Q4.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Scenarios Tab */}
        <TabsContent value="scenarios" className="space-y-6">
          <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Simulation Scenarios</CardTitle>
                  <CardDescription>
                    Pre-built and custom scenarios for comprehensive testing
                  </CardDescription>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="rounded-full">
                      <Plus className="w-4 h-4 mr-2" />
                      Create Scenario
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[80vh] rounded-4xl shadow-soft dark:shadow-soft-dark overflow-hidden flex flex-col bg-white dark:bg-gray-900">
                    <DialogHeader>
                      <DialogTitle>Create Custom Scenario</DialogTitle>
                      <DialogDescription>
                        Build a custom simulation scenario with specific parameters
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <Label>Scenario Name</Label>
                          <Input
                            placeholder="Enter scenario name"
                            className="rounded-xl"
                          />
                        </div>
                        <div className="space-y-3">
                          <Label>Category</Label>
                          <Select>
                            <SelectTrigger className="rounded-xl">
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="revenue">Revenue Simulation</SelectItem>
                              <SelectItem value="inventory">Inventory Simulation</SelectItem>
                              <SelectItem value="financial">Financial Simulation</SelectItem>
                              <SelectItem value="compliance">Compliance Testing</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <Label>Description</Label>
                        <Textarea
                          placeholder="Describe the scenario objectives and expected outcomes"
                          className="rounded-xl"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <Label>Duration</Label>
                          <Select>
                            <SelectTrigger className="rounded-xl">
                              <SelectValue placeholder="Select duration" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1-week">1 Week</SelectItem>
                              <SelectItem value="1-month">1 Month</SelectItem>
                              <SelectItem value="3-months">3 Months</SelectItem>
                              <SelectItem value="6-months">6 Months</SelectItem>
                              <SelectItem value="1-year">1 Year</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-3">
                          <Label>Complexity</Label>
                          <Select>
                            <SelectTrigger className="rounded-xl">
                              <SelectValue placeholder="Select complexity" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="low">Low</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="high">High</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" className="rounded-full">
                        Cancel
                      </Button>
                      <Button className="rounded-full">Create Scenario</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {sandboxScenarios.map((scenario) => (
                  <Card key={scenario.id} className="rounded-4xl shadow-soft dark:shadow-soft-dark">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{scenario.name}</CardTitle>
                          <CardDescription className="mt-1">{scenario.description}</CardDescription>
                        </div>
                        <Badge
                          variant={
                            scenario.status === "Ready" ? "default" :
                            scenario.status === "Running" ? "secondary" : "outline"
                          }
                          className="rounded-full"
                        >
                          {scenario.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Category:</span>
                          <p className="font-medium">{scenario.category}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Duration:</span>
                          <p className="font-medium">{scenario.duration}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Complexity:</span>
                          <Badge variant="outline" className="rounded-full">
                            {scenario.complexity}
                          </Badge>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Last Run:</span>
                          <p className="font-medium text-xs">{scenario.lastRun || "Never"}</p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h4 className="text-sm font-medium">Parameters</h4>
                        <div className="space-y-1 text-xs">
                          {Object.entries(scenario.parameters).map(([key, value]) => (
                            <div key={key} className="flex justify-between">
                              <span className="text-muted-foreground capitalize">
                                {key.replace(/([A-Z])/g, " $1").trim()}:
                              </span>
                              <span>
                                {typeof value === "number" && key.includes("Growth") ? `${value}%` : value}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex gap-2 pt-2">
                        <Button
                          size="sm"
                          className="flex-1 rounded-full"
                          onClick={() => handleRunSimulation(scenario.id)}
                          disabled={scenario.status === "Running"}
                        >
                          <Play className="w-3 h-3 mr-1" />
                          {scenario.status === "Running" ? "Running..." : "Run"}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="rounded-full"
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="rounded-full"
                        >
                          <Eye className="w-3 h-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
