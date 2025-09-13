/**
 * AI Processing Main Page
 * Integrates all AI-powered features
 */

"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Brain, 
  FileText, 
  Tag, 
  TrendingUp, 
  Shield,
  Activity,
  Zap,
  BarChart3
} from 'lucide-react';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { PermissionGate } from '@/components/rbac/permission-gate';
import DocumentProcessing from '@/components/ai-processing/document-processing';
import AICategorization from '@/components/ai-processing/ai-categorization';
import AIForecasting from '@/components/ai-processing/ai-forecasting';
import AIFraudDetection from '@/components/ai-processing/ai-fraud-detection';

export default function AIProcessingPage() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <ProtectedRoute>
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">AI Processing Center</h1>
            <p className="text-muted-foreground">
              Harness the power of AI for document processing, categorization, forecasting, and fraud detection
            </p>
          </div>
          <Badge variant="outline" className="flex items-center gap-2">
            <Brain className="w-4 h-4" />
            AI Powered
          </Badge>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="categorization">Categorization</TabsTrigger>
            <TabsTrigger value="forecasting">Forecasting</TabsTrigger>
            <TabsTrigger value="fraud">Fraud Detection</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* AI Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Documents Processed</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">1,247</div>
                  <p className="text-xs text-muted-foreground">+12% from last month</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Transactions Categorized</CardTitle>
                  <Tag className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">8,934</div>
                  <p className="text-xs text-muted-foreground">+8% from last month</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Forecasts Generated</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">23</div>
                  <p className="text-xs text-muted-foreground">+3 this week</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Fraud Alerts</CardTitle>
                  <Shield className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">12</div>
                  <p className="text-xs text-muted-foreground">-2 from last week</p>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Quick Actions
                </CardTitle>
                <CardDescription>Common AI processing tasks</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <PermissionGate permission="PROCESS_DOCUMENT">
                  <button
                    onClick={() => setActiveTab('documents')}
                    className="flex items-center space-x-3 p-4 text-left border rounded-lg hover:bg-muted transition-colors"
                  >
                    <FileText className="w-6 h-6 text-blue-500" />
                    <div>
                      <div className="font-medium">Process Document</div>
                      <div className="text-sm text-muted-foreground">Upload and analyze</div>
                    </div>
                  </button>
                </PermissionGate>
                
                <PermissionGate permission="AUTO_CATEGORIZE">
                  <button
                    onClick={() => setActiveTab('categorization')}
                    className="flex items-center space-x-3 p-4 text-left border rounded-lg hover:bg-muted transition-colors"
                  >
                    <Tag className="w-6 h-6 text-green-500" />
                    <div>
                      <div className="font-medium">Auto-Categorize</div>
                      <div className="text-sm text-muted-foreground">Categorize transactions</div>
                    </div>
                  </button>
                </PermissionGate>
                
                <PermissionGate permission="GENERATE_FORECAST">
                  <button
                    onClick={() => setActiveTab('forecasting')}
                    className="flex items-center space-x-3 p-4 text-left border rounded-lg hover:bg-muted transition-colors"
                  >
                    <TrendingUp className="w-6 h-6 text-purple-500" />
                    <div>
                      <div className="font-medium">Generate Forecast</div>
                      <div className="text-sm text-muted-foreground">Create predictions</div>
                    </div>
                  </button>
                </PermissionGate>
                
                <PermissionGate permission="VIEW_FRAUD_ALERTS">
                  <button
                    onClick={() => setActiveTab('fraud')}
                    className="flex items-center space-x-3 p-4 text-left border rounded-lg hover:bg-muted transition-colors"
                  >
                    <Shield className="w-6 h-6 text-red-500" />
                    <div>
                      <div className="font-medium">Fraud Detection</div>
                      <div className="text-sm text-muted-foreground">Monitor security</div>
                    </div>
                  </button>
                </PermissionGate>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="documents">
            <PermissionGate permission="PROCESS_DOCUMENT">
              <DocumentProcessing />
            </PermissionGate>
          </TabsContent>

          <TabsContent value="categorization">
            <PermissionGate permission="AUTO_CATEGORIZE">
              <AICategorization />
            </PermissionGate>
          </TabsContent>

          <TabsContent value="forecasting">
            <PermissionGate permission="GENERATE_FORECAST">
              <AIForecasting />
            </PermissionGate>
          </TabsContent>

          <TabsContent value="fraud">
            <PermissionGate permission="VIEW_FRAUD_ALERTS">
              <AIFraudDetection />
            </PermissionGate>
          </TabsContent>
        </Tabs>
      </div>
    </ProtectedRoute>
  );
}