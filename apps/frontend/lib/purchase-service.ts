/**
 * Purchase Service
 * API service for purchase management operations
 */

import { BaseApiService } from './api-service-base';
import { ApiResponse, PaginatedResponse } from './api-client';
import { API_CONFIG } from './api-config';

export class PurchaseService extends BaseApiService {
  // ============================================
  // Suppliers/Vendors Methods
  // ============================================
  // Note: Backend uses 'suppliers' endpoint, but API_CONFIG uses 'vendors'
  
  async getSuppliers(params?: {
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

    // Backend uses 'suppliers' not 'vendors'
    const endpoint = `/purchase/suppliers/?${queryParams.toString()}`;
    return this.get(endpoint);
  }

  async getSupplier(id: string): Promise<ApiResponse> {
    return this.get(`/purchase/suppliers/${id}/`);
  }

  async createSupplier(supplierData: any): Promise<ApiResponse> {
    return this.post('/purchase/suppliers/', supplierData);
  }

  async updateSupplier(id: string, supplierData: any): Promise<ApiResponse> {
    return this.put(`/purchase/suppliers/${id}/`, supplierData);
  }

  async deleteSupplier(id: string): Promise<ApiResponse> {
    return this.delete(`/purchase/suppliers/${id}/`);
  }

  async searchSuppliers(searchTerm: string): Promise<ApiResponse> {
    return this.get(`/purchase/suppliers/search/?q=${encodeURIComponent(searchTerm)}`);
  }

  async getSupplierSummary(): Promise<ApiResponse> {
    return this.get('/purchase/suppliers/summary/');
  }

  async getSupplierOrders(supplierId: string): Promise<ApiResponse> {
    return this.get(`/purchase/suppliers/${supplierId}/orders/`);
  }

  async recordSupplierPayment(supplierId: string, paymentData: any): Promise<ApiResponse> {
    return this.post(`/purchase/suppliers/${supplierId}/payments/`, paymentData);
  }

  // ============================================
  // Purchase Orders Methods
  // ============================================
  
  async getPurchaseOrders(params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    supplier?: string;
    ordering?: string;
  }): Promise<ApiResponse<PaginatedResponse<any>>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.supplier) queryParams.append('supplier', params.supplier);
    if (params?.ordering) queryParams.append('ordering', params.ordering);

    const endpoint = `${API_CONFIG.ENDPOINTS.PURCHASE.ORDERS.LIST}?${queryParams.toString()}`;
    return this.get(endpoint);
  }

  async getPurchaseOrder(id: string): Promise<ApiResponse> {
    return this.get(API_CONFIG.ENDPOINTS.PURCHASE.ORDERS.DETAIL(id));
  }

  async createPurchaseOrder(orderData: any): Promise<ApiResponse> {
    return this.post(API_CONFIG.ENDPOINTS.PURCHASE.ORDERS.CREATE, orderData);
  }

  async updatePurchaseOrder(id: string, orderData: any): Promise<ApiResponse> {
    return this.put(API_CONFIG.ENDPOINTS.PURCHASE.ORDERS.UPDATE(id), orderData);
  }

  async deletePurchaseOrder(id: string): Promise<ApiResponse> {
    return this.delete(API_CONFIG.ENDPOINTS.PURCHASE.ORDERS.DELETE(id));
  }

  async approvePurchaseOrder(id: string): Promise<ApiResponse> {
    return this.post(API_CONFIG.ENDPOINTS.PURCHASE.ORDERS.APPROVE(id), {});
  }

  async receivePurchaseOrder(id: string): Promise<ApiResponse> {
    return this.post(API_CONFIG.ENDPOINTS.PURCHASE.ORDERS.RECEIVE(id), {});
  }

  async getPurchaseOrderLines(orderId: string): Promise<ApiResponse> {
    return this.get(`/purchase/orders/${orderId}/lines/`);
  }

  async createReceiptFromOrder(orderId: string): Promise<ApiResponse> {
    return this.post(`/purchase/orders/${orderId}/receipt/`, {});
  }

  // ============================================
  // Purchase Receipts Methods
  // ============================================
  
  async getPurchaseReceipts(params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    purchase_order?: string;
  }): Promise<ApiResponse<PaginatedResponse<any>>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.purchase_order) queryParams.append('purchase_order', params.purchase_order);

    const endpoint = `/purchase/receipts/?${queryParams.toString()}`;
    return this.get(endpoint);
  }

  async getPurchaseReceipt(id: string): Promise<ApiResponse> {
    return this.get(`/purchase/receipts/${id}/`);
  }

  async approvePurchaseReceipt(id: string): Promise<ApiResponse> {
    return this.post(`/purchase/receipts/${id}/approve/`, {});
  }

  async getPurchaseReceiptLines(receiptId: string): Promise<ApiResponse> {
    return this.get(`/purchase/receipts/${receiptId}/lines/`);
  }

  // ============================================
  // Purchase Payments Methods
  // ============================================
  
  async getPurchasePayments(params?: {
    page?: number;
    limit?: number;
    search?: string;
    supplier?: string;
  }): Promise<ApiResponse<PaginatedResponse<any>>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.supplier) queryParams.append('supplier', params.supplier);

    const endpoint = `/purchase/payments/?${queryParams.toString()}`;
    return this.get(endpoint);
  }

  async getPurchasePayment(id: string): Promise<ApiResponse> {
    return this.get(`/purchase/payments/${id}/`);
  }

  // ============================================
  // Purchase Statistics Methods
  // ============================================
  
  async getPurchaseStats(params?: {
    start_date?: string;
    end_date?: string;
  }): Promise<ApiResponse> {
    const queryParams = new URLSearchParams();
    if (params?.start_date) queryParams.append('start_date', params.start_date);
    if (params?.end_date) queryParams.append('end_date', params.end_date);

    const endpoint = `/purchase/stats/${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    return this.get(endpoint);
  }
}

