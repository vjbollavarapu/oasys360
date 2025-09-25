"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Package,
  Warehouse,
  TrendingUp,
  AlertTriangle,
  BarChart3,
  QrCode,
  Camera,
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  ArrowUpDown,
  MapPin,
  DollarSign,
  Brain,
  Eye,
  Edit,
  RefreshCw,
  ShoppingCart,
  CheckCircle,
  XCircle,
  Clock,
  Target,
  Activity,
  Users,
  Tag,
  Hash,
  Move,
  Bell,
  Settings,
  BarChart2,
  PieChart,
  LineChart,
  FileText,
  RotateCcw,
  Truck,
  ClipboardList,
  List,
} from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

// Mock data for inventory items
const inventoryItems = [
  {
    id: "PRD-001",
    name: 'MacBook Pro 16" M3',
    sku: "MBP-16-M3-512",
    category: "Electronics",
    brand: "Apple",
    description: "MacBook Pro 16-inch with M3 chip, 512GB storage",
    image: "/placeholder.svg?height=100&width=100&text=MacBook",
    barcode: "1234567890123",
    rfid: "RFID-MBP-001",
    currentStock: 45,
    reservedStock: 8,
    availableStock: 37,
    reorderPoint: 20,
    maxStock: 100,
    unitCost: 2299.0,
    sellingPrice: 2799.0,
    pricingTiers: [
      { quantity: 1, price: 2799.0 },
      { quantity: 5, price: 2699.0 },
      { quantity: 10, price: 2599.0 },
    ],
    status: "In Stock",
    lastUpdated: "2024-01-15",
    supplier: "Apple Inc.",
    leadTime: 14,
    batchTracking: true,
    serialTracking: true,
    warehouses: [
      { location: "Main Warehouse", stock: 25 },
      { location: "East Coast DC", stock: 15 },
      { location: "West Coast DC", stock: 5 },
    ],
  },
  {
    id: "PRD-002",
    name: "Dell XPS 13",
    sku: "DELL-XPS13-256",
    category: "Electronics",
    brand: "Dell",
    description: "Dell XPS 13 laptop with Intel i7, 256GB SSD",
    image: "/placeholder.svg?height=100&width=100&text=Dell+XPS",
    barcode: "2345678901234",
    rfid: "RFID-DELL-002",
    currentStock: 12,
    reservedStock: 3,
    availableStock: 9,
    reorderPoint: 15,
    maxStock: 50,
    unitCost: 1199.0,
    sellingPrice: 1499.0,
    pricingTiers: [
      { quantity: 1, price: 1499.0 },
      { quantity: 3, price: 1449.0 },
      { quantity: 5, price: 1399.0 },
    ],
    status: "Low Stock",
    lastUpdated: "2024-01-14",
    supplier: "Dell Technologies",
    leadTime: 10,
    batchTracking: true,
    serialTracking: true,
    warehouses: [
      { location: "Main Warehouse", stock: 8 },
      { location: "East Coast DC", stock: 4 },
      { location: "West Coast DC", stock: 0 },
    ],
  },
  {
    id: "PRD-003",
    name: "Office Chair Pro",
    sku: "CHAIR-PRO-BLK",
    category: "Furniture",
    brand: "ErgoMax",
    description: "Professional ergonomic office chair in black",
    image: "/placeholder.svg?height=100&width=100&text=Office+Chair",
    barcode: "3456789012345",
    rfid: "RFID-CHAIR-003",
    currentStock: 0,
    reservedStock: 0,
    availableStock: 0,
    reorderPoint: 10,
    maxStock: 30,
    unitCost: 299.0,
    sellingPrice: 449.0,
    pricingTiers: [
      { quantity: 1, price: 449.0 },
      { quantity: 5, price: 429.0 },
      { quantity: 10, price: 399.0 },
    ],
    status: "Out of Stock",
    lastUpdated: "2024-01-13",
    supplier: "ErgoMax Furniture",
    leadTime: 21,
    batchTracking: false,
    serialTracking: false,
    warehouses: [
      { location: "Main Warehouse", stock: 0 },
      { location: "East Coast DC", stock: 0 },
      { location: "West Coast DC", stock: 0 },
    ],
  },
]

// Mock data for warehouses
const warehouses = [
  {
    id: "WH-001",
    name: "Main Warehouse",
    code: "MAIN",
    address: "123 Industrial Blvd, City, State 12345",
    manager: "John Smith",
    phone: "+1 (555) 123-4567",
    email: "john.smith@company.com",
    capacity: 10000,
    currentUtilization: 7500,
    utilizationPercent: 75,
    status: "Active",
    zones: ["A1", "A2", "B1", "B2", "C1"],
    totalItems: 1247,
    totalValue: 2847392.5,
  },
  {
    id: "WH-002",
    name: "East Coast DC",
    code: "EAST",
    address: "456 Distribution Way, East City, State 23456",
    manager: "Sarah Johnson",
    phone: "+1 (555) 234-5678",
    email: "sarah.johnson@company.com",
    capacity: 8000,
    currentUtilization: 5200,
    utilizationPercent: 65,
    status: "Active",
    zones: ["E1", "E2", "E3", "E4"],
    totalItems: 892,
    totalValue: 1923847.25,
  },
  {
    id: "WH-003",
    name: "West Coast DC",
    code: "WEST",
    address: "789 Logistics Ave, West City, State 34567",
    manager: "Mike Davis",
    phone: "+1 (555) 345-6789",
    email: "mike.davis@company.com",
    capacity: 6000,
    currentUtilization: 3800,
    utilizationPercent: 63,
    status: "Active",
    zones: ["W1", "W2", "W3"],
    totalItems: 634,
    totalValue: 1456293.75,
  },
]

// Mock data for stock movements
const stockMovements = [
  {
    id: "MOV-001",
    date: "2024-01-15",
    time: "14:30",
    type: "Stock In",
    product: 'MacBook Pro 16" M3',
    sku: "MBP-16-M3-512",
    warehouse: "Main Warehouse",
    quantity: 10,
    batchNumber: "BATCH-2024-001",
    serialNumbers: ["SN001", "SN002", "SN003"],
    reference: "PO-2024-001",
    user: "John Doe",
    notes: "Received from Apple Inc.",
  },
  {
    id: "MOV-002",
    date: "2024-01-15",
    time: "11:15",
    type: "Stock Out",
    product: "Dell XPS 13",
    sku: "DELL-XPS13-256",
    warehouse: "East Coast DC",
    quantity: -5,
    batchNumber: "BATCH-2024-002",
    serialNumbers: ["SN004", "SN005"],
    reference: "SO-2024-015",
    user: "Jane Smith",
    notes: "Shipped to customer ABC Corp",
  },
  {
    id: "MOV-003",
    date: "2024-01-14",
    time: "16:45",
    type: "Transfer",
    product: 'MacBook Pro 16" M3',
    sku: "MBP-16-M3-512",
    warehouse: "Main Warehouse → East Coast DC",
    quantity: 5,
    batchNumber: "BATCH-2024-001",
    serialNumbers: ["SN006", "SN007"],
    reference: "TRF-2024-003",
    user: "Mike Johnson",
    notes: "Inter-warehouse transfer",
  },
]

// Mock data for reorder alerts
const reorderAlerts = [
  {
    id: "ALERT-001",
    product: "Dell XPS 13",
    sku: "DELL-XPS13-256",
    currentStock: 12,
    reorderPoint: 15,
    suggestedOrder: 25,
    supplier: "Dell Technologies",
    leadTime: 10,
    priority: "High",
    aiRecommendation: "Order 30 units based on seasonal demand forecast",
    estimatedStockout: "2024-01-25",
  },
  {
    id: "ALERT-002",
    product: "Office Chair Pro",
    sku: "CHAIR-PRO-BLK",
    currentStock: 0,
    reorderPoint: 10,
    suggestedOrder: 20,
    supplier: "ErgoMax Furniture",
    leadTime: 21,
    priority: "Critical",
    aiRecommendation: "Urgent reorder - already out of stock",
    estimatedStockout: "Now",
  },
]

// Mock data for stock issues
const stockIssues = [
  {
    id: "SI-2024-001",
    date: "2024-01-15",
    requester: "John Smith",
    department: "IT Department",
    project: "Digital Transformation",
    warehouse: "Main Warehouse",
    status: "Approved",
    priority: "High",
    items: [
      {
        product: 'MacBook Pro 16" M3',
        sku: "MBP-16-M3-512",
        quantity: 2,
        reason: "New team members",
        approvedQuantity: 2
      }
    ],
    totalValue: 5598.00,
    approvedBy: "Sarah Johnson",
    approvedDate: "2024-01-15",
    notes: "Urgent requirement for new project team"
  },
  {
    id: "SI-2024-002",
    date: "2024-01-14",
    requester: "Mike Davis",
    department: "Marketing",
    project: "Q1 Campaign",
    warehouse: "East Coast DC",
    status: "Pending",
    priority: "Medium",
    items: [
      {
        product: "Office Chair Pro",
        sku: "CHAIR-PRO-BLK",
        quantity: 5,
        reason: "Office expansion",
        approvedQuantity: 0
      }
    ],
    totalValue: 2245.00,
    approvedBy: null,
    approvedDate: null,
    notes: "Additional seating for new marketing team"
  },
  {
    id: "SI-2024-003",
    date: "2024-01-13",
    requester: "Lisa Brown",
    department: "Operations",
    project: "Warehouse Upgrade",
    warehouse: "Main Warehouse",
    status: "Rejected",
    priority: "Low",
    items: [
      {
        product: "Dell XPS 13",
        sku: "DELL-XPS13-256",
        quantity: 3,
        reason: "Equipment replacement",
        approvedQuantity: 0
      }
    ],
    totalValue: 4497.00,
    approvedBy: "David Wilson",
    approvedDate: "2024-01-13",
    notes: "Rejected due to budget constraints"
  }
]

const departments = [
  { id: "it", name: "IT Department", manager: "John Smith" },
  { id: "marketing", name: "Marketing", manager: "Mike Davis" },
  { id: "operations", name: "Operations", manager: "Lisa Brown" },
  { id: "sales", name: "Sales", manager: "Sarah Johnson" },
  { id: "hr", name: "Human Resources", manager: "David Wilson" }
]

const projects = [
  { id: "dt", name: "Digital Transformation", status: "Active" },
  { id: "q1-campaign", name: "Q1 Campaign", status: "Active" },
  { id: "warehouse-upgrade", name: "Warehouse Upgrade", status: "Planning" },
  { id: "office-expansion", name: "Office Expansion", status: "Active" }
]

// Mock data for AI forecasting
const demandForecast = [
  { month: "Jan", actual: 120, predicted: 125, confidence: 92 },
  { month: "Feb", actual: 135, predicted: 140, confidence: 89 },
  { month: "Mar", actual: 150, predicted: 145, confidence: 94 },
  { month: "Apr", actual: null, predicted: 160, confidence: 87 },
  { month: "May", actual: null, predicted: 175, confidence: 85 },
  { month: "Jun", actual: null, predicted: 190, confidence: 83 },
]

export function InventoryOverview() {
  const [selectedTab, setSelectedTab] = useState("overview")
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedWarehouse, setSelectedWarehouse] = useState("all")
  const [isCreateIssueOpen, setIsCreateIssueOpen] = useState(false)
  const [isCreateReturnOpen, setIsCreateReturnOpen] = useState(false)

  const totalValue = inventoryItems.reduce((sum, item) => sum + item.currentStock * item.unitCost, 0)
  const totalItems = inventoryItems.reduce((sum, item) => sum + item.currentStock, 0)
  const lowStockItems = inventoryItems.filter((item) => item.currentStock <= item.reorderPoint).length
  const outOfStockItems = inventoryItems.filter((item) => item.currentStock === 0).length

  // Mock data for stock returns
  const stockReturns = [
    {
      id: "RET-2024-001",
      date: "2024-01-15",
      type: "Customer Return",
      customer: "TechCorp Solutions",
      product: 'MacBook Pro 16" M3',
      sku: "MBP-16-M3-512",
      quantity: 1,
      reason: "Defective Product",
      condition: "Damaged",
      status: "Pending Approval",
      value: 2799.00,
      warehouse: "Main Warehouse",
      returnAuthNumber: "RA-2024-001",
      notes: "Screen flickering issue reported"
    },
    {
      id: "RET-2024-002",
      date: "2024-01-14",
      type: "Vendor Return",
      vendor: "Apple Inc.",
      product: "Dell XPS 13",
      sku: "DELL-XPS13-256",
      quantity: 2,
      reason: "Quality Issue",
      condition: "Good",
      status: "Approved",
      value: 2998.00,
      warehouse: "East Coast DC",
      returnAuthNumber: "RA-2024-002",
      notes: "Batch quality issue, vendor acknowledged"
    },
    {
      id: "RET-2024-003",
      date: "2024-01-13",
      type: "Customer Return",
      customer: "Global Dynamics",
      product: "Office Chair Pro",
      sku: "CHAIR-PRO-BLK",
      quantity: 3,
      reason: "Wrong Item Received",
      condition: "Unused",
      status: "Processed",
      value: 1347.00,
      warehouse: "Main Warehouse",
      returnAuthNumber: "RA-2024-003",
      notes: "Wrong color received, customer wants black"
    }
  ]

  const returnReasons = [
    { id: "defective", name: "Defective Product", category: "Quality" },
    { id: "wrong-item", name: "Wrong Item Received", category: "Logistics" },
    { id: "damaged", name: "Damaged in Transit", category: "Shipping" },
    { id: "quality", name: "Quality Issue", category: "Quality" },
    { id: "customer-change", name: "Customer Changed Mind", category: "Customer" },
    { id: "oversupply", name: "Oversupply", category: "Inventory" }
  ]

  const returnConditions = [
    { id: "unused", name: "Unused", description: "Product in original packaging" },
    { id: "good", name: "Good", description: "Minor wear, fully functional" },
    { id: "fair", name: "Fair", description: "Some wear, functional" },
    { id: "damaged", name: "Damaged", description: "Significant damage" },
    { id: "defective", name: "Defective", description: "Not functioning properly" }
  ]

  // Mock data for stock transfers
  const stockTransfers = [
    {
      id: "ST-2024-001",
      transferNumber: "TRF-2024-001",
      date: "2024-01-15",
      fromWarehouse: "Main Warehouse",
      toWarehouse: "East Coast DC",
      requester: "John Smith",
      reason: "Demand Rebalancing",
      priority: "High",
      status: "In Transit",
      items: [
        {
          product: 'MacBook Pro 16" M3',
          sku: "MBP-16-M3-512",
          quantity: 5,
          unitCost: 2299.00,
          totalValue: 11495.00
        },
        {
          product: "Dell XPS 13",
          sku: "DELL-XPS13-256",
          quantity: 3,
          unitCost: 1199.00,
          totalValue: 3597.00
        }
      ],
      totalValue: 15092.00,
      approvedBy: "Sarah Johnson",
      approvedDate: "2024-01-15",
      shippedDate: "2024-01-15",
      expectedDelivery: "2024-01-17",
      actualDelivery: null,
      trackingNumber: "TRK-2024-001",
      carrier: "FedEx",
      notes: "Urgent transfer for East Coast demand"
    },
    {
      id: "ST-2024-002",
      transferNumber: "TRF-2024-002",
      date: "2024-01-14",
      fromWarehouse: "East Coast DC",
      toWarehouse: "West Coast DC",
      requester: "Mike Davis",
      reason: "New Store Opening",
      priority: "Medium",
      status: "Pending Approval",
      items: [
        {
          product: "Office Chair Pro",
          sku: "CHAIR-PRO-BLK",
          quantity: 10,
          unitCost: 299.00,
          totalValue: 2990.00
        }
      ],
      totalValue: 2990.00,
      approvedBy: null,
      approvedDate: null,
      shippedDate: null,
      expectedDelivery: null,
      actualDelivery: null,
      trackingNumber: null,
      carrier: null,
      notes: "Initial stock for new West Coast store"
    },
    {
      id: "ST-2024-003",
      transferNumber: "TRF-2024-003",
      date: "2024-01-13",
      fromWarehouse: "West Coast DC",
      toWarehouse: "Main Warehouse",
      requester: "Lisa Brown",
      reason: "Consolidation",
      priority: "Low",
      status: "Completed",
      items: [
        {
          product: "Dell XPS 13",
          sku: "DELL-XPS13-256",
          quantity: 2,
          unitCost: 1199.00,
          totalValue: 2398.00
        }
      ],
      totalValue: 2398.00,
      approvedBy: "David Wilson",
      approvedDate: "2024-01-13",
      shippedDate: "2024-01-13",
      expectedDelivery: "2024-01-15",
      actualDelivery: "2024-01-15",
      trackingNumber: "TRK-2024-003",
      carrier: "UPS",
      notes: "Consolidating slow-moving inventory"
    },
    {
      id: "ST-2024-004",
      transferNumber: "TRF-2024-004",
      date: "2024-01-12",
      fromWarehouse: "Main Warehouse",
      toWarehouse: "East Coast DC",
      requester: "Sarah Johnson",
      reason: "Seasonal Demand",
      priority: "Medium",
      status: "Delivered",
      items: [
        {
          product: 'MacBook Pro 16" M3',
          sku: "MBP-16-M3-512",
          quantity: 8,
          unitCost: 2299.00,
          totalValue: 18392.00
        }
      ],
      totalValue: 18392.00,
      approvedBy: "John Smith",
      approvedDate: "2024-01-12",
      shippedDate: "2024-01-12",
      expectedDelivery: "2024-01-14",
      actualDelivery: "2024-01-14",
      trackingNumber: "TRK-2024-004",
      carrier: "FedEx",
      notes: "Preparing for Q1 demand surge"
    }
  ]

  const transferReasons = [
    { id: "demand-rebalancing", name: "Demand Rebalancing", category: "Operations" },
    { id: "new-store", name: "New Store Opening", category: "Expansion" },
    { id: "consolidation", name: "Consolidation", category: "Optimization" },
    { id: "seasonal", name: "Seasonal Demand", category: "Planning" },
    { id: "emergency", name: "Emergency Stock", category: "Urgent" },
    { id: "maintenance", name: "Maintenance/Repair", category: "Service" }
  ]

  const carriers = [
    { id: "fedex", name: "FedEx", service: "Ground" },
    { id: "ups", name: "UPS", service: "Ground" },
    { id: "dhl", name: "DHL", service: "Express" },
    { id: "usps", name: "USPS", service: "Priority" },
    { id: "internal", name: "Internal Transport", service: "Company Vehicle" }
  ]

  // Mock data for stock take
  const stockTakes = [
    {
      id: "ST-2024-001",
      stockTakeNumber: "ST-2024-001",
      date: "2024-01-15",
      warehouse: "Main Warehouse",
      type: "Full Count",
      status: "In Progress",
      assignedTo: "John Smith",
      supervisor: "Sarah Johnson",
      startDate: "2024-01-15",
      endDate: null,
      completionPercent: 65,
      totalItems: 1247,
      countedItems: 810,
      items: [
        {
          product: 'MacBook Pro 16" M3',
          sku: "MBP-16-M3-512",
          systemQuantity: 25,
          countedQuantity: 23,
          variance: -2,
          variancePercent: -8.0,
          unitCost: 2299.00,
          varianceValue: -4598.00,
          location: "A1-01-01",
          countedBy: "John Smith",
          countedAt: "2024-01-15 10:30:00",
          notes: "Found 2 units damaged in packaging"
        },
        {
          product: "Dell XPS 13",
          sku: "DELL-XPS13-256",
          systemQuantity: 8,
          countedQuantity: 8,
          variance: 0,
          variancePercent: 0.0,
          unitCost: 1199.00,
          varianceValue: 0.00,
          location: "A1-02-01",
          countedBy: "John Smith",
          countedAt: "2024-01-15 11:15:00",
          notes: "Count matches system"
        },
        {
          product: "Office Chair Pro",
          sku: "CHAIR-PRO-BLK",
          systemQuantity: 0,
          countedQuantity: 2,
          variance: 2,
          variancePercent: 200.0,
          unitCost: 299.00,
          varianceValue: 598.00,
          location: "B2-01-01",
          countedBy: "Mike Davis",
          countedAt: "2024-01-15 14:20:00",
          notes: "Found 2 units not in system - need investigation"
        }
      ],
      totalVariance: -4000.00,
      totalVariancePercent: -1.2,
      approvedBy: null,
      approvedDate: null,
      notes: "Annual full stock take for Main Warehouse"
    },
    {
      id: "ST-2024-002",
      stockTakeNumber: "ST-2024-002",
      date: "2024-01-14",
      warehouse: "East Coast DC",
      type: "Cycle Count",
      status: "Completed",
      assignedTo: "Lisa Brown",
      supervisor: "David Wilson",
      startDate: "2024-01-14",
      endDate: "2024-01-14",
      completionPercent: 100,
      totalItems: 150,
      countedItems: 150,
      items: [
        {
          product: 'MacBook Pro 16" M3',
          sku: "MBP-16-M3-512",
          systemQuantity: 15,
          countedQuantity: 15,
          variance: 0,
          variancePercent: 0.0,
          unitCost: 2299.00,
          varianceValue: 0.00,
          location: "E1-01-01",
          countedBy: "Lisa Brown",
          countedAt: "2024-01-14 09:45:00",
          notes: "All items accounted for"
        }
      ],
      totalVariance: 0.00,
      totalVariancePercent: 0.0,
      approvedBy: "David Wilson",
      approvedDate: "2024-01-14",
      notes: "Monthly cycle count for high-value items"
    },
    {
      id: "ST-2024-003",
      stockTakeNumber: "ST-2024-003",
      date: "2024-01-13",
      warehouse: "West Coast DC",
      type: "Spot Check",
      status: "Pending Approval",
      assignedTo: "Mike Davis",
      supervisor: "Sarah Johnson",
      startDate: "2024-01-13",
      endDate: "2024-01-13",
      completionPercent: 100,
      totalItems: 50,
      countedItems: 50,
      items: [
        {
          product: "Dell XPS 13",
          sku: "DELL-XPS13-256",
          systemQuantity: 0,
          countedQuantity: 0,
          variance: 0,
          variancePercent: 0.0,
          unitCost: 1199.00,
          varianceValue: 0.00,
          location: "W1-01-01",
          countedBy: "Mike Davis",
          countedAt: "2024-01-13 16:30:00",
          notes: "Location empty as expected"
        }
      ],
      totalVariance: 0.00,
      totalVariancePercent: 0.0,
      approvedBy: null,
      approvedDate: null,
      notes: "Random spot check for accuracy verification"
    }
  ]

  const stockTakeTypes = [
    { id: "full-count", name: "Full Count", description: "Complete inventory count" },
    { id: "cycle-count", name: "Cycle Count", description: "Regular counting of specific items" },
    { id: "spot-check", name: "Spot Check", description: "Random verification count" },
    { id: "reconciliation", name: "Reconciliation", description: "Variance investigation count" }
  ]

  const varianceThresholds = [
    { id: "low", name: "Low", threshold: 5, color: "green" },
    { id: "medium", name: "Medium", threshold: 10, color: "yellow" },
    { id: "high", name: "High", threshold: 15, color: "red" }
  ]

  return (
    <div className="space-y-8 bg-soft-gradient -m-10 p-10 rounded-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inventory Management</h1>
          <p className="text-muted-foreground mt-2">
            AI-powered inventory control with real-time tracking and forecasting
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="lg" className="rounded-full">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Dialog open={isCreateIssueOpen} onOpenChange={setIsCreateIssueOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="rounded-full">
                <Plus className="w-4 h-4 mr-2" />
                Create Stock Issue
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh] rounded-4xl shadow-soft dark:shadow-soft-dark overflow-hidden flex flex-col">
              <DialogHeader className="flex-shrink-0">
                <DialogTitle>Create Stock Issue Request</DialogTitle>
                <DialogDescription>
                  Request stock items for department or project use
                </DialogDescription>
              </DialogHeader>
              <div className="flex-1 overflow-y-auto px-1">
                <div className="space-y-6 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="requester">Requester</Label>
                    <Input id="requester" placeholder="Your name" className="rounded-xl" />
                  </div>
                  <div>
                    <Label htmlFor="priority">Priority</Label>
                    <Select>
                      <SelectTrigger className="rounded-xl">
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="department">Department</Label>
                    <Select>
                      <SelectTrigger className="rounded-xl">
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        {departments.map((dept) => (
                          <SelectItem key={dept.id} value={dept.id}>
                            {dept.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="project">Project (Optional)</Label>
                    <Select>
                      <SelectTrigger className="rounded-xl">
                        <SelectValue placeholder="Select project" />
                      </SelectTrigger>
                      <SelectContent>
                        {projects.map((project) => (
                          <SelectItem key={project.id} value={project.id}>
                            {project.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="warehouse">Warehouse</Label>
                  <Select>
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="Select warehouse" />
                    </SelectTrigger>
                    <SelectContent>
                      {warehouses.map((wh) => (
                        <SelectItem key={wh.id} value={wh.id}>
                          {wh.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Items Required</Label>
                  <div className="space-y-3 mt-2">
                    <div className="grid grid-cols-4 gap-3">
                      <div>
                        <Label htmlFor="product">Product</Label>
                        <Select>
                          <SelectTrigger className="rounded-xl">
                            <SelectValue placeholder="Select product" />
                          </SelectTrigger>
                          <SelectContent>
                            {inventoryItems.map((item) => (
                              <SelectItem key={item.id} value={item.id}>
                                {item.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="quantity">Quantity</Label>
                        <Input id="quantity" type="number" placeholder="1" className="rounded-xl" />
                      </div>
                      <div>
                        <Label htmlFor="reason">Reason</Label>
                        <Input id="reason" placeholder="e.g., New team members" className="rounded-xl" />
                      </div>
                      <div className="flex items-end">
                        <Button variant="outline" size="icon" className="rounded-xl">
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea id="notes" placeholder="Additional notes..." className="rounded-xl" />
                </div>
                </div>
              </div>
              <DialogFooter className="flex-shrink-0">
                <Button variant="outline" className="rounded-full">Cancel</Button>
                <Button className="rounded-full">Submit Request</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Dialog open={isCreateReturnOpen} onOpenChange={setIsCreateReturnOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="lg" className="rounded-full">
                <RotateCcw className="w-4 h-4 mr-2" />
                Create Return
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh] rounded-4xl shadow-soft dark:shadow-soft-dark overflow-hidden flex flex-col">
              <DialogHeader className="flex-shrink-0">
                <DialogTitle>Create Stock Return</DialogTitle>
                <DialogDescription>
                  Process customer or vendor returns with authorization
                </DialogDescription>
              </DialogHeader>
              <div className="flex-1 overflow-y-auto px-1">
                <div className="space-y-6 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="returnType">Return Type</Label>
                    <Select>
                      <SelectTrigger className="rounded-xl">
                        <SelectValue placeholder="Select return type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="customer">Customer Return</SelectItem>
                        <SelectItem value="vendor">Vendor Return</SelectItem>
                        <SelectItem value="internal">Internal Return</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="returnAuth">Return Authorization #</Label>
                    <Input id="returnAuth" placeholder="RA-2024-XXX" className="rounded-xl" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="customerVendor">Customer/Vendor</Label>
                    <Input id="customerVendor" placeholder="Customer or vendor name" className="rounded-xl" />
                  </div>
                  <div>
                    <Label htmlFor="warehouse">Warehouse</Label>
                    <Select>
                      <SelectTrigger className="rounded-xl">
                        <SelectValue placeholder="Select warehouse" />
                      </SelectTrigger>
                      <SelectContent>
                        {warehouses.map((wh) => (
                          <SelectItem key={wh.id} value={wh.id}>
                            {wh.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label>Return Items</Label>
                  <div className="space-y-3 mt-2">
                    <div className="grid grid-cols-5 gap-3">
                      <div>
                        <Label htmlFor="product">Product</Label>
                        <Select>
                          <SelectTrigger className="rounded-xl">
                            <SelectValue placeholder="Select product" />
                          </SelectTrigger>
                          <SelectContent>
                            {inventoryItems.map((item) => (
                              <SelectItem key={item.id} value={item.id}>
                                {item.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="quantity">Quantity</Label>
                        <Input id="quantity" type="number" placeholder="1" className="rounded-xl" />
                      </div>
                      <div>
                        <Label htmlFor="reason">Reason</Label>
                        <Select>
                          <SelectTrigger className="rounded-xl">
                            <SelectValue placeholder="Select reason" />
                          </SelectTrigger>
                          <SelectContent>
                            {returnReasons.map((reason) => (
                              <SelectItem key={reason.id} value={reason.id}>
                                {reason.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="condition">Condition</Label>
                        <Select>
                          <SelectTrigger className="rounded-xl">
                            <SelectValue placeholder="Select condition" />
                          </SelectTrigger>
                          <SelectContent>
                            {returnConditions.map((condition) => (
                              <SelectItem key={condition.id} value={condition.id}>
                                {condition.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-end">
                        <Button variant="outline" size="icon" className="rounded-xl">
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea id="notes" placeholder="Additional notes about the return..." className="rounded-xl" />
                </div>
                </div>
              </div>
              <DialogFooter className="flex-shrink-0">
                <Button variant="outline" className="rounded-full">Cancel</Button>
                <Button className="rounded-full">Create Return</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalValue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Current inventory value</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalItems}</div>
            <p className="text-xs text-muted-foreground">Items in stock</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{lowStockItems}</div>
            <p className="text-xs text-muted-foreground">Items below reorder point</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{outOfStockItems}</div>
            <p className="text-xs text-muted-foreground">Items requiring immediate attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-10">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="warehouses">Warehouses</TabsTrigger>
          <TabsTrigger value="movements">Stock Movements</TabsTrigger>
          <TabsTrigger value="issues">Stock Issues</TabsTrigger>
          <TabsTrigger value="returns">Stock Returns</TabsTrigger>
          <TabsTrigger value="transfers">Stock Transfers</TabsTrigger>
          <TabsTrigger value="stocktake">Stock Take</TabsTrigger>
          <TabsTrigger value="alerts">Reorder Alerts</TabsTrigger>
          <TabsTrigger value="forecasting">AI Forecasting</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Inventory Status Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Inventory Status Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-sm">In Stock</span>
                    </div>
                    <span className="text-sm font-medium">67%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <span className="text-sm">Low Stock</span>
                    </div>
                    <span className="text-sm font-medium">22%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <span className="text-sm">Out of Stock</span>
                    </div>
                    <span className="text-sm font-medium">11%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Top Categories */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart2 className="h-5 w-5" />
                  Top Categories by Value
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Electronics</span>
                    <span className="text-sm font-medium">$1,847,392</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Furniture</span>
                    <span className="text-sm font-medium">$456,789</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Office Supplies</span>
                    <span className="text-sm font-medium">$234,567</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Software</span>
                    <span className="text-sm font-medium">$123,456</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Recent Inventory Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stockMovements.slice(0, 5).map((movement) => (
                  <div key={movement.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-full ${
                          movement.type === "Stock In"
                            ? "bg-green-100 text-green-600"
                            : movement.type === "Stock Out"
                              ? "bg-red-100 text-red-600"
                              : "bg-blue-100 text-blue-600"
                        }`}
                      >
                        {movement.type === "Stock In" ? (
                          <ArrowUpDown className="h-4 w-4" />
                        ) : movement.type === "Stock Out" ? (
                          <ArrowUpDown className="h-4 w-4" />
                        ) : (
                          <Move className="h-4 w-4" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{movement.product}</p>
                        <p className="text-sm text-muted-foreground">
                          {movement.type} • {movement.warehouse} • Qty: {Math.abs(movement.quantity)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{movement.date}</p>
                      <p className="text-sm text-muted-foreground">{movement.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Products Tab */}
        <TabsContent value="products" className="space-y-6">
          {/* Search and Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search products..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="electronics">Electronics</SelectItem>
                    <SelectItem value="furniture">Furniture</SelectItem>
                    <SelectItem value="office-supplies">Office Supplies</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={selectedWarehouse} onValueChange={setSelectedWarehouse}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Warehouse" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Warehouses</SelectItem>
                    <SelectItem value="main">Main Warehouse</SelectItem>
                    <SelectItem value="east">East Coast DC</SelectItem>
                    <SelectItem value="west">West Coast DC</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline">
                  <Filter className="h-4 w-4 mr-2" />
                  More Filters
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Products Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {inventoryItems.map((item) => (
              <Card key={item.id} className="overflow-hidden">
                <div className="aspect-video bg-gray-100 flex items-center justify-center">
                  <img src={item.image || "/placeholder.svg"} alt={item.name} className="w-full h-full object-cover" />
                </div>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold">{item.name}</h3>
                      <p className="text-sm text-muted-foreground">{item.sku}</p>
                    </div>
                    <Badge
                      variant={
                        item.status === "In Stock"
                          ? "default"
                          : item.status === "Low Stock"
                            ? "secondary"
                            : "destructive"
                      }
                    >
                      {item.status}
                    </Badge>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span>Current Stock:</span>
                      <span className="font-medium">{item.currentStock}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Available:</span>
                      <span className="font-medium">{item.availableStock}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Reorder Point:</span>
                      <span className="font-medium">{item.reorderPoint}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Unit Cost:</span>
                      <span className="font-medium">${item.unitCost}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mb-4">
                    {item.batchTracking && (
                      <Badge variant="outline" className="text-xs">
                        <Hash className="h-3 w-3 mr-1" />
                        Batch
                      </Badge>
                    )}
                    {item.serialTracking && (
                      <Badge variant="outline" className="text-xs">
                        <Tag className="h-3 w-3 mr-1" />
                        Serial
                      </Badge>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Stock Adjustment</DialogTitle>
                          <DialogDescription>Adjust stock levels for {item.name}</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label>Current Stock: {item.currentStock}</Label>
                          </div>
                          <div>
                            <Label htmlFor="adjustment">Adjustment Quantity</Label>
                            <Input id="adjustment" type="number" placeholder="Enter adjustment (+/-)" />
                          </div>
                          <div>
                            <Label htmlFor="reason">Reason</Label>
                            <Select>
                              <SelectTrigger>
                                <SelectValue placeholder="Select reason" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="damaged">Damaged Goods</SelectItem>
                                <SelectItem value="lost">Lost/Stolen</SelectItem>
                                <SelectItem value="found">Found Stock</SelectItem>
                                <SelectItem value="correction">Count Correction</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="notes">Notes</Label>
                            <Textarea id="notes" placeholder="Additional notes..." />
                          </div>
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button variant="outline">Cancel</Button>
                          <Button>Apply Adjustment</Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Warehouses Tab */}
        <TabsContent value="warehouses" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Warehouse Management</h2>
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Warehouse
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Warehouse</DialogTitle>
                  <DialogDescription>Create a new warehouse location</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="warehouseName">Warehouse Name</Label>
                    <Input id="warehouseName" placeholder="Enter warehouse name" />
                  </div>
                  <div>
                    <Label htmlFor="warehouseCode">Code</Label>
                    <Input id="warehouseCode" placeholder="Warehouse code" />
                  </div>
                  <div>
                    <Label htmlFor="address">Address</Label>
                    <Textarea id="address" placeholder="Full address" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="manager">Manager</Label>
                      <Input id="manager" placeholder="Manager name" />
                    </div>
                    <div>
                      <Label htmlFor="capacity">Capacity</Label>
                      <Input id="capacity" type="number" placeholder="Storage capacity" />
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline">Cancel</Button>
                  <Button>Create Warehouse</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {warehouses.map((warehouse) => (
              <Card key={warehouse.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Warehouse className="h-5 w-5" />
                      {warehouse.name}
                    </CardTitle>
                    <Badge variant={warehouse.status === "Active" ? "default" : "secondary"}>{warehouse.status}</Badge>
                  </div>
                  <CardDescription>Code: {warehouse.code}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                      <MapPin className="h-4 w-4" />
                      {warehouse.address}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="h-4 w-4" />
                      Manager: {warehouse.manager}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Utilization:</span>
                      <span className="font-medium">{warehouse.utilizationPercent}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${warehouse.utilizationPercent}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{warehouse.currentUtilization.toLocaleString()} used</span>
                      <span>{warehouse.capacity.toLocaleString()} capacity</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Total Items:</span>
                      <p className="font-medium">{warehouse.totalItems.toLocaleString()}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Total Value:</span>
                      <p className="font-medium">${warehouse.totalValue.toLocaleString()}</p>
                    </div>
                  </div>

                  <div>
                    <span className="text-sm text-muted-foreground">Zones:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {warehouse.zones.map((zone) => (
                        <Badge key={zone} variant="outline" className="text-xs">
                          {zone}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="flex-1">
                          <Move className="h-4 w-4 mr-2" />
                          Transfer
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Stock Transfer</DialogTitle>
                          <DialogDescription>Transfer stock between warehouses</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="fromWarehouse">From Warehouse</Label>
                            <Select>
                              <SelectTrigger>
                                <SelectValue placeholder="Select source warehouse" />
                              </SelectTrigger>
                              <SelectContent>
                                {warehouses.map((wh) => (
                                  <SelectItem key={wh.id} value={wh.id}>
                                    {wh.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="toWarehouse">To Warehouse</Label>
                            <Select>
                              <SelectTrigger>
                                <SelectValue placeholder="Select destination warehouse" />
                              </SelectTrigger>
                              <SelectContent>
                                {warehouses.map((wh) => (
                                  <SelectItem key={wh.id} value={wh.id}>
                                    {wh.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="product">Product</Label>
                            <Select>
                              <SelectTrigger>
                                <SelectValue placeholder="Select product" />
                              </SelectTrigger>
                              <SelectContent>
                                {inventoryItems.map((item) => (
                                  <SelectItem key={item.id} value={item.id}>
                                    {item.name} ({item.sku})
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="quantity">Quantity</Label>
                            <Input id="quantity" type="number" placeholder="Enter quantity" />
                          </div>
                          <div>
                            <Label htmlFor="transferNotes">Notes</Label>
                            <Textarea id="transferNotes" placeholder="Transfer notes..." />
                          </div>
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button variant="outline">Cancel</Button>
                          <Button>Create Transfer</Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Stock Movements Tab */}
        <TabsContent value="movements" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Stock Movement History</h2>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export Log
              </Button>
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Manual Entry
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Manual Stock Entry</DialogTitle>
                    <DialogDescription>Record a manual stock movement</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="movementType">Movement Type</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select movement type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="in">Stock In</SelectItem>
                          <SelectItem value="out">Stock Out</SelectItem>
                          <SelectItem value="adjustment">Adjustment</SelectItem>
                          <SelectItem value="transfer">Transfer</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="product">Product</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select product" />
                        </SelectTrigger>
                        <SelectContent>
                          {inventoryItems.map((item) => (
                            <SelectItem key={item.id} value={item.id}>
                              {item.name} ({item.sku})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="warehouse">Warehouse</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select warehouse" />
                        </SelectTrigger>
                        <SelectContent>
                          {warehouses.map((wh) => (
                            <SelectItem key={wh.id} value={wh.id}>
                              {wh.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="quantity">Quantity</Label>
                      <Input id="quantity" type="number" placeholder="Enter quantity" />
                    </div>
                    <div>
                      <Label htmlFor="batchNumber">Batch Number (Optional)</Label>
                      <Input id="batchNumber" placeholder="Batch number" />
                    </div>
                    <div>
                      <Label htmlFor="reference">Reference</Label>
                      <Input id="reference" placeholder="PO, SO, or other reference" />
                    </div>
                    <div>
                      <Label htmlFor="notes">Notes</Label>
                      <Textarea id="notes" placeholder="Movement notes..." />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline">Cancel</Button>
                    <Button>Record Movement</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {stockMovements.map((movement) => (
                  <div key={movement.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div
                        className={`p-3 rounded-full ${
                          movement.type === "Stock In"
                            ? "bg-green-100 text-green-600"
                            : movement.type === "Stock Out"
                              ? "bg-red-100 text-red-600"
                              : "bg-blue-100 text-blue-600"
                        }`}
                      >
                        {movement.type === "Stock In" ? (
                          <ArrowUpDown className="h-5 w-5" />
                        ) : movement.type === "Stock Out" ? (
                          <ArrowUpDown className="h-5 w-5" />
                        ) : (
                          <Move className="h-5 w-5" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-semibold">{movement.product}</h4>
                        <p className="text-sm text-muted-foreground">SKU: {movement.sku}</p>
                        <p className="text-sm text-muted-foreground">{movement.warehouse}</p>
                      </div>
                    </div>
                    <div className="text-center">
                      <p className={`text-lg font-bold ${movement.quantity > 0 ? "text-green-600" : "text-red-600"}`}>
                        {movement.quantity > 0 ? "+" : ""}
                        {movement.quantity}
                      </p>
                      <p className="text-sm text-muted-foreground">{movement.type}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{movement.date}</p>
                      <p className="text-sm text-muted-foreground">{movement.time}</p>
                      <p className="text-sm text-muted-foreground">by {movement.user}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Ref: {movement.reference}</p>
                      {movement.batchNumber && (
                        <p className="text-sm text-muted-foreground">Batch: {movement.batchNumber}</p>
                      )}
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Stock Issues Tab */}
        <TabsContent value="issues" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Stock Issue Management</h2>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </Button>
            </div>
          </div>

          {/* Issue Statistics */}
          <div className="grid gap-6 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stockIssues.length}</div>
                <p className="text-xs text-muted-foreground">All time</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending</CardTitle>
                <Clock className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">
                  {stockIssues.filter(issue => issue.status === "Pending").length}
                </div>
                <p className="text-xs text-muted-foreground">Awaiting approval</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Approved</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {stockIssues.filter(issue => issue.status === "Approved").length}
                </div>
                <p className="text-xs text-muted-foreground">This month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Rejected</CardTitle>
                <XCircle className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {stockIssues.filter(issue => issue.status === "Rejected").length}
                </div>
                <p className="text-xs text-muted-foreground">This month</p>
              </CardContent>
            </Card>
          </div>

          {/* Stock Issues Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Stock Issue Requests
              </CardTitle>
              <CardDescription>Track all stock issue requests and their approval status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-2xl border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="font-semibold">Issue ID</TableHead>
                      <TableHead className="font-semibold">Date</TableHead>
                      <TableHead className="font-semibold">Requester</TableHead>
                      <TableHead className="font-semibold">Department</TableHead>
                      <TableHead className="font-semibold">Project</TableHead>
                      <TableHead className="font-semibold">Priority</TableHead>
                      <TableHead className="font-semibold text-right">Value</TableHead>
                      <TableHead className="font-semibold">Status</TableHead>
                      <TableHead className="font-semibold">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stockIssues.map((issue) => (
                      <TableRow key={issue.id} className="hover:bg-muted/30 transition-colors">
                        <TableCell className="font-mono">{issue.id}</TableCell>
                        <TableCell>{issue.date}</TableCell>
                        <TableCell className="font-medium">{issue.requester}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="rounded-full">
                            {issue.department}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {issue.project ? (
                            <Badge variant="secondary" className="rounded-full">
                              {issue.project}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={
                              issue.priority === "High" || issue.priority === "Urgent"
                                ? "bg-red-500/20 text-red-600 border-red-500/30"
                                : issue.priority === "Medium"
                                  ? "bg-yellow-500/20 text-yellow-600 border-yellow-500/30"
                                  : "bg-green-500/20 text-green-600 border-green-500/30"
                            }
                          >
                            {issue.priority}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-mono">${issue.totalValue.toFixed(2)}</TableCell>
                        <TableCell>
                          <Badge
                            className={
                              issue.status === "Approved"
                                ? "bg-green-500/20 text-green-600 border-green-500/30"
                                : issue.status === "Pending"
                                  ? "bg-yellow-500/20 text-yellow-600 border-yellow-500/30"
                                  : "bg-red-500/20 text-red-600 border-red-500/30"
                            }
                          >
                            {issue.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl">
                              <Eye className="w-4 h-4" />
                            </Button>
                            {issue.status === "Pending" && (
                              <>
                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl text-green-600">
                                  <CheckCircle className="w-4 h-4" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl text-red-600">
                                  <XCircle className="w-4 h-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Department-wise Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Department-wise Summary
              </CardTitle>
              <CardDescription>Stock issue requests by department</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {departments.map((dept) => {
                  const deptIssues = stockIssues.filter(issue => 
                    issue.department === dept.name
                  )
                  const pendingCount = deptIssues.filter(issue => issue.status === "Pending").length
                  const approvedCount = deptIssues.filter(issue => issue.status === "Approved").length
                  const totalValue = deptIssues.reduce((sum, issue) => sum + issue.totalValue, 0)

                  return (
                    <div key={dept.id} className="p-4 border rounded-xl">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium">{dept.name}</h4>
                        <Badge variant="outline" className="rounded-full">
                          {deptIssues.length} requests
                        </Badge>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Pending:</span>
                          <span className="font-medium text-yellow-600">{pendingCount}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Approved:</span>
                          <span className="font-medium text-green-600">{approvedCount}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Total Value:</span>
                          <span className="font-medium">${totalValue.toFixed(2)}</span>
                        </div>
                      </div>
                      <div className="mt-3 pt-3 border-t">
                        <p className="text-xs text-muted-foreground">Manager: {dept.manager}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Stock Returns Tab */}
        <TabsContent value="returns" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Stock Return Management</h2>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </Button>
            </div>
          </div>

          {/* Return Statistics */}
          <div className="grid gap-6 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Returns</CardTitle>
                <RotateCcw className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stockReturns.length}</div>
                <p className="text-xs text-muted-foreground">This month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending</CardTitle>
                <Clock className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">
                  {stockReturns.filter(ret => ret.status === "Pending Approval").length}
                </div>
                <p className="text-xs text-muted-foreground">Awaiting approval</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Approved</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {stockReturns.filter(ret => ret.status === "Approved").length}
                </div>
                <p className="text-xs text-muted-foreground">This month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Processed</CardTitle>
                <Package className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {stockReturns.filter(ret => ret.status === "Processed").length}
                </div>
                <p className="text-xs text-muted-foreground">This month</p>
              </CardContent>
            </Card>
          </div>

          {/* Stock Returns Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RotateCcw className="h-5 w-5" />
                Stock Returns
              </CardTitle>
              <CardDescription>Track all customer and vendor returns</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-2xl border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="font-semibold">Return ID</TableHead>
                      <TableHead className="font-semibold">Date</TableHead>
                      <TableHead className="font-semibold">Type</TableHead>
                      <TableHead className="font-semibold">Customer/Vendor</TableHead>
                      <TableHead className="font-semibold">Product</TableHead>
                      <TableHead className="font-semibold">Quantity</TableHead>
                      <TableHead className="font-semibold">Reason</TableHead>
                      <TableHead className="font-semibold">Condition</TableHead>
                      <TableHead className="font-semibold text-right">Value</TableHead>
                      <TableHead className="font-semibold">Status</TableHead>
                      <TableHead className="font-semibold">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stockReturns.map((ret) => (
                      <TableRow key={ret.id} className="hover:bg-muted/30 transition-colors">
                        <TableCell className="font-mono">{ret.id}</TableCell>
                        <TableCell>{ret.date}</TableCell>
                        <TableCell>
                          <Badge
                            className={
                              ret.type === "Customer Return"
                                ? "bg-blue-500/20 text-blue-600 border-blue-500/30"
                                : "bg-purple-500/20 text-purple-600 border-purple-500/30"
                            }
                          >
                            {ret.type}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">{ret.customer || ret.vendor}</TableCell>
                        <TableCell className="max-w-xs truncate">{ret.product}</TableCell>
                        <TableCell>{ret.quantity}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="rounded-full text-xs">
                            {ret.reason}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={
                              ret.condition === "Unused"
                                ? "bg-green-500/20 text-green-600 border-green-500/30"
                                : ret.condition === "Good"
                                  ? "bg-blue-500/20 text-blue-600 border-blue-500/30"
                                  : ret.condition === "Damaged"
                                    ? "bg-red-500/20 text-red-600 border-red-500/30"
                                    : "bg-yellow-500/20 text-yellow-600 border-yellow-500/30"
                            }
                          >
                            {ret.condition}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-mono">${ret.value.toFixed(2)}</TableCell>
                        <TableCell>
                          <Badge
                            className={
                              ret.status === "Processed"
                                ? "bg-green-500/20 text-green-600 border-green-500/30"
                                : ret.status === "Approved"
                                  ? "bg-blue-500/20 text-blue-600 border-blue-500/30"
                                  : "bg-yellow-500/20 text-yellow-600 border-yellow-500/30"
                            }
                          >
                            {ret.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl">
                              <Eye className="w-4 h-4" />
                            </Button>
                            {ret.status === "Pending Approval" && (
                              <>
                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl text-green-600">
                                  <CheckCircle className="w-4 h-4" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl text-red-600">
                                  <XCircle className="w-4 h-4" />
                                </Button>
                              </>
                            )}
                            {ret.status === "Approved" && (
                              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl text-blue-600">
                                <Package className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Return Analysis */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Returns by Type
                </CardTitle>
                <CardDescription>Customer vs Vendor returns</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                      <span className="text-sm">Customer Returns</span>
                    </div>
                    <span className="font-medium">
                      {stockReturns.filter(ret => ret.type === "Customer Return").length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                      <span className="text-sm">Vendor Returns</span>
                    </div>
                    <span className="font-medium">
                      {stockReturns.filter(ret => ret.type === "Vendor Return").length}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Top Return Reasons
                </CardTitle>
                <CardDescription>Most common return reasons</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {returnReasons.slice(0, 4).map((reason) => (
                    <div key={reason.id} className="flex items-center justify-between">
                      <span className="text-sm">{reason.name}</span>
                      <Badge variant="outline" className="rounded-full text-xs">
                        {reason.category}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Stock Transfers Tab */}
        <TabsContent value="transfers" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Stock Transfer Management</h2>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </Button>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Create Transfer
              </Button>
            </div>
          </div>

          {/* Transfer Statistics */}
          <div className="grid gap-6 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Transfers</CardTitle>
                <Move className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stockTransfers.length}</div>
                <p className="text-xs text-muted-foreground">This month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">In Transit</CardTitle>
                <Truck className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {stockTransfers.filter(transfer => transfer.status === "In Transit").length}
                </div>
                <p className="text-xs text-muted-foreground">Currently shipping</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
                <Clock className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">
                  {stockTransfers.filter(transfer => transfer.status === "Pending Approval").length}
                </div>
                <p className="text-xs text-muted-foreground">Awaiting approval</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completed</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {stockTransfers.filter(transfer => transfer.status === "Completed").length}
                </div>
                <p className="text-xs text-muted-foreground">This month</p>
              </CardContent>
            </Card>
          </div>

          {/* Stock Transfers Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Move className="h-5 w-5" />
                Stock Transfers
              </CardTitle>
              <CardDescription>Track all inter-warehouse transfers with authorization workflow</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-2xl border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="font-semibold">Transfer #</TableHead>
                      <TableHead className="font-semibold">Date</TableHead>
                      <TableHead className="font-semibold">From</TableHead>
                      <TableHead className="font-semibold">To</TableHead>
                      <TableHead className="font-semibold">Requester</TableHead>
                      <TableHead className="font-semibold">Reason</TableHead>
                      <TableHead className="font-semibold">Priority</TableHead>
                      <TableHead className="font-semibold text-right">Value</TableHead>
                      <TableHead className="font-semibold">Status</TableHead>
                      <TableHead className="font-semibold">Tracking</TableHead>
                      <TableHead className="font-semibold">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stockTransfers.map((transfer) => (
                      <TableRow key={transfer.id} className="hover:bg-muted/30 transition-colors">
                        <TableCell className="font-mono">{transfer.transferNumber}</TableCell>
                        <TableCell>{transfer.date}</TableCell>
                        <TableCell className="font-medium">{transfer.fromWarehouse}</TableCell>
                        <TableCell className="font-medium">{transfer.toWarehouse}</TableCell>
                        <TableCell>{transfer.requester}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="rounded-full text-xs">
                            {transfer.reason}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={
                              transfer.priority === "High"
                                ? "bg-red-500/20 text-red-600 border-red-500/30"
                                : transfer.priority === "Medium"
                                  ? "bg-yellow-500/20 text-yellow-600 border-yellow-500/30"
                                  : "bg-blue-500/20 text-blue-600 border-blue-500/30"
                            }
                          >
                            {transfer.priority}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-mono">${transfer.totalValue.toFixed(2)}</TableCell>
                        <TableCell>
                          <Badge
                            className={
                              transfer.status === "Completed"
                                ? "bg-green-500/20 text-green-600 border-green-500/30"
                                : transfer.status === "In Transit"
                                  ? "bg-blue-500/20 text-blue-600 border-blue-500/30"
                                  : transfer.status === "Pending Approval"
                                    ? "bg-yellow-500/20 text-yellow-600 border-yellow-500/30"
                                    : "bg-gray-500/20 text-gray-600 border-gray-500/30"
                            }
                          >
                            {transfer.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {transfer.trackingNumber ? (
                            <div className="text-xs">
                              <div className="font-medium">{transfer.trackingNumber}</div>
                              <div className="text-muted-foreground">{transfer.carrier}</div>
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-xs">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl">
                              <Eye className="w-4 h-4" />
                            </Button>
                            {transfer.status === "Pending Approval" && (
                              <>
                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl text-green-600">
                                  <CheckCircle className="w-4 h-4" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl text-red-600">
                                  <XCircle className="w-4 h-4" />
                                </Button>
                              </>
                            )}
                            {transfer.status === "Approved" && (
                              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl text-blue-600">
                                <Truck className="w-4 h-4" />
                              </Button>
                            )}
                            {transfer.status === "In Transit" && (
                              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl text-green-600">
                                <CheckCircle className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Transfer Analysis */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Transfers by Status
                </CardTitle>
                <CardDescription>Current transfer status distribution</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      <span className="text-sm">Completed</span>
                    </div>
                    <span className="font-medium">
                      {stockTransfers.filter(transfer => transfer.status === "Completed").length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                      <span className="text-sm">In Transit</span>
                    </div>
                    <span className="font-medium">
                      {stockTransfers.filter(transfer => transfer.status === "In Transit").length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                      <span className="text-sm">Pending Approval</span>
                    </div>
                    <span className="font-medium">
                      {stockTransfers.filter(transfer => transfer.status === "Pending Approval").length}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Top Transfer Routes
                </CardTitle>
                <CardDescription>Most common transfer routes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Main → East Coast</span>
                    <Badge variant="outline" className="rounded-full text-xs">
                      {stockTransfers.filter(transfer => 
                        transfer.fromWarehouse === "Main Warehouse" && 
                        transfer.toWarehouse === "East Coast DC"
                      ).length}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">East Coast → West Coast</span>
                    <Badge variant="outline" className="rounded-full text-xs">
                      {stockTransfers.filter(transfer => 
                        transfer.fromWarehouse === "East Coast DC" && 
                        transfer.toWarehouse === "West Coast DC"
                      ).length}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">West Coast → Main</span>
                    <Badge variant="outline" className="rounded-full text-xs">
                      {stockTransfers.filter(transfer => 
                        transfer.fromWarehouse === "West Coast DC" && 
                        transfer.toWarehouse === "Main Warehouse"
                      ).length}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Stock Take Tab */}
        <TabsContent value="stocktake" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Stock Take Management</h2>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </Button>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Create Stock Take
              </Button>
            </div>
          </div>

          {/* Stock Take Statistics */}
          <div className="grid gap-6 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Stock Takes</CardTitle>
                <ClipboardList className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stockTakes.length}</div>
                <p className="text-xs text-muted-foreground">This month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">In Progress</CardTitle>
                <Clock className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {stockTakes.filter(st => st.status === "In Progress").length}
                </div>
                <p className="text-xs text-muted-foreground">Currently counting</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">
                  {stockTakes.filter(st => st.status === "Pending Approval").length}
                </div>
                <p className="text-xs text-muted-foreground">Awaiting approval</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completed</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {stockTakes.filter(st => st.status === "Completed").length}
                </div>
                <p className="text-xs text-muted-foreground">This month</p>
              </CardContent>
            </Card>
          </div>

          {/* Stock Takes Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClipboardList className="h-5 w-5" />
                Stock Takes
              </CardTitle>
              <CardDescription>Track all physical inventory counts with variance analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-2xl border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="font-semibold">Stock Take #</TableHead>
                      <TableHead className="font-semibold">Date</TableHead>
                      <TableHead className="font-semibold">Warehouse</TableHead>
                      <TableHead className="font-semibold">Type</TableHead>
                      <TableHead className="font-semibold">Assigned To</TableHead>
                      <TableHead className="font-semibold">Progress</TableHead>
                      <TableHead className="font-semibold text-right">Variance</TableHead>
                      <TableHead className="font-semibold">Status</TableHead>
                      <TableHead className="font-semibold">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stockTakes.map((stockTake) => (
                      <TableRow key={stockTake.id} className="hover:bg-muted/30 transition-colors">
                        <TableCell className="font-mono">{stockTake.stockTakeNumber}</TableCell>
                        <TableCell>{stockTake.date}</TableCell>
                        <TableCell className="font-medium">{stockTake.warehouse}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="rounded-full text-xs">
                            {stockTake.type}
                          </Badge>
                        </TableCell>
                        <TableCell>{stockTake.assignedTo}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-muted rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full ${
                                  stockTake.completionPercent >= 100 ? "bg-green-500" :
                                  stockTake.completionPercent >= 75 ? "bg-blue-500" :
                                  stockTake.completionPercent >= 50 ? "bg-yellow-500" : "bg-red-500"
                                }`}
                                style={{ width: `${stockTake.completionPercent}%` }}
                              />
                            </div>
                            <span className="text-xs font-medium">{stockTake.completionPercent}%</span>
                          </div>
                        </TableCell>
                        <TableCell className={`text-right font-mono ${
                          stockTake.totalVariance > 0 ? "text-red-600" : 
                          stockTake.totalVariance < 0 ? "text-green-600" : "text-gray-600"
                        }`}>
                          ${stockTake.totalVariance.toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={
                              stockTake.status === "Completed"
                                ? "bg-green-500/20 text-green-600 border-green-500/30"
                                : stockTake.status === "In Progress"
                                  ? "bg-blue-500/20 text-blue-600 border-blue-500/30"
                                  : stockTake.status === "Pending Approval"
                                    ? "bg-yellow-500/20 text-yellow-600 border-yellow-500/30"
                                    : "bg-gray-500/20 text-gray-600 border-gray-500/30"
                            }
                          >
                            {stockTake.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl">
                              <Eye className="w-4 h-4" />
                            </Button>
                            {stockTake.status === "Pending Approval" && (
                              <>
                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl text-green-600">
                                  <CheckCircle className="w-4 h-4" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl text-red-600">
                                  <XCircle className="w-4 h-4" />
                                </Button>
                              </>
                            )}
                            {stockTake.status === "In Progress" && (
                              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl text-blue-600">
                                <Edit className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Variance Analysis */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Variance Analysis
                </CardTitle>
                <CardDescription>Stock take variance distribution</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      <span className="text-sm">No Variance (0%)</span>
                    </div>
                    <span className="font-medium">
                      {stockTakes.filter(st => st.totalVariancePercent === 0).length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                      <span className="text-sm">Low Variance (±1-5%)</span>
                    </div>
                    <span className="font-medium">
                      {stockTakes.filter(st => Math.abs(st.totalVariancePercent) > 0 && Math.abs(st.totalVariancePercent) <= 5).length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <span className="text-sm">High Variance (&gt;5%)</span>
                    </div>
                    <span className="font-medium">
                      {stockTakes.filter(st => Math.abs(st.totalVariancePercent) > 5).length}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ClipboardList className="h-5 w-5" />
                  Stock Take Types
                </CardTitle>
                <CardDescription>Distribution by count type</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stockTakeTypes.map((type) => (
                    <div key={type.id} className="flex items-center justify-between">
                      <div>
                        <span className="text-sm font-medium">{type.name}</span>
                        <p className="text-xs text-muted-foreground">{type.description}</p>
                      </div>
                      <Badge variant="outline" className="rounded-full text-xs">
                        {stockTakes.filter(st => st.type === type.name).length}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Stock Take Items */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <List className="h-5 w-5" />
                Recent Counted Items
              </CardTitle>
              <CardDescription>Latest items counted with variances</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-2xl border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="font-semibold">Product</TableHead>
                      <TableHead className="font-semibold">SKU</TableHead>
                      <TableHead className="font-semibold">Location</TableHead>
                      <TableHead className="font-semibold">System Qty</TableHead>
                      <TableHead className="font-semibold">Counted Qty</TableHead>
                      <TableHead className="font-semibold">Variance</TableHead>
                      <TableHead className="font-semibold text-right">Variance Value</TableHead>
                      <TableHead className="font-semibold">Counted By</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stockTakes
                      .flatMap(st => st.items)
                      .slice(0, 5)
                      .map((item, index) => (
                        <TableRow key={index} className="hover:bg-muted/30 transition-colors">
                          <TableCell className="max-w-xs truncate">{item.product}</TableCell>
                          <TableCell className="font-mono text-sm">{item.sku}</TableCell>
                          <TableCell className="font-mono text-sm">{item.location}</TableCell>
                          <TableCell>{item.systemQuantity}</TableCell>
                          <TableCell>{item.countedQuantity}</TableCell>
                          <TableCell>
                            <Badge
                              className={
                                item.variance === 0
                                  ? "bg-green-500/20 text-green-600 border-green-500/30"
                                  : Math.abs(item.variancePercent) <= 5
                                    ? "bg-yellow-500/20 text-yellow-600 border-yellow-500/30"
                                    : "bg-red-500/20 text-red-600 border-red-500/30"
                              }
                            >
                              {item.variance > 0 ? '+' : ''}{item.variance}
                            </Badge>
                          </TableCell>
                          <TableCell className={`text-right font-mono ${
                            item.varianceValue > 0 ? "text-red-600" : 
                            item.varianceValue < 0 ? "text-green-600" : "text-gray-600"
                          }`}>
                            ${item.varianceValue.toFixed(2)}
                          </TableCell>
                          <TableCell className="text-sm">{item.countedBy}</TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reorder Alerts Tab */}
        <TabsContent value="alerts" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Reorder Point Alerts</h2>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Configure Alerts
              </Button>
              <Button size="sm">
                <Bell className="h-4 w-4 mr-2" />
                Mark All Read
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {reorderAlerts.map((alert) => (
              <Card
                key={alert.id}
                className={`border-l-4 ${
                  alert.priority === "Critical"
                    ? "border-l-red-500"
                    : alert.priority === "High"
                      ? "border-l-yellow-500"
                      : "border-l-blue-500"
                }`}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle
                        className={`h-5 w-5 ${
                          alert.priority === "Critical"
                            ? "text-red-500"
                            : alert.priority === "High"
                              ? "text-yellow-500"
                              : "text-blue-500"
                        }`}
                      />
                      {alert.product}
                    </CardTitle>
                    <Badge
                      variant={
                        alert.priority === "Critical"
                          ? "destructive"
                          : alert.priority === "High"
                            ? "secondary"
                            : "default"
                      }
                    >
                      {alert.priority}
                    </Badge>
                  </div>
                  <CardDescription>SKU: {alert.sku}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Current Stock:</span>
                      <p className="font-medium text-lg">{alert.currentStock}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Reorder Point:</span>
                      <p className="font-medium text-lg">{alert.reorderPoint}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Suggested Order Quantity:</span>
                      <span className="font-medium">{alert.suggestedOrder} units</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Supplier:</span>
                      <span className="font-medium">{alert.supplier}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Lead Time:</span>
                      <span className="font-medium">{alert.leadTime} days</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Est. Stockout:</span>
                      <span
                        className={`font-medium ${
                          alert.estimatedStockout === "Now" ? "text-red-600" : "text-yellow-600"
                        }`}
                      >
                        {alert.estimatedStockout}
                      </span>
                    </div>
                  </div>

                  <div className="p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-start gap-2">
                      <Brain className="h-4 w-4 text-blue-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-blue-900">AI Recommendation</p>
                        <p className="text-sm text-blue-700">{alert.aiRecommendation}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button size="sm" className="flex-1">
                          <ShoppingCart className="h-4 w-4 mr-2" />
                          Create PO
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Create Purchase Order</DialogTitle>
                          <DialogDescription>Generate a purchase order for {alert.product}</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label>Product: {alert.product}</Label>
                          </div>
                          <div>
                            <Label>Supplier: {alert.supplier}</Label>
                          </div>
                          <div>
                            <Label htmlFor="orderQuantity">Order Quantity</Label>
                            <Input id="orderQuantity" type="number" defaultValue={alert.suggestedOrder} />
                          </div>
                          <div>
                            <Label htmlFor="expectedDate">Expected Delivery</Label>
                            <Input id="expectedDate" type="date" />
                          </div>
                          <div>
                            <Label htmlFor="poNotes">Notes</Label>
                            <Textarea id="poNotes" placeholder="Purchase order notes..." />
                          </div>
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button variant="outline">Cancel</Button>
                          <Button>Create Purchase Order</Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Clock className="h-4 w-4 mr-2" />
                      Snooze
                    </Button>
                    <Button variant="outline" size="sm">
                      <XCircle className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* AI Forecasting Tab */}
        <TabsContent value="forecasting" className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">AI Demand Forecasting</h2>
              <p className="text-muted-foreground">
                Machine learning-powered demand predictions and inventory optimization
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Model Settings
              </Button>
              <Button size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh Forecast
              </Button>
            </div>
          </div>

          {/* Forecast Accuracy Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Forecast Accuracy</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">89.2%</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-600">+2.1%</span> from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Confidence</CardTitle>
                <Brain className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">87.5%</div>
                <p className="text-xs text-muted-foreground">High confidence predictions</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Stockout Prevention</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">94.7%</div>
                <p className="text-xs text-muted-foreground">Prevented stockouts this month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Cost Savings</CardTitle>
                <DollarSign className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">$47,392</div>
                <p className="text-xs text-muted-foreground">Optimized inventory costs</p>
              </CardContent>
            </Card>
          </div>

          {/* Demand Forecast Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LineChart className="h-5 w-5" />
                6-Month Demand Forecast
              </CardTitle>
              <CardDescription>Historical vs predicted demand with confidence intervals</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {demandForecast.map((data, index) => (
                  <div key={data.month} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-12 text-center">
                        <span className="font-medium">{data.month}</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-4">
                          {data.actual && (
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                              <span className="text-sm">Actual: {data.actual}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                            <span className="text-sm">Predicted: {data.predicted}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">{data.confidence}% confidence</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
