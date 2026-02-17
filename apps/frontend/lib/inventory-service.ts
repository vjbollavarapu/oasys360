/**
 * Inventory Service
 * API service for inventory management operations
 */

import { BaseApiService } from './api-service-base';
import { ApiResponse, PaginatedResponse } from './api-client';
import { API_CONFIG } from './api-config';

export class InventoryService extends BaseApiService {
  // ============================================
  // Items Methods
  // ============================================
  
  async getItems(params?: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    item_type?: string;
    is_active?: boolean;
    is_tracked?: boolean;
  }): Promise<ApiResponse<PaginatedResponse<any>>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.category) queryParams.append('category', params.category);
    if (params?.item_type) queryParams.append('item_type', params.item_type);
    if (params?.is_active !== undefined) queryParams.append('is_active', params.is_active.toString());
    if (params?.is_tracked !== undefined) queryParams.append('is_tracked', params.is_tracked.toString());

    const endpoint = `${API_CONFIG.ENDPOINTS.INVENTORY.ITEMS.LIST}?${queryParams.toString()}`;
    return this.get(endpoint);
  }

  async getItem(id: string): Promise<ApiResponse> {
    return this.get(API_CONFIG.ENDPOINTS.INVENTORY.ITEMS.DETAIL(id));
  }

  async createItem(itemData: any): Promise<ApiResponse> {
    return this.post(API_CONFIG.ENDPOINTS.INVENTORY.ITEMS.CREATE, itemData);
  }

  async updateItem(id: string, itemData: any): Promise<ApiResponse> {
    return this.put(API_CONFIG.ENDPOINTS.INVENTORY.ITEMS.UPDATE(id), itemData);
  }

  async deleteItem(id: string): Promise<ApiResponse> {
    return this.delete(API_CONFIG.ENDPOINTS.INVENTORY.ITEMS.DELETE(id));
  }

  async getLowStockItems(): Promise<ApiResponse> {
    return this.get(`${API_CONFIG.ENDPOINTS.INVENTORY.ITEMS.LIST}low_stock/`);
  }

  async getReorderNeededItems(): Promise<ApiResponse> {
    return this.get(`${API_CONFIG.ENDPOINTS.INVENTORY.ITEMS.LIST}reorder_needed/`);
  }

  async getStockSummary(): Promise<ApiResponse> {
    return this.get(`${API_CONFIG.ENDPOINTS.INVENTORY.ITEMS.LIST}stock_summary/`);
  }

  async adjustStock(itemId: string, adjustmentData: {
    quantity: number;
    movement_type: string;
    reference?: string;
    notes?: string;
  }): Promise<ApiResponse> {
    return this.post(`${API_CONFIG.ENDPOINTS.INVENTORY.ITEMS.DETAIL(itemId)}adjust_stock/`, adjustmentData);
  }

  // ============================================
  // Categories Methods
  // ============================================
  
  async getCategories(params?: {
    page?: number;
    limit?: number;
    search?: string;
    is_active?: boolean;
    parent?: string;
  }): Promise<ApiResponse<PaginatedResponse<any>>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.is_active !== undefined) queryParams.append('is_active', params.is_active.toString());
    if (params?.parent) queryParams.append('parent', params.parent);

    const endpoint = `${API_CONFIG.ENDPOINTS.INVENTORY.CATEGORIES.LIST}?${queryParams.toString()}`;
    return this.get(endpoint);
  }

  async getCategory(id: string): Promise<ApiResponse> {
    return this.get(API_CONFIG.ENDPOINTS.INVENTORY.CATEGORIES.DETAIL(id));
  }

  async createCategory(categoryData: any): Promise<ApiResponse> {
    return this.post(API_CONFIG.ENDPOINTS.INVENTORY.CATEGORIES.CREATE, categoryData);
  }

  async updateCategory(id: string, categoryData: any): Promise<ApiResponse> {
    return this.put(API_CONFIG.ENDPOINTS.INVENTORY.CATEGORIES.UPDATE(id), categoryData);
  }

  async deleteCategory(id: string): Promise<ApiResponse> {
    return this.delete(API_CONFIG.ENDPOINTS.INVENTORY.CATEGORIES.DELETE(id));
  }

  // ============================================
  // Movements Methods
  // ============================================
  
  async getMovements(params?: {
    page?: number;
    limit?: number;
    search?: string;
    item?: string;
    movement_type?: string;
    reference_type?: string;
  }): Promise<ApiResponse<PaginatedResponse<any>>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.item) queryParams.append('item', params.item);
    if (params?.movement_type) queryParams.append('movement_type', params.movement_type);
    if (params?.reference_type) queryParams.append('reference_type', params.reference_type);

    const endpoint = `${API_CONFIG.ENDPOINTS.INVENTORY.MOVEMENTS.LIST}?${queryParams.toString()}`;
    return this.get(endpoint);
  }

  async getMovement(id: string): Promise<ApiResponse> {
    return this.get(API_CONFIG.ENDPOINTS.INVENTORY.MOVEMENTS.DETAIL(id));
  }

  async createMovement(movementData: any): Promise<ApiResponse> {
    return this.post(API_CONFIG.ENDPOINTS.INVENTORY.MOVEMENTS.CREATE, movementData);
  }

  async updateMovement(id: string, movementData: any): Promise<ApiResponse> {
    return this.put(API_CONFIG.ENDPOINTS.INVENTORY.MOVEMENTS.UPDATE(id), movementData);
  }

  async deleteMovement(id: string): Promise<ApiResponse> {
    return this.delete(API_CONFIG.ENDPOINTS.INVENTORY.MOVEMENTS.DELETE(id));
  }

  async getMovementsByItem(itemId: string): Promise<ApiResponse> {
    return this.get(`${API_CONFIG.ENDPOINTS.INVENTORY.MOVEMENTS.LIST}by_item/?item_id=${itemId}`);
  }
}

