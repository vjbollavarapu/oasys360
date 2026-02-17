/**
 * Sales Service
 * API service for sales management operations
 */

import { BaseApiService } from './api-service-base';
import { ApiResponse, PaginatedResponse } from './api-client';
import { API_CONFIG } from './api-config';

export class SalesService extends BaseApiService {
  // ============================================
  // Customers Methods
  // ============================================
  
  async getCustomers(params?: {
    page?: number;
    limit?: number;
    search?: string;
    is_active?: boolean;
  }): Promise<ApiResponse<PaginatedResponse<any>>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.is_active !== undefined) queryParams.append('is_active', params.is_active.toString());

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

  async searchCustomers(searchTerm: string): Promise<ApiResponse> {
    return this.get(`${API_CONFIG.ENDPOINTS.SALES.CUSTOMERS.SEARCH}?q=${encodeURIComponent(searchTerm)}`);
  }

  async getCustomerSummary(): Promise<ApiResponse> {
    return this.get(API_CONFIG.ENDPOINTS.SALES.CUSTOMERS.SUMMARY);
  }

  async getCustomerOrders(customerId: string): Promise<ApiResponse> {
    return this.get(`/sales/customers/${customerId}/orders/`);
  }

  // ============================================
  // Sales Orders Methods
  // ============================================
  
  async getSalesOrders(params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    customer?: string;
    ordering?: string;
  }): Promise<ApiResponse<PaginatedResponse<any>>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.customer) queryParams.append('customer', params.customer);
    if (params?.ordering) queryParams.append('ordering', params.ordering);

    const endpoint = `${API_CONFIG.ENDPOINTS.SALES.ORDERS.LIST}?${queryParams.toString()}`;
    return this.get(endpoint);
  }

  async getSalesOrder(id: string): Promise<ApiResponse> {
    return this.get(API_CONFIG.ENDPOINTS.SALES.ORDERS.DETAIL(id));
  }

  async createSalesOrder(orderData: any): Promise<ApiResponse> {
    return this.post(API_CONFIG.ENDPOINTS.SALES.ORDERS.CREATE, orderData);
  }

  async updateSalesOrder(id: string, orderData: any): Promise<ApiResponse> {
    return this.put(API_CONFIG.ENDPOINTS.SALES.ORDERS.UPDATE(id), orderData);
  }

  async deleteSalesOrder(id: string): Promise<ApiResponse> {
    return this.delete(API_CONFIG.ENDPOINTS.SALES.ORDERS.DELETE(id));
  }

  async approveSalesOrder(id: string): Promise<ApiResponse> {
    return this.post(`/sales/orders/${id}/approve/`, {});
  }

  async shipSalesOrder(id: string): Promise<ApiResponse> {
    return this.post(`/sales/orders/${id}/ship/`, {});
  }

  async getSalesOrderLines(orderId: string): Promise<ApiResponse> {
    return this.get(`/sales/orders/${orderId}/lines/`);
  }

  async convertOrderToInvoice(orderId: string): Promise<ApiResponse> {
    return this.post(API_CONFIG.ENDPOINTS.SALES.ORDERS.CONVERT_TO_INVOICE(orderId), {});
  }

  // ============================================
  // Sales Quotes Methods
  // ============================================
  
  async getSalesQuotes(params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    customer?: string;
    ordering?: string;
  }): Promise<ApiResponse<PaginatedResponse<any>>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.customer) queryParams.append('customer', params.customer);
    if (params?.ordering) queryParams.append('ordering', params.ordering);

    const endpoint = `${API_CONFIG.ENDPOINTS.SALES.QUOTES.LIST}?${queryParams.toString()}`;
    return this.get(endpoint);
  }

  async getSalesQuote(id: string): Promise<ApiResponse> {
    return this.get(API_CONFIG.ENDPOINTS.SALES.QUOTES.DETAIL(id));
  }

  async createSalesQuote(quoteData: any): Promise<ApiResponse> {
    return this.post(API_CONFIG.ENDPOINTS.SALES.QUOTES.CREATE, quoteData);
  }

  async updateSalesQuote(id: string, quoteData: any): Promise<ApiResponse> {
    return this.put(API_CONFIG.ENDPOINTS.SALES.QUOTES.UPDATE(id), quoteData);
  }

  async deleteSalesQuote(id: string): Promise<ApiResponse> {
    return this.delete(API_CONFIG.ENDPOINTS.SALES.QUOTES.DELETE(id));
  }

  async approveSalesQuote(id: string): Promise<ApiResponse> {
    return this.post(`/sales/quotes/${id}/approve/`, {});
  }

  async convertQuoteToOrder(quoteId: string): Promise<ApiResponse> {
    return this.post(API_CONFIG.ENDPOINTS.SALES.QUOTES.CONVERT_TO_ORDER(quoteId), {});
  }

  async getSalesQuoteLines(quoteId: string): Promise<ApiResponse> {
    return this.get(`/sales/quotes/${quoteId}/lines/`);
  }

  // ============================================
  // Sales Statistics Methods
  // ============================================
  
  async getSalesStats(params?: {
    start_date?: string;
    end_date?: string;
  }): Promise<ApiResponse> {
    const queryParams = new URLSearchParams();
    if (params?.start_date) queryParams.append('start_date', params.start_date);
    if (params?.end_date) queryParams.append('end_date', params.end_date);

    const endpoint = `/sales/stats/${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    return this.get(endpoint);
  }
}

