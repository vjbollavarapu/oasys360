"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  TrendingUp,
  DollarSign,
  CheckCircle,
  AlertTriangle,
  Settings,
  Eye,
  Zap
} from "lucide-react"

export function DeFiPositionsOverview() {
  return (
    <div className="space-y-8 bg-soft-gradient -m-10 p-10 rounded-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">DeFi Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor DeFi protocols and yield farming
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" className="rounded-full">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
          <Button className="rounded-full">
            <TrendingUp className="h-4 w-4 mr-2" />
            Add Position
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="rounded-full p-1 h-auto grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="protocols">Protocols</TabsTrigger>
          <TabsTrigger value="yield">Yield</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Value Locked</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$2.4M</div>
                <p className="text-xs text-muted-foreground">+8.5% from last week</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">APY Average</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12.4%</div>
                <p className="text-xs text-muted-foreground">Across protocols</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Protocols</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">8</div>
                <p className="text-xs text-muted-foreground">Currently active</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Gas Spent</CardTitle>
                <Zap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">2.3 ETH</div>
                <p className="text-xs text-muted-foreground">This month</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Active Positions</CardTitle>
              <CardDescription>
                Current DeFi positions and yields
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <TrendingUp className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium">Uniswap V3 LP</p>
                      <p className="text-sm text-muted-foreground">$450K deposited - 15.2% APY</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className="bg-green-100 text-green-800">Active</Badge>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <DollarSign className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">Aave Lending</p>
                      <p className="text-sm text-muted-foreground">$320K supplied - 8.7% APY</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className="bg-blue-100 text-blue-800">Active</Badge>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                      <AlertTriangle className="h-5 w-5 text-yellow-600" />
                    </div>
                    <div>
                      <p className="font-medium">Compound V3</p>
                      <p className="text-sm text-muted-foreground">$180K deposited - 6.3% APY</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className="bg-yellow-100 text-yellow-800">Low Yield</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="protocols" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>DeFi Protocols</CardTitle>
              <CardDescription>
                Monitor and manage DeFi protocols
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center text-muted-foreground">
                <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Protocol management will appear here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="yield" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Yield Farming</CardTitle>
              <CardDescription>
                Track yield farming strategies and returns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center text-muted-foreground">
                <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Yield farming interface will appear here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
