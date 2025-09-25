"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Wallet,
  Shield,
  Link,
  FileText,
  Eye,
  Copy,
  ExternalLink,
  CheckCircle,
  Zap,
  Plus,
  Settings,
  Download,
  Search,
  Filter,
  Clock,
  Hash,
  Activity,
  Globe,
  Lock,
  Bot,
  User,
  Brain,
  Database,
  BarChart3,
} from "lucide-react"

export function Web3Overview() {
  const [isConnected, setIsConnected] = useState(false)
  const [walletAddress, setWalletAddress] = useState("")
  const [networkId, setNetworkId] = useState("")
  const [balance, setBalance] = useState("0")
  const [selectedContract, setSelectedContract] = useState("")
  const [isDeployingContract, setIsDeployingContract] = useState(false)
  const [accountType, setAccountType] = useState<"normal" | "ai">("normal")
  const [aiModel, setAiModel] = useState("gpt-4")
  const [isAiEnabled, setIsAiEnabled] = useState(false)

  // Mock blockchain data
  const blockchainEntries = [
    {
      id: "0x1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t",
      blockNumber: 18945672,
      timestamp: "2024-01-15 14:32:15",
      transactionHash: "0x9f8e7d6c5b4a39281726354849576869708192a3b4c5d6e7f8g9h0i1j2k3l4m5",
      journalEntryId: "JE-2024-001",
      description: "Sales Invoice - TechCorp Services",
      amount: "12500.00",
      currency: "USD",
      gasUsed: "21000",
      gasPrice: "20",
      status: "Confirmed",
      confirmations: 1247,
      from: "0x742d35Cc6634C0532925a3b8D0C9e3e4d5f6A7B8",
      to: "0x8B7A6F5E4D3C2B1A0987654321FEDCBA9876543210",
    },
    {
      id: "0x2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u",
      blockNumber: 18945671,
      timestamp: "2024-01-15 14:30:42",
      transactionHash: "0x8e7d6c5b4a39281726354849576869708192a3b4c5d6e7f8g9h0i1j2k3l4m5n6",
      journalEntryId: "JE-2024-002",
      description: "Office Supplies Purchase",
      amount: "847.32",
      currency: "USD",
      gasUsed: "21000",
      gasPrice: "18",
      status: "Confirmed",
      confirmations: 1248,
      from: "0x742d35Cc6634C0532925a3b8D0C9e3e4d5f6A7B8",
      to: "0x9C8B7A6F5E4D3C2B1A0987654321FEDCBA987654",
    },
    {
      id: "0x3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v",
      blockNumber: 18945670,
      timestamp: "2024-01-15 14:28:17",
      transactionHash: "0x7d6c5b4a39281726354849576869708192a3b4c5d6e7f8g9h0i1j2k3l4m5n6o7",
      journalEntryId: "JE-2024-003",
      description: "Salary Payment - January",
      amount: "45230.00",
      currency: "USD",
      gasUsed: "21000",
      gasPrice: "22",
      status: "Pending",
      confirmations: 0,
      from: "0x742d35Cc6634C0532925a3b8D0C9e3e4d5f6A7B8",
      to: "0xAD9E8F7C6B5A4938271635484957686970819283",
    },
  ]

  const smartContracts = [
    {
      id: "vendor-payment-001",
      name: "Vendor Payment Agreement",
      type: "Vendor Contract",
      address: "0x1234567890123456789012345678901234567890",
      status: "Active",
      party: "TechSupply Inc.",
      terms: "Net 30 payment terms with 2% early payment discount",
      value: "$50,000",
      deployedAt: "2024-01-10",
      expiresAt: "2024-12-31",
    },
    {
      id: "customer-service-001",
      name: "Service Level Agreement",
      type: "Customer Contract",
      address: "0x2345678901234567890123456789012345678901",
      status: "Active",
      party: "Enterprise Client Corp",
      terms: "99.9% uptime SLA with penalty clauses",
      value: "$250,000",
      deployedAt: "2024-01-05",
      expiresAt: "2025-01-05",
    },
    {
      id: "escrow-001",
      name: "Project Escrow Contract",
      type: "Escrow Contract",
      address: "0x3456789012345678901234567890123456789012",
      status: "Pending",
      party: "Development Partner LLC",
      terms: "Milestone-based payment release",
      value: "$100,000",
      deployedAt: "2024-01-12",
      expiresAt: "2024-06-12",
    },
  ]

  const contractTemplates = [
    {
      id: "vendor-payment",
      name: "Vendor Payment Contract",
      description: "Automated payment contract with terms and conditions",
      category: "Vendor Management",
      parameters: ["Payment Amount", "Due Date", "Early Payment Discount", "Late Fee"],
    },
    {
      id: "customer-sla",
      name: "Service Level Agreement",
      description: "Customer SLA with performance metrics and penalties",
      category: "Customer Management",
      parameters: ["Service Level", "Penalty Rate", "Monitoring Period", "Escalation Process"],
    },
    {
      id: "escrow-milestone",
      name: "Milestone Escrow Contract",
      description: "Project-based escrow with milestone releases",
      category: "Project Management",
      parameters: ["Total Amount", "Milestones", "Release Conditions", "Dispute Resolution"],
    },
    {
      id: "recurring-subscription",
      name: "Recurring Subscription Contract",
      description: "Automated recurring payment processing",
      category: "Subscription Management",
      parameters: ["Subscription Amount", "Billing Cycle", "Auto-renewal", "Cancellation Terms"],
    },
  ]

  const networkStats = {
    currentBlock: 18945672,
    gasPrice: "20 Gwei",
    networkHashRate: "892.5 TH/s",
    difficulty: "58.9T",
    totalTransactions: 2847392,
    pendingTransactions: 156,
  }

  useEffect(() => {
    // Simulate wallet connection check
    const checkWalletConnection = async () => {
      if (typeof window !== "undefined" && window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: "eth_accounts" })
          if (accounts.length > 0) {
            setIsConnected(true)
            setWalletAddress(accounts[0])
            setNetworkId("1") // Ethereum Mainnet
            setBalance("2.5847") // Mock balance
          }
        } catch (error) {
          console.error("Error checking wallet connection:", error)
        }
      }
    }

    checkWalletConnection()
  }, [])

  const connectWallet = async () => {
    if (typeof window !== "undefined" && window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" })
        setIsConnected(true)
        setWalletAddress(accounts[0])
        setNetworkId("1")
        setBalance("2.5847")
      } catch (error) {
        console.error("Error connecting wallet:", error)
      }
    }
  }

  const deployContract = async (templateId: string) => {
    setIsDeployingContract(true)
    // Simulate contract deployment
    await new Promise((resolve) => setTimeout(resolve, 3000))
    setIsDeployingContract(false)
    // Show success message or update contract list
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "confirmed":
        return "bg-green-500/20 text-green-600 border-green-500/30"
      case "pending":
        return "bg-yellow-500/20 text-yellow-600 border-yellow-500/30"
      case "failed":
        return "bg-red-500/20 text-red-600 border-red-500/30"
      case "active":
        return "bg-blue-500/20 text-blue-600 border-blue-500/30"
      default:
        return "bg-gray-500/20 text-gray-600 border-gray-500/30"
    }
  }

  return (
    <div className="space-y-8 bg-soft-gradient -m-10 p-10 rounded-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">AI & Web3</h1>
          <p className="text-muted-foreground mt-2">
            Intelligent accounting with AI assistance and blockchain-powered transparency
          </p>
        </div>
        <div className="flex items-center space-x-3">
          {/* Account Type Selector */}
          <div className="flex items-center space-x-2 bg-card/50 backdrop-blur-sm p-1 rounded-full border">
            <Button
              variant={accountType === "normal" ? "default" : "ghost"}
              size="sm"
              onClick={() => setAccountType("normal")}
              className="rounded-full"
            >
              <User className="w-4 h-4 mr-2" />
              Normal
            </Button>
            <Button
              variant={accountType === "ai" ? "default" : "ghost"}
              size="sm"
              onClick={() => setAccountType("ai")}
              className="rounded-full"
            >
              <Bot className="w-4 h-4 mr-2" />
              AI Enhanced
            </Button>
          </div>
          
          {!isConnected ? (
            <Button onClick={connectWallet} size="lg" className="rounded-full">
              <Wallet className="w-4 h-4 mr-2" />
              Connect Wallet
            </Button>
          ) : (
            <div className="flex items-center space-x-3">
              <Badge variant="default" className="rounded-full">
                <CheckCircle className="w-3 h-3 mr-1" />
                Connected
              </Badge>
              <Button variant="outline" size="lg" className="rounded-full">
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* AI Status Card */}
      {accountType === "ai" && (
        <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark">
          <CardHeader className="pb-6">
            <CardTitle className="text-xl flex items-center gap-2">
              <Brain className="w-5 h-5 text-primary" />
              AI Assistant Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-4">
              <div className="space-y-3">
                <Label className="text-sm font-medium text-muted-foreground">AI Model</Label>
                <Select value={aiModel} onValueChange={setAiModel}>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gpt-4">GPT-4</SelectItem>
                    <SelectItem value="gpt-3.5">GPT-3.5</SelectItem>
                    <SelectItem value="claude">Claude</SelectItem>
                    <SelectItem value="gemini">Gemini</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-3">
                <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                <Badge variant="default" className="rounded-full">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Active
                </Badge>
              </div>
              <div className="space-y-3">
                <Label className="text-sm font-medium text-muted-foreground">AI Features</Label>
                <div className="text-sm">
                  <Badge variant="secondary" className="rounded-full mr-1">Auto Categorization</Badge>
                  <Badge variant="secondary" className="rounded-full mr-1">Fraud Detection</Badge>
                  <Badge variant="secondary" className="rounded-full">Predictive Analytics</Badge>
                </div>
              </div>
              <div className="space-y-3">
                <Label className="text-sm font-medium text-muted-foreground">Actions</Label>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="rounded-full"
                  onClick={() => setIsAiEnabled(!isAiEnabled)}
                >
                  {isAiEnabled ? "Disable AI" : "Enable AI"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Wallet Status */}
      {isConnected && (
        <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark">
          <CardHeader className="pb-6">
            <CardTitle className="text-xl flex items-center gap-2">
              <Wallet className="w-5 h-5 text-primary" />
              Wallet Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-4">
              <div className="space-y-3">
                <Label className="text-sm font-medium text-muted-foreground">Address</Label>
                <div className="flex items-center space-x-2">
                  <code className="text-sm bg-muted px-3 py-2 rounded-xl font-mono">
                    {formatAddress(walletAddress)}
                  </code>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => copyToClipboard(walletAddress)}
                    className="h-8 w-8 rounded-xl"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div className="space-y-3">
                <Label className="text-sm font-medium text-muted-foreground">Network</Label>
                <Badge variant="default" className="rounded-full">Ethereum Mainnet</Badge>
              </div>
              <div className="space-y-3">
                <Label className="text-sm font-medium text-muted-foreground">Balance</Label>
                <div className="text-2xl font-bold">{balance} ETH</div>
              </div>
              <div className="space-y-3">
                <Label className="text-sm font-medium text-muted-foreground">Gas Price</Label>
                <div className="text-2xl font-bold">{networkStats.gasPrice}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Network Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-2xl">
              <Hash className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <Badge variant="secondary" className="rounded-full">Current</Badge>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Block Number</p>
            <p className="text-2xl font-bold">{networkStats.currentBlock.toLocaleString()}</p>
          </div>
        </Card>

        <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-2xl">
              <Activity className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <Badge variant="secondary" className="rounded-full">Live</Badge>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Hash Rate</p>
            <p className="text-2xl font-bold">{networkStats.networkHashRate}</p>
          </div>
        </Card>

        <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-2xl">
              <Globe className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <Badge variant="secondary" className="rounded-full">Total</Badge>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Transactions</p>
            <p className="text-2xl font-bold">{networkStats.totalTransactions.toLocaleString()}</p>
          </div>
        </Card>

        <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-orange-100 dark:bg-orange-900/20 rounded-2xl">
              <Clock className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
            <Badge variant="secondary" className="rounded-full">Pending</Badge>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Pending Tx</p>
            <p className="text-2xl font-bold">{networkStats.pendingTransactions}</p>
          </div>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="blockchain-ledger" className="space-y-6">
        <TabsList className="bg-card/50 backdrop-blur-sm p-2 rounded-full h-auto border">
          <TabsTrigger
            value="blockchain-ledger"
            className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <Link className="w-4 h-4 mr-2" />
            Blockchain Ledger
          </TabsTrigger>
          <TabsTrigger
            value="smart-contracts"
            className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <FileText className="w-4 h-4 mr-2" />
            Smart Contracts
          </TabsTrigger>
          {accountType === "ai" && (
            <TabsTrigger
              value="ai-assistant"
              className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Bot className="w-4 h-4 mr-2" />
              AI Assistant
            </TabsTrigger>
          )}
          <TabsTrigger
            value="audit-explorer"
            className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <Eye className="w-4 h-4 mr-2" />
            Audit Explorer
          </TabsTrigger>
          <TabsTrigger
            value="network-stats"
            className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <Activity className="w-4 h-4 mr-2" />
            Network Stats
          </TabsTrigger>
        </TabsList>

        {/* Blockchain Ledger */}
        <TabsContent value="blockchain-ledger">
          <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark">
            <CardHeader className="pb-6">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl flex items-center gap-2">
                    Blockchain Ledger Entries
                    <Badge variant="default" className="rounded-full">
                      <Shield className="w-3 h-3 mr-1" />
                      Immutable
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    Every accounting entry is automatically recorded on the blockchain for complete transparency
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-3">
                  <Button variant="outline" className="rounded-full">
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                  <Button className="rounded-full">
                    <Plus className="w-4 h-4 mr-2" />
                    Manual Entry
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search by transaction hash, journal ID, or description..."
                    className="pl-10 rounded-xl"
                  />
                </div>
                <Button variant="outline" className="rounded-full">
                  <Filter className="w-4 h-4" />
                </Button>
              </div>
              <div className="rounded-2xl border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="font-semibold">Block #</TableHead>
                      <TableHead className="font-semibold">Transaction Hash</TableHead>
                      <TableHead className="font-semibold">Journal Entry</TableHead>
                      <TableHead className="font-semibold">Description</TableHead>
                      <TableHead className="font-semibold text-right">Amount</TableHead>
                      <TableHead className="font-semibold">Status</TableHead>
                      <TableHead className="font-semibold">Gas Used</TableHead>
                      <TableHead className="font-semibold">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {blockchainEntries.map((entry) => (
                      <TableRow key={entry.id} className="hover:bg-muted/30 transition-colors">
                        <TableCell className="font-mono">{entry.blockNumber.toLocaleString()}</TableCell>
                        <TableCell className="font-mono">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm">{formatAddress(entry.transactionHash)}</span>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => copyToClipboard(entry.transactionHash)}
                              className="h-6 w-6 rounded-lg"
                            >
                              <Copy className="w-3 h-3" />
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono">{entry.journalEntryId}</TableCell>
                        <TableCell className="max-w-xs">
                          <div className="text-sm text-muted-foreground truncate" title={entry.description}>
                            {entry.description}
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {entry.amount} {entry.currency}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              entry.status === "Confirmed" ? "default" :
                              entry.status === "Pending" ? "secondary" : "destructive"
                            }
                            className="rounded-full"
                          >
                            {entry.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono text-sm">{entry.gasUsed}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl">
                              <ExternalLink className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Smart Contracts */}
        <TabsContent value="smart-contracts">
          <div className="space-y-6">
            <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark">
              <CardHeader className="pb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl">Active Smart Contracts</CardTitle>
                    <CardDescription>
                      Deployed smart contracts for automated business processes
                    </CardDescription>
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="rounded-full">
                        <Plus className="w-4 h-4 mr-2" />
                        Deploy Contract
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[80vh] rounded-4xl shadow-soft dark:shadow-soft-dark overflow-hidden flex flex-col bg-white dark:bg-gray-900">
                      <DialogHeader className="flex-shrink-0 border-b border-gray-200 dark:border-gray-700 pb-4">
                        <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100">Deploy Smart Contract</DialogTitle>
                        <DialogDescription className="text-gray-600 dark:text-gray-400 mt-1">
                          Choose a contract template and configure parameters
                        </DialogDescription>
                      </DialogHeader>
                      <div className="flex-1 overflow-y-auto px-1">
                        <div className="space-y-6 py-4">
                        <div>
                          <Label htmlFor="contract-template" className="text-sm font-semibold text-gray-900 dark:text-gray-100">Contract Template</Label>
                          <Select value={selectedContract} onValueChange={setSelectedContract}>
                            <SelectTrigger className="rounded-xl bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100">
                              <SelectValue placeholder="Select a contract template" />
                            </SelectTrigger>
                            <SelectContent className="!bg-white dark:!bg-gray-900 !text-gray-900 dark:!text-white border border-gray-300 dark:border-gray-600 min-w-[200px] z-50">
                              {contractTemplates.map((template) => (
                                <SelectItem 
                                  key={template.id} 
                                  value={template.id}
                                  className="!text-gray-900 dark:!text-white hover:!bg-gray-100 dark:hover:!bg-gray-700 focus:!bg-gray-100 dark:focus:!bg-gray-700 data-[highlighted]:!bg-gray-100 dark:data-[highlighted]:!bg-gray-700 data-[highlighted]:!text-gray-900 dark:data-[highlighted]:!text-white cursor-pointer"
                                >
                                  {template.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        {selectedContract && (
                          <div className="p-4 bg-muted/20 rounded-2xl border">
                            <div className="space-y-3">
                              <div>
                                <Label className="text-sm font-medium">Description</Label>
                                <p className="text-sm text-muted-foreground">
                                  {contractTemplates.find(t => t.id === selectedContract)?.description}
                                </p>
                              </div>
                              <div>
                                <Label className="text-sm font-medium">Parameters</Label>
                                <div className="flex flex-wrap gap-2 mt-2">
                                  {contractTemplates.find(t => t.id === selectedContract)?.parameters.map((param, index) => (
                                    <Badge key={index} variant="outline" className="rounded-full text-xs">
                                      {param}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                        <div className="space-y-4">
                          <Label htmlFor="contract-address" className="text-sm font-semibold text-gray-900 dark:text-gray-100">Contract Address</Label>
                          <Input
                            id="contract-address"
                            placeholder="0x..."
                            className="rounded-xl font-mono bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400"
                          />
                        </div>
                        <div className="space-y-4">
                          <Label htmlFor="contract-params" className="text-sm font-semibold text-gray-900 dark:text-gray-100">Contract Parameters</Label>
                          <Textarea
                            id="contract-params"
                            placeholder="Enter contract parameters in JSON format..."
                            className="rounded-xl font-mono bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400"
                          />
                        </div>
                        </div>
                      </div>
                      <DialogFooter className="flex-shrink-0 border-t border-gray-200 dark:border-gray-700 pt-4">
                        <Button variant="outline" className="rounded-full border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                          Cancel
                        </Button>
                        <Button 
                          className="rounded-full bg-blue-600 hover:bg-blue-700 text-white" 
                          onClick={() => deployContract(selectedContract)}
                          disabled={isDeployingContract}
                        >
                          {isDeployingContract ? (
                            <>
                              <Zap className="w-4 h-4 mr-2 animate-spin" />
                              Deploying...
                            </>
                          ) : (
                            <>
                              <Zap className="w-4 h-4 mr-2" />
                              Deploy Contract
                            </>
                          )}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {smartContracts.map((contract) => (
                    <Card key={contract.id} className="rounded-4xl shadow-soft dark:shadow-soft-dark">
                      <CardHeader className="pb-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-lg">{contract.name}</CardTitle>
                            <CardDescription className="mt-1">{contract.type}</CardDescription>
                          </div>
                          <Badge
                            variant={
                              contract.status === "Active" ? "default" : "secondary"
                            }
                            className="rounded-full"
                          >
                            {contract.status}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Party</span>
                            <span className="font-medium">{contract.party}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Value</span>
                            <span className="font-medium">{contract.value}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Deployed</span>
                            <span>{contract.deployedAt}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Expires</span>
                            <span>{contract.expiresAt}</span>
                          </div>
                        </div>
                        <div className="p-3 bg-muted/20 rounded-xl">
                          <div className="text-xs text-muted-foreground mb-1">Contract Address</div>
                          <div className="font-mono text-xs break-all">{contract.address}</div>
                        </div>
                        <div className="p-3 bg-muted/20 rounded-xl">
                          <div className="text-xs text-muted-foreground mb-1">Terms</div>
                          <div className="text-sm">{contract.terms}</div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* AI Assistant */}
        {accountType === "ai" && (
          <TabsContent value="ai-assistant">
            <div className="space-y-6">
              <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark">
                <CardHeader className="pb-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl flex items-center gap-2">
                        <Bot className="w-5 h-5 text-primary" />
                        AI Accounting Assistant
                      </CardTitle>
                      <CardDescription>
                        Intelligent automation and insights powered by {aiModel}
                      </CardDescription>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Button variant="outline" className="rounded-full">
                        <Settings className="w-4 h-4 mr-2" />
                        AI Settings
                      </Button>
                      <Button className="rounded-full">
                        <Brain className="w-4 h-4 mr-2" />
                        Ask AI
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark">
                      <CardHeader className="pb-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-lg">Auto Categorization</CardTitle>
                            <CardDescription>AI-powered transaction categorization</CardDescription>
                          </div>
                          <Database className="w-5 h-5 text-primary" />
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Accuracy</span>
                            <span className="font-medium text-green-600">96.8%</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Transactions Processed</span>
                            <span className="font-medium">1,247</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Time Saved</span>
                            <span className="font-medium">12.5 hours</span>
                          </div>
                        </div>
                        <Button variant="outline" className="w-full rounded-full">
                          <Bot className="w-4 h-4 mr-2" />
                          Review Categories
                        </Button>
                      </CardContent>
                    </Card>

                    <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark">
                      <CardHeader className="pb-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-lg">Fraud Detection</CardTitle>
                            <CardDescription>Real-time anomaly detection</CardDescription>
                          </div>
                          <Shield className="w-5 h-5 text-primary" />
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Risk Score</span>
                            <span className="font-medium text-green-600">Low (2.3%)</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Alerts Today</span>
                            <span className="font-medium">3</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">False Positives</span>
                            <span className="font-medium text-green-600">0.1%</span>
                          </div>
                        </div>
                        <Button variant="outline" className="w-full rounded-full">
                          <Eye className="w-4 h-4 mr-2" />
                          View Alerts
                        </Button>
                      </CardContent>
                    </Card>

                    <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark">
                      <CardHeader className="pb-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-lg">Predictive Analytics</CardTitle>
                            <CardDescription>Financial forecasting and insights</CardDescription>
                          </div>
                          <Activity className="w-5 h-5 text-primary" />
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Cash Flow Forecast</span>
                            <span className="font-medium text-green-600">+15.2%</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Revenue Prediction</span>
                            <span className="font-medium">$2.4M</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Confidence Level</span>
                            <span className="font-medium text-green-600">94.7%</span>
                          </div>
                        </div>
                        <Button variant="outline" className="w-full rounded-full">
                          <BarChart3 className="w-4 h-4 mr-2" />
                          View Forecast
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        )}

        {/* Audit Explorer */}
        <TabsContent value="audit-explorer">
          <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark">
            <CardHeader className="pb-6">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl">Audit Explorer</CardTitle>
                  <CardDescription>
                    Explore and verify blockchain transactions for audit purposes
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-3">
                  <Button variant="outline" className="rounded-full">
                    <Download className="w-4 h-4 mr-2" />
                    Export Report
                  </Button>
                  <Button className="rounded-full">
                    <Eye className="w-4 h-4 mr-2" />
                    Verify All
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">Transaction Verification</CardTitle>
                        <CardDescription>Verify transaction integrity</CardDescription>
                      </div>
                      <Lock className="w-5 h-5 text-primary" />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Total Verified</span>
                        <span className="font-medium">1,247</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Pending Verification</span>
                        <span className="font-medium">3</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Verification Rate</span>
                        <span className="font-medium text-green-600">99.8%</span>
                      </div>
                    </div>
                    <Button variant="outline" className="w-full rounded-full">
                      <Shield className="w-4 h-4 mr-2" />
                      Verify Transactions
                    </Button>
                  </CardContent>
                </Card>

                <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">Smart Contract Audit</CardTitle>
                        <CardDescription>Audit deployed contracts</CardDescription>
                      </div>
                      <FileText className="w-5 h-5 text-primary" />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Contracts Audited</span>
                        <span className="font-medium">12</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Security Score</span>
                        <span className="font-medium text-green-600">98.5%</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Last Audit</span>
                        <span className="font-medium">2 days ago</span>
                      </div>
                    </div>
                    <Button variant="outline" className="w-full rounded-full">
                      <Eye className="w-4 h-4 mr-2" />
                      Audit Contracts
                    </Button>
                  </CardContent>
                </Card>

                <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">Compliance Report</CardTitle>
                        <CardDescription>Generate compliance reports</CardDescription>
                      </div>
                      <CheckCircle className="w-5 h-5 text-primary" />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Compliance Score</span>
                        <span className="font-medium text-green-600">99.2%</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Regulations Met</span>
                        <span className="font-medium">15/15</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Last Report</span>
                        <span className="font-medium">1 week ago</span>
                      </div>
                    </div>
                    <Button variant="outline" className="w-full rounded-full">
                      <Download className="w-4 h-4 mr-2" />
                      Generate Report
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Network Stats */}
        <TabsContent value="network-stats">
          <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark">
            <CardHeader className="pb-6">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl">Network Statistics</CardTitle>
                  <CardDescription>
                    Real-time blockchain network performance metrics
                  </CardDescription>
                </div>
                <Button variant="outline" className="rounded-full">
                  <Activity className="w-4 h-4 mr-2" />
                  Refresh Stats
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <div className="p-6 bg-muted/20 rounded-2xl border">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-xl">
                      <Hash className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <Badge variant="secondary" className="rounded-full">Current</Badge>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Block Height</p>
                    <p className="text-xl font-bold">{networkStats.currentBlock.toLocaleString()}</p>
                  </div>
                </div>

                <div className="p-6 bg-muted/20 rounded-2xl border">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-xl">
                      <Zap className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <Badge variant="secondary" className="rounded-full">Live</Badge>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Gas Price</p>
                    <p className="text-xl font-bold">{networkStats.gasPrice}</p>
                  </div>
                </div>

                <div className="p-6 bg-muted/20 rounded-2xl border">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-xl">
                      <Activity className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <Badge variant="secondary" className="rounded-full">Network</Badge>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Hash Rate</p>
                    <p className="text-xl font-bold">{networkStats.networkHashRate}</p>
                  </div>
                </div>

                <div className="p-6 bg-muted/20 rounded-2xl border">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-orange-100 dark:bg-orange-900/20 rounded-xl">
                      <Globe className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                    </div>
                    <Badge variant="secondary" className="rounded-full">Total</Badge>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Difficulty</p>
                    <p className="text-xl font-bold">{networkStats.difficulty}</p>
                  </div>
                </div>

                <div className="p-6 bg-muted/20 rounded-2xl border">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-indigo-100 dark:bg-indigo-900/20 rounded-xl">
                      <Link className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <Badge variant="secondary" className="rounded-full">Transactions</Badge>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Total Tx</p>
                    <p className="text-xl font-bold">{networkStats.totalTransactions.toLocaleString()}</p>
                  </div>
                </div>

                <div className="p-6 bg-muted/20 rounded-2xl border">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-xl">
                      <Clock className="w-5 h-5 text-red-600 dark:text-red-400" />
                    </div>
                    <Badge variant="secondary" className="rounded-full">Pending</Badge>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Pending Tx</p>
                    <p className="text-xl font-bold">{networkStats.pendingTransactions}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
