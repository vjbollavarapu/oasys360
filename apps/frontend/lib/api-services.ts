/**
 * API Services for OASYS Platform
 * High-level service layer that combines API client, transformers, and error handling
 */

import { ApiResponse, PaginatedResponse } from './api-client';
import { BaseApiService } from './api-service-base';
import API_CONFIG from './api-config';

// Authentication Service
export class AuthService extends BaseApiService {
  async login(email: string, password: string): Promise<ApiResponse> {
    return this.post(API_CONFIG.ENDPOINTS.AUTH.LOGIN, { email, password });
  }

  async logout(): Promise<void> {
    await this.client.logout();
  }

  async register(userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    companyName?: string;
  }): Promise<ApiResponse> {
    return this.post(API_CONFIG.ENDPOINTS.AUTH.REGISTER, userData, {
      transformConfig: 'USER',
    });
  }

  async getCurrentUser(): Promise<ApiResponse> {
    return this.get(API_CONFIG.ENDPOINTS.AUTH.ME, {
      transformConfig: 'USER',
    });
  }

  async refreshToken(): Promise<ApiResponse> {
    return this.post(API_CONFIG.ENDPOINTS.AUTH.REFRESH);
  }

  async forgotPassword(email: string): Promise<ApiResponse> {
    return this.post(API_CONFIG.ENDPOINTS.AUTH.FORGOT_PASSWORD, { email });
  }

  async resetPassword(token: string, newPassword: string): Promise<ApiResponse> {
    return this.post(API_CONFIG.ENDPOINTS.AUTH.RESET_PASSWORD, { token, newPassword });
  }

  async verifyEmail(token: string): Promise<ApiResponse> {
    return this.post(API_CONFIG.ENDPOINTS.AUTH.VERIFY_EMAIL, { token });
  }
}

// User Service
export class UserService extends BaseApiService {
  async getUsers(params?: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
  }): Promise<ApiResponse<PaginatedResponse<any>>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.role) queryParams.append('role', params.role);

    const endpoint = `${API_CONFIG.ENDPOINTS.USERS.LIST}?${queryParams.toString()}`;
    return this.get(endpoint, { transformConfig: 'USER' });
  }

  async getUser(id: string): Promise<ApiResponse> {
    return this.get(API_CONFIG.ENDPOINTS.USERS.DETAIL(id), {
      transformConfig: 'USER',
    });
  }

  async createUser(userData: any): Promise<ApiResponse> {
    return this.post(API_CONFIG.ENDPOINTS.USERS.CREATE, userData, {
      transformConfig: 'USER',
    });
  }

  async updateUser(id: string, userData: any): Promise<ApiResponse> {
    return this.put(API_CONFIG.ENDPOINTS.USERS.UPDATE(id), userData, {
      transformConfig: 'USER',
    });
  }

  async deleteUser(id: string): Promise<ApiResponse> {
    return this.delete(API_CONFIG.ENDPOINTS.USERS.DELETE(id));
  }

  async getUserProfile(): Promise<ApiResponse> {
    return this.get(API_CONFIG.ENDPOINTS.USERS.PROFILE, {
      transformConfig: 'USER',
    });
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<ApiResponse> {
    return this.post(API_CONFIG.ENDPOINTS.USERS.CHANGE_PASSWORD, {
      currentPassword,
      newPassword,
    });
  }

  async getUserPreferences(userId: string): Promise<ApiResponse> {
    return this.get(API_CONFIG.ENDPOINTS.USERS.PREFERENCES(userId), {
      transformConfig: 'USER',
    });
  }

  async updateUserPreferences(userId: string, preferences: any): Promise<ApiResponse> {
    return this.put(API_CONFIG.ENDPOINTS.USERS.PREFERENCES(userId), preferences, {
      transformConfig: 'USER',
    });
  }

  async loginWithWeb3(web3Data: {
    walletAddress: string;
    signature: string;
    message: string;
  }): Promise<ApiResponse> {
    return this.post(API_CONFIG.ENDPOINTS.AUTH.WEB3_LOGIN, web3Data);
  }

  async loginWithSSO(ssoData: {
    token: string;
    provider: string;
  }): Promise<ApiResponse> {
    return this.post(API_CONFIG.ENDPOINTS.AUTH.SSO_LOGIN, ssoData);
  }

  async loginWithMFA(mfaData: {
    email: string;
    password: string;
    mfaCode: string;
    mfaType: string;
  }): Promise<ApiResponse> {
    return this.post(API_CONFIG.ENDPOINTS.AUTH.MFA_LOGIN, mfaData);
  }
}

// Tenant Service
export class TenantService extends BaseApiService {
  async getTenants(): Promise<ApiResponse<PaginatedResponse<any>>> {
    return this.get(API_CONFIG.ENDPOINTS.TENANTS.LIST);
  }

  async getTenant(id: string): Promise<ApiResponse> {
    return this.get(API_CONFIG.ENDPOINTS.TENANTS.DETAIL(id));
  }

  async createTenant(tenantData: {
    name: string;
    domain: string;
    plan: string;
    settings?: any;
  }): Promise<ApiResponse> {
    return this.post(API_CONFIG.ENDPOINTS.TENANTS.CREATE, tenantData);
  }

  async updateTenant(id: string, tenantData: any): Promise<ApiResponse> {
    return this.put(API_CONFIG.ENDPOINTS.TENANTS.UPDATE(id), tenantData);
  }

  async deleteTenant(id: string): Promise<ApiResponse> {
    return this.delete(API_CONFIG.ENDPOINTS.TENANTS.DELETE(id));
  }

  async switchTenant(id: string): Promise<ApiResponse> {
    return this.post(API_CONFIG.ENDPOINTS.TENANTS.SWITCH(id));
  }

  async getTenantUsers(id: string): Promise<ApiResponse<PaginatedResponse<any>>> {
    return this.get(API_CONFIG.ENDPOINTS.TENANTS.USERS(id), {
      transformConfig: 'USER',
    });
  }
}

// Accounting Service
export class AccountingService extends BaseApiService {
  // Chart of Accounts
  async getAccounts(params?: {
    page?: number;
    limit?: number;
    search?: string;
    type?: string;
  }): Promise<ApiResponse<PaginatedResponse<any>>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.type) queryParams.append('type', params.type);

    const endpoint = `${API_CONFIG.ENDPOINTS.ACCOUNTING.CHART_OF_ACCOUNTS.LIST}?${queryParams.toString()}`;
    return this.get(endpoint);
  }

  // Alias for getAccounts - backward compatibility
  async getChartOfAccounts(params?: {
    page?: number;
    limit?: number;
    search?: string;
    type?: string;
  }): Promise<ApiResponse<PaginatedResponse<any>>> {
    return this.getAccounts(params);
  }

  async getAccount(id: string): Promise<ApiResponse> {
    return this.get(API_CONFIG.ENDPOINTS.ACCOUNTING.CHART_OF_ACCOUNTS.DETAIL(id));
  }

  async createAccount(accountData: any): Promise<ApiResponse> {
    return this.post(API_CONFIG.ENDPOINTS.ACCOUNTING.CHART_OF_ACCOUNTS.CREATE, accountData);
  }

  async updateAccount(id: string, accountData: any): Promise<ApiResponse> {
    return this.put(API_CONFIG.ENDPOINTS.ACCOUNTING.CHART_OF_ACCOUNTS.UPDATE(id), accountData);
  }

  async deleteAccount(id: string): Promise<ApiResponse> {
    return this.delete(API_CONFIG.ENDPOINTS.ACCOUNTING.CHART_OF_ACCOUNTS.DELETE(id));
  }

  async getAccountBalance(id: string): Promise<ApiResponse> {
    return this.get(API_CONFIG.ENDPOINTS.ACCOUNTING.CHART_OF_ACCOUNTS.BALANCE(id));
  }

  // Journal Entries
  async getJournalEntries(params?: {
    page?: number;
    limit?: number;
    search?: string;
    dateFrom?: string;
    dateTo?: string;
  }): Promise<ApiResponse<PaginatedResponse<any>>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.dateFrom) queryParams.append('date_from', params.dateFrom);
    if (params?.dateTo) queryParams.append('date_to', params.dateTo);

    const endpoint = `${API_CONFIG.ENDPOINTS.ACCOUNTING.JOURNAL_ENTRIES.LIST}?${queryParams.toString()}`;
    return this.get(endpoint);
  }

  async getJournalEntry(id: string): Promise<ApiResponse> {
    return this.get(API_CONFIG.ENDPOINTS.ACCOUNTING.JOURNAL_ENTRIES.DETAIL(id));
  }

  async createJournalEntry(entryData: any): Promise<ApiResponse> {
    return this.post(API_CONFIG.ENDPOINTS.ACCOUNTING.JOURNAL_ENTRIES.CREATE, entryData);
  }

  async updateJournalEntry(id: string, entryData: any): Promise<ApiResponse> {
    return this.put(API_CONFIG.ENDPOINTS.ACCOUNTING.JOURNAL_ENTRIES.UPDATE(id), entryData);
  }

  async deleteJournalEntry(id: string): Promise<ApiResponse> {
    return this.delete(API_CONFIG.ENDPOINTS.ACCOUNTING.JOURNAL_ENTRIES.DELETE(id));
  }

  async postJournalEntry(id: string): Promise<ApiResponse> {
    return this.post(API_CONFIG.ENDPOINTS.ACCOUNTING.JOURNAL_ENTRIES.POST(id));
  }

  async unpostJournalEntry(id: string): Promise<ApiResponse> {
    return this.post(API_CONFIG.ENDPOINTS.ACCOUNTING.JOURNAL_ENTRIES.UNPOST(id));
  }

  // Reports
  async getTrialBalance(params?: {
    date?: string;
    format?: 'json' | 'pdf' | 'excel';
  }): Promise<ApiResponse> {
    const queryParams = new URLSearchParams();
    if (params?.date) queryParams.append('date', params.date);
    if (params?.format) queryParams.append('format', params.format);

    const endpoint = `${API_CONFIG.ENDPOINTS.ACCOUNTING.REPORTS.TRIAL_BALANCE}?${queryParams.toString()}`;
    return this.get(endpoint);
  }

  async getProfitLoss(params?: {
    dateFrom?: string;
    dateTo?: string;
    format?: 'json' | 'pdf' | 'excel';
  }): Promise<ApiResponse> {
    const queryParams = new URLSearchParams();
    if (params?.dateFrom) queryParams.append('date_from', params.dateFrom);
    if (params?.dateTo) queryParams.append('date_to', params.dateTo);
    if (params?.format) queryParams.append('format', params.format);

    const endpoint = `${API_CONFIG.ENDPOINTS.ACCOUNTING.REPORTS.PROFIT_LOSS}?${queryParams.toString()}`;
    return this.get(endpoint);
  }

  async getBalanceSheet(params?: {
    date?: string;
    format?: 'json' | 'pdf' | 'excel';
  }): Promise<ApiResponse> {
    const queryParams = new URLSearchParams();
    if (params?.date) queryParams.append('date', params.date);
    if (params?.format) queryParams.append('format', params.format);

    const endpoint = `${API_CONFIG.ENDPOINTS.ACCOUNTING.REPORTS.BALANCE_SHEET}?${queryParams.toString()}`;
    return this.get(endpoint);
  }

  async getCashFlow(params?: {
    dateFrom?: string;
    dateTo?: string;
    format?: 'json' | 'pdf' | 'excel';
  }): Promise<ApiResponse> {
    const queryParams = new URLSearchParams();
    if (params?.dateFrom) queryParams.append('date_from', params.dateFrom);
    if (params?.dateTo) queryParams.append('date_to', params.dateTo);
    if (params?.format) queryParams.append('format', params.format);

    const endpoint = `${API_CONFIG.ENDPOINTS.ACCOUNTING.REPORTS.CASH_FLOW}?${queryParams.toString()}`;
    return this.get(endpoint);
  }
}

// Invoicing Service
export class InvoicingService extends BaseApiService {
  // Invoices
  async getInvoices(params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    customerId?: string;
  }): Promise<ApiResponse<PaginatedResponse<any>>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.customerId) queryParams.append('customer_id', params.customerId);

    const endpoint = `${API_CONFIG.ENDPOINTS.INVOICING.INVOICES.LIST}?${queryParams.toString()}`;
    return this.get(endpoint, { transformConfig: 'INVOICE' });
  }

  async getInvoice(id: string): Promise<ApiResponse> {
    return this.get(API_CONFIG.ENDPOINTS.INVOICING.INVOICES.DETAIL(id), {
      transformConfig: 'INVOICE',
    });
  }

  async createInvoice(invoiceData: any): Promise<ApiResponse> {
    return this.post(API_CONFIG.ENDPOINTS.INVOICING.INVOICES.CREATE, invoiceData, {
      transformConfig: 'INVOICE',
    });
  }

  async updateInvoice(id: string, invoiceData: any): Promise<ApiResponse> {
    return this.put(API_CONFIG.ENDPOINTS.INVOICING.INVOICES.UPDATE(id), invoiceData, {
      transformConfig: 'INVOICE',
    });
  }

  async deleteInvoice(id: string): Promise<ApiResponse> {
    return this.delete(API_CONFIG.ENDPOINTS.INVOICING.INVOICES.DELETE(id));
  }

  async sendInvoice(id: string): Promise<ApiResponse> {
    return this.post(API_CONFIG.ENDPOINTS.INVOICING.INVOICES.SEND(id));
  }

  async markInvoicePaid(id: string): Promise<ApiResponse> {
    return this.post(API_CONFIG.ENDPOINTS.INVOICING.INVOICES.MARK_PAID(id));
  }

  async downloadInvoice(id: string): Promise<Blob> {
    const response = await this.client.get<Blob>(API_CONFIG.ENDPOINTS.INVOICING.INVOICES.DOWNLOAD(id), {
      responseType: 'blob',
    });
    return response.data as Blob;
  }

  // Customers (from sales app)
  async getCustomers(params?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<ApiResponse<PaginatedResponse<any>>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);

    // Customers are in the sales app, not invoicing app
    const endpoint = `${API_CONFIG.ENDPOINTS.SALES.CUSTOMERS.LIST}?${queryParams.toString()}`;
    return this.get(endpoint);
  }

  async getCustomer(id: string): Promise<ApiResponse> {
    return this.get(API_CONFIG.ENDPOINTS.SALES.CUSTOMERS.DETAIL(id));
  }

  async createCustomer(customerData: any): Promise<ApiResponse> {
    return this.post(API_CONFIG.ENDPOINTS.SALES.CUSTOMERS.CREATE, customerData);
  }

  async updateCustomer(id: string, customerData: any): Promise<ApiResponse> {
    return this.put(API_CONFIG.ENDPOINTS.SALES.CUSTOMERS.UPDATE(id), customerData);
  }

  async deleteCustomer(id: string): Promise<ApiResponse> {
    return this.delete(API_CONFIG.ENDPOINTS.SALES.CUSTOMERS.DELETE(id));
  }

  // E-Invoice (LHDN) Settings
  async getEInvoiceSettings(): Promise<ApiResponse> {
    return this.get(API_CONFIG.ENDPOINTS.INVOICING.E_INVOICE.SETTINGS.LIST);
  }

  async getEInvoiceSetting(id: string): Promise<ApiResponse> {
    return this.get(API_CONFIG.ENDPOINTS.INVOICING.E_INVOICE.SETTINGS.DETAIL(id));
  }

  async createEInvoiceSetting(settingsData: any): Promise<ApiResponse> {
    return this.post(API_CONFIG.ENDPOINTS.INVOICING.E_INVOICE.SETTINGS.CREATE, settingsData);
  }

  async updateEInvoiceSetting(id: string, settingsData: any): Promise<ApiResponse> {
    return this.put(API_CONFIG.ENDPOINTS.INVOICING.E_INVOICE.SETTINGS.UPDATE(id), settingsData);
  }

  async deleteEInvoiceSetting(id: string): Promise<ApiResponse> {
    return this.delete(API_CONFIG.ENDPOINTS.INVOICING.E_INVOICE.SETTINGS.DELETE(id));
  }

  async testEInvoiceConnection(id?: string): Promise<ApiResponse> {
    if (id) {
      return this.post(API_CONFIG.ENDPOINTS.INVOICING.E_INVOICE.SETTINGS.TEST_CONNECTION(id));
    } else {
      return this.post(API_CONFIG.ENDPOINTS.INVOICING.E_INVOICE.SETTINGS.TEST_CONNECTION_DEFAULT);
    }
  }

  // E-Invoice Operations
  async submitEInvoice(invoiceId: string): Promise<ApiResponse> {
    return this.post(API_CONFIG.ENDPOINTS.INVOICING.E_INVOICE.SUBMIT(invoiceId));
  }

  async getEInvoiceStatus(invoiceId: string): Promise<ApiResponse> {
    return this.get(API_CONFIG.ENDPOINTS.INVOICING.E_INVOICE.STATUS(invoiceId));
  }

  async cancelEInvoice(invoiceId: string, cancellationReason: string): Promise<ApiResponse> {
    return this.post(API_CONFIG.ENDPOINTS.INVOICING.E_INVOICE.CANCEL(invoiceId), {
      cancellation_reason: cancellationReason,
    });
  }

  async generateUBLFormat(invoiceId: string): Promise<ApiResponse> {
    return this.get(API_CONFIG.ENDPOINTS.INVOICING.E_INVOICE.UBL(invoiceId));
  }

  // E-Invoice Submission History
  async getEInvoiceSubmissions(invoiceId: string): Promise<ApiResponse> {
    return this.get(API_CONFIG.ENDPOINTS.INVOICING.E_INVOICE.SUBMISSIONS.LIST(invoiceId));
  }

  async getEInvoiceSubmissionDetail(submissionId: string): Promise<ApiResponse> {
    return this.get(API_CONFIG.ENDPOINTS.INVOICING.E_INVOICE.SUBMISSIONS.DETAIL(submissionId));
  }

  // Invoice Templates
  async getInvoiceTemplates(params?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<ApiResponse<PaginatedResponse<any>>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);

    const endpoint = `${API_CONFIG.ENDPOINTS.INVOICING.TEMPLATES.LIST}?${queryParams.toString()}`;
    return this.get(endpoint);
  }

  async getInvoiceTemplate(id: string): Promise<ApiResponse> {
    return this.get(API_CONFIG.ENDPOINTS.INVOICING.TEMPLATES.DETAIL(id));
  }

  async createInvoiceTemplate(templateData: any): Promise<ApiResponse> {
    return this.post(API_CONFIG.ENDPOINTS.INVOICING.TEMPLATES.CREATE, templateData);
  }

  async updateInvoiceTemplate(id: string, templateData: any): Promise<ApiResponse> {
    return this.put(API_CONFIG.ENDPOINTS.INVOICING.TEMPLATES.UPDATE(id), templateData);
  }

  async deleteInvoiceTemplate(id: string): Promise<ApiResponse> {
    return this.delete(API_CONFIG.ENDPOINTS.INVOICING.TEMPLATES.DELETE(id));
  }

  // Invoice Payments
  async getPayments(params?: {
    page?: number;
    limit?: number;
    search?: string;
    invoiceId?: string;
    status?: string;
  }): Promise<ApiResponse<PaginatedResponse<any>>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.invoiceId) queryParams.append('invoice_id', params.invoiceId);
    if (params?.status) queryParams.append('status', params.status);

    const queryString = queryParams.toString();
    const endpoint = queryString ? `/invoicing/payments/?${queryString}` : '/invoicing/payments/';
    return this.get(endpoint);
  }

  async getPayment(id: string): Promise<ApiResponse> {
    return this.get(`/invoicing/payments/${id}/`);
  }

  async createPayment(paymentData: any): Promise<ApiResponse> {
    return this.post('/invoicing/payments/', paymentData);
  }

  async updatePayment(id: string, paymentData: any): Promise<ApiResponse> {
    return this.put(`/invoicing/payments/${id}/`, paymentData);
  }

  async deletePayment(id: string): Promise<ApiResponse> {
    return this.delete(`/invoicing/payments/${id}/`);
  }
}

// Inventory Service
export { InventoryService } from './inventory-service';

// Sales Service
export { SalesService } from './sales-service';

// Purchase Service
export { PurchaseService } from './purchase-service';

// Banking Service
export class BankingService extends BaseApiService {
  // Bank Accounts
  async getBankAccounts(): Promise<ApiResponse<PaginatedResponse<any>>> {
    return this.get(API_CONFIG.ENDPOINTS.BANKING.ACCOUNTS.LIST);
  }

  async getBankAccount(id: string): Promise<ApiResponse> {
    return this.get(API_CONFIG.ENDPOINTS.BANKING.ACCOUNTS.DETAIL(id));
  }

  async createBankAccount(accountData: any): Promise<ApiResponse> {
    return this.post(API_CONFIG.ENDPOINTS.BANKING.ACCOUNTS.CREATE, accountData);
  }

  async updateBankAccount(id: string, accountData: any): Promise<ApiResponse> {
    return this.put(API_CONFIG.ENDPOINTS.BANKING.ACCOUNTS.UPDATE(id), accountData);
  }

  async deleteBankAccount(id: string): Promise<ApiResponse> {
    return this.delete(API_CONFIG.ENDPOINTS.BANKING.ACCOUNTS.DELETE(id));
  }

  async getBankAccountBalance(id: string): Promise<ApiResponse> {
    return this.get(API_CONFIG.ENDPOINTS.BANKING.ACCOUNTS.BALANCE(id));
  }

  // Transactions
  async getTransactions(params?: {
    page?: number;
    limit?: number;
    accountId?: string;
    dateFrom?: string;
    dateTo?: string;
  }): Promise<ApiResponse<PaginatedResponse<any>>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.accountId) queryParams.append('account_id', params.accountId);
    if (params?.dateFrom) queryParams.append('date_from', params.dateFrom);
    if (params?.dateTo) queryParams.append('date_to', params.dateTo);

    const queryString = queryParams.toString();
    const endpoint = queryString 
      ? `${API_CONFIG.ENDPOINTS.BANKING.TRANSACTIONS.LIST}?${queryString}`
      : API_CONFIG.ENDPOINTS.BANKING.TRANSACTIONS.LIST;
    return this.get(endpoint, { transformConfig: 'TRANSACTION' });
  }

  async getTransaction(id: string): Promise<ApiResponse> {
    return this.get(API_CONFIG.ENDPOINTS.BANKING.TRANSACTIONS.DETAIL(id), {
      transformConfig: 'TRANSACTION',
    });
  }

  async createTransaction(transactionData: any): Promise<ApiResponse> {
    return this.post(API_CONFIG.ENDPOINTS.BANKING.TRANSACTIONS.CREATE, transactionData, {
      transformConfig: 'TRANSACTION',
    });
  }

  async updateTransaction(id: string, transactionData: any): Promise<ApiResponse> {
    return this.put(API_CONFIG.ENDPOINTS.BANKING.TRANSACTIONS.UPDATE(id), transactionData, {
      transformConfig: 'TRANSACTION',
    });
  }

  async deleteTransaction(id: string): Promise<ApiResponse> {
    return this.delete(API_CONFIG.ENDPOINTS.BANKING.TRANSACTIONS.DELETE(id));
  }

  async importTransactions(file: File): Promise<ApiResponse> {
    const formData = new FormData();
    formData.append('file', file);
    
    return this.post(API_CONFIG.ENDPOINTS.BANKING.TRANSACTIONS.IMPORT, formData, {
      skipTransform: true,
    });
  }

  async reconcileTransactions(transactionIds: string[]): Promise<ApiResponse> {
    return this.post(API_CONFIG.ENDPOINTS.BANKING.TRANSACTIONS.RECONCILE, {
      transaction_ids: transactionIds,
    });
  }

  // Bank Integrations/Connections
  async getBankConnections(params?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<ApiResponse<PaginatedResponse<any>>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);

    const queryString = queryParams.toString();
    const endpoint = queryString 
      ? `${API_CONFIG.ENDPOINTS.BANKING.INTEGRATIONS.LIST}?${queryString}`
      : API_CONFIG.ENDPOINTS.BANKING.INTEGRATIONS.LIST;
    return this.get(endpoint);
  }

  async getBankConnection(id: string): Promise<ApiResponse> {
    return this.get(API_CONFIG.ENDPOINTS.BANKING.INTEGRATIONS.DETAIL(id));
  }

  async createBankConnection(connectionData: any): Promise<ApiResponse> {
    return this.post(API_CONFIG.ENDPOINTS.BANKING.INTEGRATIONS.CREATE, connectionData);
  }

  async updateBankConnection(id: string, connectionData: any): Promise<ApiResponse> {
    return this.put(API_CONFIG.ENDPOINTS.BANKING.INTEGRATIONS.UPDATE(id), connectionData);
  }

  async deleteBankConnection(id: string): Promise<ApiResponse> {
    return this.delete(API_CONFIG.ENDPOINTS.BANKING.INTEGRATIONS.DELETE(id));
  }

  async syncBankConnection(id: string): Promise<ApiResponse> {
    return this.post(API_CONFIG.ENDPOINTS.BANKING.INTEGRATIONS.SYNC(id));
  }

  async testBankConnection(id: string): Promise<ApiResponse> {
    return this.get(API_CONFIG.ENDPOINTS.BANKING.INTEGRATIONS.TEST(id));
  }

  async updateBankConnectionSettings(id: string, settings: any): Promise<ApiResponse> {
    // Update connection with settings in the settings field
    return this.patch(API_CONFIG.ENDPOINTS.BANKING.INTEGRATIONS.UPDATE(id), { settings });
  }

  // Reconciliations
  // Note: Backend only has account-specific reconciliation endpoint
  async getReconciliations(params?: {
    page?: number;
    limit?: number;
    accountId?: string;
  }): Promise<ApiResponse<PaginatedResponse<any>>> {
    // Backend doesn't have a list endpoint for reconciliations
    // Return empty result for now
    return Promise.resolve({
      success: true,
      data: { results: [], count: 0, next: null, previous: null },
      status: 200,
    } as ApiResponse<PaginatedResponse<any>>);
  }

  async getReconciliation(id: string): Promise<ApiResponse> {
    // Backend doesn't have a detail endpoint for reconciliations
    // Return empty result for now
    return Promise.resolve({
      success: true,
      data: null,
      status: 200,
    } as ApiResponse);
  }

  async getAccountReconciliation(accountId: string): Promise<ApiResponse> {
    // Get reconciliation data for a specific account
    return this.get(`/banking/accounts/${accountId}/reconciliation/`);
  }

  async createReconciliation(reconciliationData: any): Promise<ApiResponse> {
    // Backend doesn't have a create endpoint for reconciliations
    // Return success for now (reconciliations are typically created through statements)
    return Promise.resolve({
      success: true,
      data: reconciliationData,
      status: 200,
    } as ApiResponse);
  }

  async updateReconciliation(id: string, reconciliationData: any): Promise<ApiResponse> {
    // Backend doesn't have an update endpoint for reconciliations
    // Return success for now
    return Promise.resolve({
      success: true,
      data: reconciliationData,
      status: 200,
    } as ApiResponse);
  }

  async deleteReconciliation(id: string): Promise<ApiResponse> {
    // Backend doesn't have a delete endpoint for reconciliations
    // Return success for now
    return Promise.resolve({
      success: true,
      status: 200,
    } as ApiResponse);
  }

  // Transaction Categories
  // Note: Backend doesn't have a categories endpoint - transactions use a simple category field
  // Return empty list without making API call to avoid 404 errors
  async getTransactionCategories(params?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<ApiResponse<PaginatedResponse<any>>> {
    // Return empty response without making API call
    // Categories are stored as simple strings in the transaction.category field
    return Promise.resolve({
      success: true,
      data: { results: [], count: 0, next: null, previous: null },
      status: 200,
    } as ApiResponse<PaginatedResponse<any>>);
  }
}

// AI Processing Service
export class AiProcessingService extends BaseApiService {
  // ============================================
  // Document Processing Methods
  // ============================================
  
  async getDocuments(params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
  }): Promise<ApiResponse<PaginatedResponse<any>>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.status) queryParams.append('status', params.status);

    const endpoint = `${API_CONFIG.ENDPOINTS.AI_PROCESSING.DOCUMENTS.LIST}?${queryParams.toString()}`;
    return this.get(endpoint);
  }

  async getDocument(id: string): Promise<ApiResponse> {
    return this.get(API_CONFIG.ENDPOINTS.AI_PROCESSING.DOCUMENTS.DETAIL(id));
  }

  async uploadDocument(
    formData: FormData,
    options?: {
      onUploadProgress?: (progressEvent: any) => void;
    }
  ): Promise<ApiResponse> {
    // For file uploads with progress, call client directly to pass axios config
    const axiosConfig: any = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    };

    if (options?.onUploadProgress) {
      axiosConfig.onUploadProgress = options.onUploadProgress;
    }

    // Use client directly for file uploads to support progress callback
    const response = await this.client.post(
      API_CONFIG.ENDPOINTS.AI_PROCESSING.DOCUMENTS.UPLOAD,
      formData,
      axiosConfig
    );
    return response;
  }

  async processDocument(documentId: string, processingType: 'categorization' | 'extraction' | 'both' = 'both'): Promise<ApiResponse> {
    // Process document with specified processing type
    const payload = {
      document_id: documentId,
      processing_type: processingType,
    };

    // Backend uses single process endpoint: POST /api/v1/ai_processing/documents/process/
    return this.post(API_CONFIG.ENDPOINTS.AI_PROCESSING.DOCUMENTS.PROCESS, payload);
  }

  async deleteDocument(id: string): Promise<ApiResponse> {
    return this.delete(API_CONFIG.ENDPOINTS.AI_PROCESSING.DOCUMENTS.DETAIL(id));
  }

  async searchDocuments(query: string): Promise<ApiResponse> {
    const endpoint = `${API_CONFIG.ENDPOINTS.AI_PROCESSING.DOCUMENTS.SEARCH}?q=${encodeURIComponent(query)}`;
    return this.get(endpoint);
  }

  async getDocumentCategorization(documentId: string): Promise<ApiResponse> {
    return this.get(API_CONFIG.ENDPOINTS.AI_PROCESSING.DOCUMENTS.CATEGORIZATION(documentId));
  }

  async triggerDocumentCategorization(documentId: string): Promise<ApiResponse> {
    return this.post(API_CONFIG.ENDPOINTS.AI_PROCESSING.DOCUMENTS.CATEGORIZATION(documentId), {});
  }

  async getDocumentExtraction(documentId: string): Promise<ApiResponse> {
    return this.get(API_CONFIG.ENDPOINTS.AI_PROCESSING.DOCUMENTS.EXTRACTION(documentId));
  }

  async triggerDocumentExtraction(documentId: string, fields?: string[]): Promise<ApiResponse> {
    const payload = fields ? { fields } : {};
    return this.post(API_CONFIG.ENDPOINTS.AI_PROCESSING.DOCUMENTS.EXTRACTION(documentId), payload);
  }

  // ============================================
  // Categorization Methods
  // ============================================
  
  async getCategorizations(params?: {
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<PaginatedResponse<any>>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const endpoint = `${API_CONFIG.ENDPOINTS.AI_PROCESSING.CATEGORIZATION.LIST}?${queryParams.toString()}`;
    return this.get(endpoint);
  }

  async getCategorization(id: string): Promise<ApiResponse> {
    return this.get(API_CONFIG.ENDPOINTS.AI_PROCESSING.CATEGORIZATION.DETAIL(id));
  }

  // Legacy methods - keep for backward compatibility but use new endpoints
  async getCategorizationRules(params?: {
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<PaginatedResponse<any>>> {
    return this.getCategorizations(params);
  }

  async createCategorizationRule(ruleData: any): Promise<ApiResponse> {
    return this.post(API_CONFIG.ENDPOINTS.AI_PROCESSING.CATEGORIZATION.LIST, ruleData);
  }

  async updateCategorizationRule(id: string, ruleData: any): Promise<ApiResponse> {
    return this.put(API_CONFIG.ENDPOINTS.AI_PROCESSING.CATEGORIZATION.DETAIL(id), ruleData);
  }

  async deleteCategorizationRule(id: string): Promise<ApiResponse> {
    return this.delete(API_CONFIG.ENDPOINTS.AI_PROCESSING.CATEGORIZATION.DETAIL(id));
  }

  async getUncategorizedItems(params?: {
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<PaginatedResponse<any>>> {
    // Backend doesn't have this endpoint - return empty for now
    return Promise.resolve({
      data: { results: [], count: 0, next: null, previous: null },
      success: true,
      status: 200,
    } as ApiResponse<PaginatedResponse<any>>);
  }

  async autoCategorizeItems(): Promise<ApiResponse> {
    // Backend doesn't have this endpoint - return empty for now
    return Promise.resolve({
      data: { message: 'Auto-categorization not yet implemented' },
      success: true,
      status: 200,
    } as ApiResponse);
  }

  async categorizeItem(itemId: string, category: string, subcategory?: string): Promise<ApiResponse> {
    // Backend doesn't have this endpoint - return empty for now
    return Promise.resolve({
      data: { message: 'Item categorization not yet implemented' },
      success: true,
      status: 200,
    } as ApiResponse);
  }

  async categorizeTransactions(transactionData: any[]): Promise<ApiResponse> {
    // Backend doesn't have this endpoint - return empty for now
    return Promise.resolve({
      data: { message: 'Transaction categorization not yet implemented' },
      success: true,
      status: 200,
    } as ApiResponse);
  }

  // ============================================
  // Forecasting Methods
  // ============================================
  
  async forecastFinancials(forecastData: {
    forecast_type: string;
    time_series_data: Array<{ date: string; value: number }>;
    periods: number;
    frequency: string;
    model_name?: string;
  }): Promise<ApiResponse> {
    return this.post(API_CONFIG.ENDPOINTS.AI_PROCESSING.FORECASTING.FORECAST, forecastData);
  }

  async getForecastingModels(): Promise<ApiResponse> {
    return this.get(API_CONFIG.ENDPOINTS.AI_PROCESSING.FORECASTING.MODELS);
  }

  // Legacy methods - keep for backward compatibility
  async getForecasts(params?: {
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<PaginatedResponse<any>>> {
    // Backend doesn't have a list endpoint - return empty for now
    return Promise.resolve({
      data: { results: [], count: 0, next: null, previous: null },
      success: true,
      status: 200,
    } as ApiResponse<PaginatedResponse<any>>);
  }

  async generateForecast(forecastData: any): Promise<ApiResponse> {
    return this.forecastFinancials(forecastData);
  }

  async getForecastMetrics(): Promise<ApiResponse> {
    // Backend doesn't have metrics endpoint - return empty for now
    return Promise.resolve({
      data: {},
      success: true,
      status: 200,
    } as ApiResponse);
  }

  async exportForecast(forecastId: string): Promise<ApiResponse<Blob>> {
    // Backend doesn't have export endpoint - throw error
    throw new Error('Forecast export not yet implemented in backend');
  }

  // ============================================
  // Fraud Detection Methods
  // ============================================
  
  async detectFraud(data: {
    document_id?: string;
    data: {
      transaction_amount?: number;
      sender_country?: string;
      recipient_country?: string;
      [key: string]: any;
    };
    async_mode?: boolean;
  }): Promise<ApiResponse> {
    return this.post(API_CONFIG.ENDPOINTS.AI_PROCESSING.FRAUD.DETECT, data);
  }

  // Legacy methods - keep for backward compatibility but return empty/errors
  async getFraudAlerts(params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<ApiResponse<PaginatedResponse<any>>> {
    // Backend doesn't have alerts list endpoint - return empty for now
    return Promise.resolve({
      data: { results: [], count: 0, next: null, previous: null },
      success: true,
      status: 200,
    } as ApiResponse<PaginatedResponse<any>>);
  }

  async getFraudRules(params?: {
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<PaginatedResponse<any>>> {
    // Backend doesn't have rules endpoint - return empty for now
    return Promise.resolve({
      data: { results: [], count: 0, next: null, previous: null },
      success: true,
      status: 200,
    } as ApiResponse<PaginatedResponse<any>>);
  }

  async createFraudRule(ruleData: any): Promise<ApiResponse> {
    throw new Error('Fraud rules not yet implemented in backend');
  }

  async updateFraudRule(id: string, ruleData: any): Promise<ApiResponse> {
    throw new Error('Fraud rules not yet implemented in backend');
  }

  async deleteFraudRule(id: string): Promise<ApiResponse> {
    throw new Error('Fraud rules not yet implemented in backend');
  }

  async getFraudMetrics(): Promise<ApiResponse> {
    // Backend doesn't have metrics endpoint - return empty for now
    return Promise.resolve({
      data: {},
      success: true,
      status: 200,
    } as ApiResponse);
  }

  async resolveFraudAlert(alertId: string, status: string, notes?: string): Promise<ApiResponse> {
    throw new Error('Fraud alerts not yet implemented in backend');
  }

  // ============================================
  // Job Management Methods
  // ============================================
  
  async getJobs(params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<ApiResponse<PaginatedResponse<any>>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.status) queryParams.append('status', params.status);

    const endpoint = `${API_CONFIG.ENDPOINTS.AI_PROCESSING.JOBS.LIST}?${queryParams.toString()}`;
    return this.get(endpoint);
  }

  async getJob(id: string): Promise<ApiResponse> {
    return this.get(API_CONFIG.ENDPOINTS.AI_PROCESSING.JOBS.DETAIL(id));
  }

  async createJob(jobData: any): Promise<ApiResponse> {
    return this.post(API_CONFIG.ENDPOINTS.AI_PROCESSING.JOBS.CREATE, jobData);
  }

  async getJobStatus(id: string): Promise<ApiResponse> {
    // Use detail endpoint - status is included in job response
    return this.get(API_CONFIG.ENDPOINTS.AI_PROCESSING.JOBS.DETAIL(id));
  }

  async cancelJob(id: string): Promise<ApiResponse> {
    // Update job status to 'cancelled' via PATCH
    return this.patch(API_CONFIG.ENDPOINTS.AI_PROCESSING.JOBS.DETAIL(id), {
      status: 'cancelled'
    });
  }

  // ============================================
  // Settings Methods
  // ============================================
  
  async getSettings(): Promise<ApiResponse> {
    return this.get(API_CONFIG.ENDPOINTS.AI_PROCESSING.SETTINGS);
  }

  async updateSettings(settingsData: any): Promise<ApiResponse> {
    return this.put(API_CONFIG.ENDPOINTS.AI_PROCESSING.SETTINGS, settingsData);
  }

  async patchSettings(settingsData: any): Promise<ApiResponse> {
    return this.patch(API_CONFIG.ENDPOINTS.AI_PROCESSING.SETTINGS, settingsData);
  }

  // ============================================
  // Statistics and Models Methods
  // ============================================
  
  async getStats(params?: {
    start_date?: string;
    end_date?: string;
  }): Promise<ApiResponse> {
    const queryParams = new URLSearchParams();
    if (params?.start_date) queryParams.append('start_date', params.start_date);
    if (params?.end_date) queryParams.append('end_date', params.end_date);

    const endpoint = `${API_CONFIG.ENDPOINTS.AI_PROCESSING.STATS}?${queryParams.toString()}`;
    return this.get(endpoint);
  }

  async getModels(): Promise<ApiResponse<PaginatedResponse<any>>> {
    return this.get(API_CONFIG.ENDPOINTS.AI_PROCESSING.MODELS.LIST);
  }

  async getModel(id: string): Promise<ApiResponse> {
    return this.get(API_CONFIG.ENDPOINTS.AI_PROCESSING.MODELS.DETAIL(id));
  }

  async retrainModel(modelId: string): Promise<ApiResponse> {
    return this.post(API_CONFIG.ENDPOINTS.AI_PROCESSING.MODELS.RETRAIN(modelId), {});
  }
}

// Web3 Service
export class Web3Service extends BaseApiService {
  async getWalletBalance(address: string): Promise<ApiResponse> {
    return this.get(API_CONFIG.ENDPOINTS.WEB3.BALANCE(address));
  }

  async getTransactionHistory(address: string, params?: {
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<PaginatedResponse<any>>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const endpoint = `${API_CONFIG.ENDPOINTS.WEB3.TRANSACTIONS.BY_ADDRESS(address)}?${queryParams.toString()}`;
    return this.get(endpoint);
  }

  async sendTransaction(transactionData: any): Promise<ApiResponse> {
    return this.post(API_CONFIG.ENDPOINTS.WEB3.SEND, transactionData);
  }

  async getGasEstimate(transactionData: any): Promise<ApiResponse> {
    return this.post(API_CONFIG.ENDPOINTS.WEB3.GAS_ESTIMATE, transactionData);
  }

  async getNetworkStatus(): Promise<ApiResponse> {
    return this.get(API_CONFIG.ENDPOINTS.WEB3.NETWORK_STATUS);
  }
}

// Re-export BaseApiService for backward compatibility
export { BaseApiService } from './api-service-base';

// Import new feature services (for instantiation)
import {
  TaxOptimizationService,
  TreasuryService,
  FxConversionService,
  VendorVerificationService,
  ErpIntegrationService,
  GnosisSafeService,
  CoinbasePrimeService,
} from './api-services-new-features';

// Re-export new feature services
export {
  TaxOptimizationService,
  TreasuryService,
  FxConversionService,
  VendorVerificationService,
  ErpIntegrationService,
  GnosisSafeService,
  CoinbasePrimeService,
};

// Service instances
export const authService = new AuthService();
export const userService = new UserService();
export const tenantService = new TenantService();
export const accountingService = new AccountingService();
export const invoicingService = new InvoicingService();
export const bankingService = new BankingService();
export const aiProcessingService = new AiProcessingService();
export const web3Service = new Web3Service();

// Import and instantiate InventoryService
import { InventoryService } from './inventory-service';
export const inventoryService = new InventoryService();

// Import and instantiate SalesService
import { SalesService } from './sales-service';
export const salesService = new SalesService();

// Import and instantiate PurchaseService
import { PurchaseService } from './purchase-service';
export const purchaseService = new PurchaseService();

// New feature service instances
export const taxOptimizationService = new TaxOptimizationService();
export const treasuryService = new TreasuryService();
export const fxConversionService = new FxConversionService();
export const vendorVerificationService = new VendorVerificationService();
export const erpIntegrationService = new ErpIntegrationService();
export const gnosisSafeService = new GnosisSafeService();
export const coinbasePrimeService = new CoinbasePrimeService();
