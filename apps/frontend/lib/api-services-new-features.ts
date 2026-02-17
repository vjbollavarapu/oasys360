/**
 * API Services for New Features
 * Tax Optimization, Treasury, FX Conversion, Vendor Verification, ERP, Gnosis Safe, Coinbase Prime
 */

import { BaseApiService } from './api-service-base';
import { ApiResponse, PaginatedResponse } from './api-client';
import { API_CONFIG } from './api-config';

// ============================================================================
// Tax Optimization Service
// ============================================================================

export class TaxOptimizationService extends BaseApiService {
  // Tax Events
  async getTaxEvents(params?: {
    page?: number;
    limit?: number;
    taxYear?: number;
    eventType?: string;
  }): Promise<ApiResponse<PaginatedResponse<any>>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.taxYear) queryParams.append('tax_year', params.taxYear.toString());
    if (params?.eventType) queryParams.append('event_type', params.eventType);

    const endpoint = `${API_CONFIG.ENDPOINTS.TAX_OPTIMIZATION.EVENTS.LIST}?${queryParams.toString()}`;
    return this.get(endpoint);
  }

  async getTaxEvent(id: string): Promise<ApiResponse> {
    return this.get(API_CONFIG.ENDPOINTS.TAX_OPTIMIZATION.EVENTS.DETAIL(id));
  }

  async createTaxEvent(data: any): Promise<ApiResponse> {
    return this.post(API_CONFIG.ENDPOINTS.TAX_OPTIMIZATION.EVENTS.CREATE, data);
  }

  async updateTaxEvent(id: string, data: any): Promise<ApiResponse> {
    return this.put(API_CONFIG.ENDPOINTS.TAX_OPTIMIZATION.EVENTS.UPDATE(id), data);
  }

  async deleteTaxEvent(id: string): Promise<ApiResponse> {
    return this.delete(API_CONFIG.ENDPOINTS.TAX_OPTIMIZATION.EVENTS.DELETE(id));
  }

  async detectTaxEvents(data: { startDate: string; endDate: string }): Promise<ApiResponse> {
    return this.post(API_CONFIG.ENDPOINTS.TAX_OPTIMIZATION.EVENTS.DETECT, data);
  }

  // Tax Strategies
  async getTaxStrategies(params?: {
    page?: number;
    limit?: number;
    taxYear?: number;
    status?: string;
  }): Promise<ApiResponse<PaginatedResponse<any>>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.taxYear) queryParams.append('tax_year', params.taxYear.toString());
    if (params?.status) queryParams.append('status', params.status);

    const endpoint = `${API_CONFIG.ENDPOINTS.TAX_OPTIMIZATION.STRATEGIES.LIST}?${queryParams.toString()}`;
    return this.get(endpoint);
  }

  async getTaxStrategy(id: string): Promise<ApiResponse> {
    return this.get(API_CONFIG.ENDPOINTS.TAX_OPTIMIZATION.STRATEGIES.DETAIL(id));
  }

  async createTaxStrategy(data: any): Promise<ApiResponse> {
    return this.post(API_CONFIG.ENDPOINTS.TAX_OPTIMIZATION.STRATEGIES.CREATE, data);
  }

  async updateTaxStrategy(id: string, data: any): Promise<ApiResponse> {
    return this.put(API_CONFIG.ENDPOINTS.TAX_OPTIMIZATION.STRATEGIES.UPDATE(id), data);
  }

  async approveTaxStrategy(id: string): Promise<ApiResponse> {
    return this.post(API_CONFIG.ENDPOINTS.TAX_OPTIMIZATION.STRATEGIES.APPROVE(id));
  }

  async generateTaxStrategies(data: { taxYear: number }): Promise<ApiResponse> {
    return this.post(API_CONFIG.ENDPOINTS.TAX_OPTIMIZATION.STRATEGIES.GENERATE, data);
  }

  // Year Summaries
  async getYearSummaries(params?: {
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<PaginatedResponse<any>>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const endpoint = `${API_CONFIG.ENDPOINTS.TAX_OPTIMIZATION.YEAR_SUMMARIES.LIST}?${queryParams.toString()}`;
    return this.get(endpoint);
  }

  async getYearSummary(id: string): Promise<ApiResponse> {
    return this.get(API_CONFIG.ENDPOINTS.TAX_OPTIMIZATION.YEAR_SUMMARIES.DETAIL(id));
  }

  async calculateYearSummary(taxYear: number): Promise<ApiResponse> {
    return this.post(API_CONFIG.ENDPOINTS.TAX_OPTIMIZATION.YEAR_SUMMARIES.CALCULATE(taxYear));
  }

  // Tax Alerts
  async getTaxAlerts(params?: {
    page?: number;
    limit?: number;
    isRead?: boolean;
  }): Promise<ApiResponse<PaginatedResponse<any>>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.isRead !== undefined) queryParams.append('is_read', params.isRead.toString());

    const endpoint = `${API_CONFIG.ENDPOINTS.TAX_OPTIMIZATION.ALERTS.LIST}?${queryParams.toString()}`;
    return this.get(endpoint);
  }

  async markAlertAsRead(id: string): Promise<ApiResponse> {
    return this.post(API_CONFIG.ENDPOINTS.TAX_OPTIMIZATION.ALERTS.MARK_READ(id));
  }

  async dismissAlert(id: string): Promise<ApiResponse> {
    return this.post(API_CONFIG.ENDPOINTS.TAX_OPTIMIZATION.ALERTS.DISMISS(id));
  }

  async generateAlerts(): Promise<ApiResponse> {
    return this.post(API_CONFIG.ENDPOINTS.TAX_OPTIMIZATION.ALERTS.GENERATE);
  }

  // Settings
  async getTaxSettings(): Promise<ApiResponse> {
    return this.get(API_CONFIG.ENDPOINTS.TAX_OPTIMIZATION.SETTINGS.GET);
  }

  async updateTaxSettings(data: any): Promise<ApiResponse> {
    return this.put(API_CONFIG.ENDPOINTS.TAX_OPTIMIZATION.SETTINGS.UPDATE, data);
  }

  // Stats
  async getTaxStats(): Promise<ApiResponse> {
    return this.get(API_CONFIG.ENDPOINTS.TAX_OPTIMIZATION.STATS);
  }
}

// ============================================================================
// Treasury Service
// ============================================================================

export class TreasuryService extends BaseApiService {
  async getUnifiedBalances(params?: {
    includeHistorical?: boolean;
  }): Promise<ApiResponse> {
    const queryParams = new URLSearchParams();
    if (params?.includeHistorical) queryParams.append('include_historical', 'true');

    const endpoint = `${API_CONFIG.ENDPOINTS.TREASURY.UNIFIED}?${queryParams.toString()}`;
    return this.get(endpoint);
  }

  async getHistoricalBalances(params?: {
    startDate?: string;
    endDate?: string;
    interval?: string;
  }): Promise<ApiResponse> {
    const queryParams = new URLSearchParams();
    if (params?.startDate) queryParams.append('start_date', params.startDate);
    if (params?.endDate) queryParams.append('end_date', params.endDate);
    if (params?.interval) queryParams.append('interval', params.interval);

    const endpoint = `${API_CONFIG.ENDPOINTS.TREASURY.HISTORICAL}?${queryParams.toString()}`;
    return this.get(endpoint);
  }

  async getRunway(params?: {
    burnRate?: number;
  }): Promise<ApiResponse> {
    const queryParams = new URLSearchParams();
    if (params?.burnRate) queryParams.append('burn_rate', params.burnRate.toString());

    const endpoint = `${API_CONFIG.ENDPOINTS.TREASURY.RUNWAY}?${queryParams.toString()}`;
    return this.get(endpoint);
  }
}

// ============================================================================
// FX Conversion Service
// ============================================================================

export class FxConversionService extends BaseApiService {
  async getExchangeRate(fromCurrency: string, toCurrency: string): Promise<ApiResponse> {
    const queryParams = new URLSearchParams();
    queryParams.append('from', fromCurrency);
    queryParams.append('to', toCurrency);

    const endpoint = `${API_CONFIG.ENDPOINTS.FX_CONVERSION.RATE}?${queryParams.toString()}`;
    return this.get(endpoint);
  }

  async convertCurrency(data: {
    fromCurrency: string;
    toCurrency: string;
    amount: number;
  }): Promise<ApiResponse> {
    return this.post(API_CONFIG.ENDPOINTS.FX_CONVERSION.CONVERT, data);
  }

  async getSupportedCurrencies(): Promise<ApiResponse> {
    return this.get(API_CONFIG.ENDPOINTS.FX_CONVERSION.CURRENCIES);
  }

  async getRates(params?: {
    baseCurrency?: string;
    targetCurrencies?: string[];
  }): Promise<ApiResponse> {
    const queryParams = new URLSearchParams();
    if (params?.baseCurrency) queryParams.append('base', params.baseCurrency);
    if (params?.targetCurrencies) queryParams.append('targets', params.targetCurrencies.join(','));

    const endpoint = `${API_CONFIG.ENDPOINTS.FX_CONVERSION.RATES.LIST}?${queryParams.toString()}`;
    return this.get(endpoint);
  }

  async updateRates(): Promise<ApiResponse> {
    return this.post(API_CONFIG.ENDPOINTS.FX_CONVERSION.RATES.UPDATE);
  }

  async getConversionHistory(params?: {
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<PaginatedResponse<any>>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const endpoint = `${API_CONFIG.ENDPOINTS.FX_CONVERSION.CONVERSIONS.LIST}?${queryParams.toString()}`;
    return this.get(endpoint);
  }

  async getFxConfig(): Promise<ApiResponse> {
    return this.get(API_CONFIG.ENDPOINTS.FX_CONVERSION.CONFIG);
  }
}

// ============================================================================
// Vendor Verification Service
// ============================================================================

export class VendorVerificationService extends BaseApiService {
  async verifyWallet(supplierId: string, data: {
    walletAddress: string;
    network: string;
  }): Promise<ApiResponse> {
    return this.post(API_CONFIG.ENDPOINTS.VENDOR_VERIFICATION.VERIFY_WALLET(supplierId), data);
  }

  async registerWallet(supplierId: string, data: {
    walletAddress: string;
    network: string;
  }): Promise<ApiResponse> {
    return this.post(API_CONFIG.ENDPOINTS.VENDOR_VERIFICATION.REGISTER_WALLET(supplierId), data);
  }

  async getVendorWallets(params?: {
    page?: number;
    limit?: number;
    supplierId?: string;
    status?: string;
  }): Promise<ApiResponse<PaginatedResponse<any>>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.supplierId) queryParams.append('supplier_id', params.supplierId);
    if (params?.status) queryParams.append('status', params.status);

    const endpoint = `${API_CONFIG.ENDPOINTS.VENDOR_VERIFICATION.WALLETS.LIST}?${queryParams.toString()}`;
    return this.get(endpoint);
  }

  async createVendorWallet(data: any): Promise<ApiResponse> {
    return this.post(API_CONFIG.ENDPOINTS.VENDOR_VERIFICATION.WALLETS.CREATE, data);
  }

  async getVendorWallet(id: string): Promise<ApiResponse> {
    return this.get(API_CONFIG.ENDPOINTS.VENDOR_VERIFICATION.WALLETS.DETAIL(id));
  }

  async updateVendorWallet(id: string, data: any): Promise<ApiResponse> {
    return this.put(API_CONFIG.ENDPOINTS.VENDOR_VERIFICATION.WALLETS.UPDATE(id), data);
  }

  async verifyVendorWallet(id: string): Promise<ApiResponse> {
    return this.post(API_CONFIG.ENDPOINTS.VENDOR_VERIFICATION.WALLETS.VERIFY(id));
  }

  async checkPaymentBeforeProcessing(data: {
    supplierId: string;
    amount: number;
    currency: string;
  }): Promise<ApiResponse> {
    return this.post(API_CONFIG.ENDPOINTS.VENDOR_VERIFICATION.CHECK_PAYMENT, data);
  }

  async getVerificationLogs(params?: {
    page?: number;
    limit?: number;
    supplierId?: string;
  }): Promise<ApiResponse<PaginatedResponse<any>>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.supplierId) queryParams.append('supplier_id', params.supplierId);

    const endpoint = `${API_CONFIG.ENDPOINTS.VENDOR_VERIFICATION.VERIFICATION_LOGS.LIST}?${queryParams.toString()}`;
    return this.get(endpoint);
  }

  async getPaymentBlocks(params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<ApiResponse<PaginatedResponse<any>>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.status) queryParams.append('status', params.status);

    const endpoint = `${API_CONFIG.ENDPOINTS.VENDOR_VERIFICATION.PAYMENT_BLOCKS.LIST}?${queryParams.toString()}`;
    return this.get(endpoint);
  }

  async getPaymentBlock(id: string): Promise<ApiResponse> {
    return this.get(API_CONFIG.ENDPOINTS.VENDOR_VERIFICATION.PAYMENT_BLOCKS.DETAIL(id));
  }

  async resolvePaymentBlock(id: string, data: {
    action: string;
    reason?: string;
  }): Promise<ApiResponse> {
    return this.post(API_CONFIG.ENDPOINTS.VENDOR_VERIFICATION.PAYMENT_BLOCKS.RESOLVE(id), data);
  }
}

// ============================================================================
// ERP Integration Service
// ============================================================================

export class ErpIntegrationService extends BaseApiService {
  // Note: Backend doesn't have ERP integration endpoints yet - return empty results without making API calls
  async getErpConnections(params?: {
    page?: number;
    limit?: number;
    provider?: string;
  }): Promise<ApiResponse<PaginatedResponse<any>>> {
    // Return empty response without making API call to avoid 404 errors
    return Promise.resolve({
      success: true,
      data: { results: [], count: 0, next: null, previous: null },
      status: 200,
    } as ApiResponse<PaginatedResponse<any>>);
  }

  async createErpConnection(data: {
    provider: string;
    name: string;
    config: any;
  }): Promise<ApiResponse> {
    // Backend doesn't have this endpoint yet
    console.warn('ERP connection creation not yet implemented in backend');
    return Promise.resolve({
      success: false,
      message: 'ERP integration not yet implemented in backend',
      status: 501,
    } as ApiResponse);
  }

  async getErpConnection(id: string): Promise<ApiResponse> {
    // Backend doesn't have this endpoint yet
    return Promise.resolve({
      success: true,
      data: null,
      status: 200,
    } as ApiResponse);
  }

  async updateErpConnection(id: string, data: any): Promise<ApiResponse> {
    // Backend doesn't have this endpoint yet
    console.warn('ERP connection update not yet implemented in backend');
    return Promise.resolve({
      success: false,
      message: 'ERP integration not yet implemented in backend',
      status: 501,
    } as ApiResponse);
  }

  async deleteErpConnection(id: string): Promise<ApiResponse> {
    // Backend doesn't have this endpoint yet
    console.warn('ERP connection deletion not yet implemented in backend');
    return Promise.resolve({
      success: false,
      message: 'ERP integration not yet implemented in backend',
      status: 501,
    } as ApiResponse);
  }

  async syncErpConnection(id: string, data?: {
    syncType?: string;
    entities?: string[];
  }): Promise<ApiResponse> {
    // Backend doesn't have this endpoint yet
    console.warn('ERP connection sync not yet implemented in backend');
    return Promise.resolve({
      success: false,
      message: 'ERP integration not yet implemented in backend',
      status: 501,
    } as ApiResponse);
  }

  async getSyncLogs(params?: {
    page?: number;
    limit?: number;
    connectionId?: string;
  }): Promise<ApiResponse<PaginatedResponse<any>>> {
    // Return empty response without making API call to avoid 404 errors
    return Promise.resolve({
      success: true,
      data: { results: [], count: 0, next: null, previous: null },
      status: 200,
    } as ApiResponse<PaginatedResponse<any>>);
  }

  async getSyncLog(id: string): Promise<ApiResponse> {
    // Backend doesn't have this endpoint yet
    return Promise.resolve({
      success: true,
      data: null,
      status: 200,
    } as ApiResponse);
  }

  async getMappings(params?: {
    page?: number;
    limit?: number;
    connectionId?: string;
  }): Promise<ApiResponse<PaginatedResponse<any>>> {
    // Return empty response without making API call to avoid 404 errors
    return Promise.resolve({
      success: true,
      data: { results: [], count: 0, next: null, previous: null },
      status: 200,
    } as ApiResponse<PaginatedResponse<any>>);
  }

  async createMapping(data: any): Promise<ApiResponse> {
    // Backend doesn't have this endpoint yet
    console.warn('ERP mapping creation not yet implemented in backend');
    return Promise.resolve({
      success: false,
      message: 'ERP integration not yet implemented in backend',
      status: 501,
    } as ApiResponse);
  }

  async deleteMapping(id: string): Promise<ApiResponse> {
    // Backend doesn't have this endpoint yet
    console.warn('ERP mapping deletion not yet implemented in backend');
    return Promise.resolve({
      success: false,
      message: 'ERP integration not yet implemented in backend',
      status: 501,
    } as ApiResponse);
  }
}

// ============================================================================
// Gnosis Safe Service
// ============================================================================

export class GnosisSafeService extends BaseApiService {
  async getSafes(params?: {
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<PaginatedResponse<any>>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const endpoint = `${API_CONFIG.ENDPOINTS.GNOSIS_SAFE.SAFES.LIST}?${queryParams.toString()}`;
    return this.get(endpoint);
  }

  async createSafe(data: {
    address: string;
    network: string;
    threshold: number;
    owners: string[];
  }): Promise<ApiResponse> {
    return this.post(API_CONFIG.ENDPOINTS.GNOSIS_SAFE.SAFES.CREATE, data);
  }

  async getSafe(id: string): Promise<ApiResponse> {
    return this.get(API_CONFIG.ENDPOINTS.GNOSIS_SAFE.SAFES.DETAIL(id));
  }

  async updateSafe(id: string, data: any): Promise<ApiResponse> {
    return this.put(API_CONFIG.ENDPOINTS.GNOSIS_SAFE.SAFES.UPDATE(id), data);
  }

  async getTransactions(safeId: string, params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<ApiResponse<PaginatedResponse<any>>> {
    const queryParams = new URLSearchParams();
    queryParams.append('safe_id', safeId);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.status) queryParams.append('status', params.status);

    const endpoint = `${API_CONFIG.ENDPOINTS.GNOSIS_SAFE.TRANSACTIONS.LIST}?${queryParams.toString()}`;
    return this.get(endpoint);
  }

  async createTransaction(data: {
    safeId: string;
    to: string;
    value: string;
    data?: string;
  }): Promise<ApiResponse> {
    return this.post(API_CONFIG.ENDPOINTS.GNOSIS_SAFE.TRANSACTIONS.CREATE, data);
  }

  async getTransaction(id: string): Promise<ApiResponse> {
    return this.get(API_CONFIG.ENDPOINTS.GNOSIS_SAFE.TRANSACTIONS.DETAIL(id));
  }

  async confirmTransaction(id: string): Promise<ApiResponse> {
    return this.post(API_CONFIG.ENDPOINTS.GNOSIS_SAFE.TRANSACTIONS.CONFIRM(id));
  }

  async executeTransaction(id: string): Promise<ApiResponse> {
    return this.post(API_CONFIG.ENDPOINTS.GNOSIS_SAFE.TRANSACTIONS.EXECUTE(id));
  }

  async getOwners(safeId: string): Promise<ApiResponse> {
    return this.get(API_CONFIG.ENDPOINTS.GNOSIS_SAFE.OWNERS.LIST(safeId));
  }

  async addOwner(safeId: string, data: {
    address: string;
  }): Promise<ApiResponse> {
    return this.post(API_CONFIG.ENDPOINTS.GNOSIS_SAFE.OWNERS.ADD(safeId), data);
  }

  async removeOwner(safeId: string, ownerId: string): Promise<ApiResponse> {
    return this.delete(API_CONFIG.ENDPOINTS.GNOSIS_SAFE.OWNERS.REMOVE(safeId, ownerId));
  }
}

// ============================================================================
// Coinbase Prime Service
// ============================================================================

export class CoinbasePrimeService extends BaseApiService {
  async getConnections(params?: {
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<PaginatedResponse<any>>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const endpoint = `${API_CONFIG.ENDPOINTS.COINBASE_PRIME.CONNECTIONS.LIST}?${queryParams.toString()}`;
    return this.get(endpoint);
  }

  async createConnection(data: {
    apiKey: string;
    apiSecret: string;
    passphrase: string;
    sandbox?: boolean;
  }): Promise<ApiResponse> {
    return this.post(API_CONFIG.ENDPOINTS.COINBASE_PRIME.CONNECTIONS.CREATE, data);
  }

  async getConnection(id: string): Promise<ApiResponse> {
    return this.get(API_CONFIG.ENDPOINTS.COINBASE_PRIME.CONNECTIONS.DETAIL(id));
  }

  async updateConnection(id: string, data: any): Promise<ApiResponse> {
    return this.put(API_CONFIG.ENDPOINTS.COINBASE_PRIME.CONNECTIONS.UPDATE(id), data);
  }

  async deleteConnection(id: string): Promise<ApiResponse> {
    return this.delete(API_CONFIG.ENDPOINTS.COINBASE_PRIME.CONNECTIONS.DELETE(id));
  }

  async getAccounts(params?: {
    page?: number;
    limit?: number;
    connectionId?: string;
  }): Promise<ApiResponse<PaginatedResponse<any>>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.connectionId) queryParams.append('connection_id', params.connectionId);

    const endpoint = `${API_CONFIG.ENDPOINTS.COINBASE_PRIME.ACCOUNTS.LIST}?${queryParams.toString()}`;
    return this.get(endpoint);
  }

  async getAccount(id: string): Promise<ApiResponse> {
    return this.get(API_CONFIG.ENDPOINTS.COINBASE_PRIME.ACCOUNTS.DETAIL(id));
  }

  async getOrders(params?: {
    page?: number;
    limit?: number;
    connectionId?: string;
    status?: string;
  }): Promise<ApiResponse<PaginatedResponse<any>>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.connectionId) queryParams.append('connection_id', params.connectionId);
    if (params?.status) queryParams.append('status', params.status);

    const endpoint = `${API_CONFIG.ENDPOINTS.COINBASE_PRIME.ORDERS.LIST}?${queryParams.toString()}`;
    return this.get(endpoint);
  }

  async createOrder(data: {
    connectionId: string;
    productId: string;
    side: 'buy' | 'sell';
    orderType: string;
    size?: number;
    price?: number;
  }): Promise<ApiResponse> {
    return this.post(API_CONFIG.ENDPOINTS.COINBASE_PRIME.ORDERS.CREATE, data);
  }

  async getOrder(id: string): Promise<ApiResponse> {
    return this.get(API_CONFIG.ENDPOINTS.COINBASE_PRIME.ORDERS.DETAIL(id));
  }

  async getOrderStatus(id: string): Promise<ApiResponse> {
    return this.get(API_CONFIG.ENDPOINTS.COINBASE_PRIME.ORDERS.STATUS(id));
  }
}

