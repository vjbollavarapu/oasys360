/**
 * AI Processing Main Page
 * Integrates all AI-powered features
 */

"use client";

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/dashboard-layout';
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
  BarChart3,
  Loader2
} from 'lucide-react';
import { PermissionGate } from '@/components/rbac/permission-gate';
import DocumentProcessing from '@/components/ai-processing/document-processing';
import AICategorization from '@/components/ai-processing/ai-categorization';
import AIForecasting from '@/components/ai-processing/ai-forecasting';
import AIFraudDetection from '@/components/ai-processing/ai-fraud-detection';
import { aiProcessingService } from '@/lib/api-services';
import { useErrorHandler } from '@/hooks/use-error-handler';

export default function AIProcessingPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState<any>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const { withErrorHandling } = useErrorHandler();

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    await withErrorHandling(async () => {
      setIsLoadingStats(true);
      const response = await aiProcessingService.getStats();
      if (response.success && response.data) {
        setStats(response.data);
      }
    });
    setIsLoadingStats(false);
  };

  return (
    <DashboardLayout>
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
                  {isLoadingStats ? (
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  ) : (
                    <>
                      <div className="text-2xl font-bold">
                        {stats?.documents_processed || 0}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {stats?.documents_processed_period || 'Total documents'}
                      </p>
                    </>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Transactions Categorized</CardTitle>
                  <Tag className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {isLoadingStats ? (
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  ) : (
                    <>
                      <div className="text-2xl font-bold">
                        {stats?.transactions_categorized || 0}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {stats?.categorization_accuracy ? `${stats.categorization_accuracy}% accuracy` : 'Auto-categorized'}
                      </p>
                    </>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {isLoadingStats ? (
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  ) : (
                    <>
                      <div className="text-2xl font-bold">
                        {stats?.active_jobs || 0}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {stats?.jobs_completed_period || 'Currently processing'}
                      </p>
                    </>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {isLoadingStats ? (
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  ) : (
                    <>
                      <div className="text-2xl font-bold">
                        {stats?.success_rate ? `${stats.success_rate}%` : 'N/A'}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Processing accuracy
                      </p>
                    </>
                  )}
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
    </DashboardLayout>
  );
}

