/**
 * New Features API Integration Tests
 * Tests API integration for Tax Optimization, Treasury, FX Conversion, Vendor Verification,
 * ERP Integration, Gnosis Safe, and Coinbase Prime
 */

import { TokenManager } from '@/lib/api-client';
import API_CONFIG from '@/lib/api-config';

// Create mock axios instance that will be shared
let mockAxiosInstance: {
  get: jest.Mock;
  post: jest.Mock;
  put: jest.Mock;
  patch: jest.Mock;
  delete: jest.Mock;
  interceptors: {
    request: { use: jest.Mock; eject: jest.Mock };
    response: { use: jest.Mock; eject: jest.Mock };
  };
};

// Mock axios module BEFORE importing services
jest.mock('axios', () => {
  const actualAxios = jest.requireActual('axios');
  
  // Create the mock instance inside the factory
  const instance = {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
    interceptors: {
      request: { use: jest.fn(), eject: jest.fn() },
      response: { use: jest.fn(), eject: jest.fn() },
    },
  };
  
  // Store in module scope for test access
  (jest.mock as any).__mockAxiosInstance = instance;
  
  return {
    ...actualAxios,
    default: {
      ...actualAxios.default,
      create: jest.fn(() => instance),
      post: jest.fn(),
    },
    create: jest.fn(() => instance),
  };
});

// Import services AFTER mocking axios
import {
  taxOptimizationService,
  treasuryService,
  fxConversionService,
  vendorVerificationService,
  erpIntegrationService,
  gnosisSafeService,
  coinbasePrimeService,
} from '@/lib/api-services';
import axios from 'axios';

// Get the mock instance - axios.create() returns our mock instance
const getMockInstance = () => {
  const createMock = (axios.create as jest.Mock);
  return createMock.mock.results[0]?.value || createMock();
};

mockAxiosInstance = getMockInstance();

describe('New Features API Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    TokenManager.getInstance().clearTokens();
    TokenManager.getInstance().setTokens('mock-access-token', 'mock-refresh-token', 3600);
    
    // Reset all mock functions
    mockAxiosInstance.get.mockClear();
    mockAxiosInstance.post.mockClear();
    mockAxiosInstance.put.mockClear();
    mockAxiosInstance.patch.mockClear();
    mockAxiosInstance.delete.mockClear();
  });

  // Helper function to mock successful API response
  const mockSuccessResponse = (data: any) => ({
    data: { data, success: true },
    status: 200,
    statusText: 'OK',
    headers: {},
    config: {},
  });

  // Helper function to mock paginated response
  const mockPaginatedResponse = (results: any[], count = results.length, page = 1, limit = 10) => ({
    data: {
      data: {
        results,
        count,
        page,
        limit,
        total_pages: Math.ceil(count / limit),
      },
      success: true,
    },
    status: 200,
    statusText: 'OK',
    headers: {},
    config: {},
  });

  // Helper function to mock error response
  const mockErrorResponse = (status: number, message: string) => ({
    response: {
      data: { error: message, success: false },
      status,
      statusText: 'Error',
      headers: {},
      config: {},
    },
    isAxiosError: true,
  });

  describe('Tax Optimization Service', () => {
    it('should fetch tax events', async () => {
      const mockEvents = [
        {
          id: '1',
          event_type: 'profit',
          amount: 1000,
          tax_year: 2024,
          event_date: '2024-01-15',
        },
      ];

      mockAxiosInstance.get.mockResolvedValueOnce(
        mockPaginatedResponse(mockEvents)
      );

      const result = await taxOptimizationService.getTaxEvents({ page: 1, limit: 10 });

      expect(result.success).toBe(true);
      expect(result.data.results).toHaveLength(1);
      expect(mockAxiosInstance.get).toHaveBeenCalledWith(
        expect.stringContaining(API_CONFIG.ENDPOINTS.TAX_OPTIMIZATION.EVENTS.LIST),
        undefined
      );
    });

    it('should create a tax event', async () => {
      const newEvent = {
        event_type: 'loss',
        amount: 500,
        tax_year: 2024,
        event_date: '2024-01-20',
      };

      mockAxiosInstance.post.mockResolvedValueOnce(
        mockSuccessResponse({ id: '2', ...newEvent })
      );

      const result = await taxOptimizationService.createTaxEvent(newEvent);

      expect(result.success).toBe(true);
      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        expect.stringContaining(API_CONFIG.ENDPOINTS.TAX_OPTIMIZATION.EVENTS.CREATE),
        newEvent,
        undefined
      );
    });

    it('should fetch tax strategies', async () => {
      const mockStrategies = [
        {
          id: '1',
          strategy_type: 'loss_harvesting',
          title: 'Harvest Crypto Losses',
          priority: 'high',
          potential_savings: 5000,
        },
      ];

      mockAxiosInstance.get.mockResolvedValueOnce(
        mockPaginatedResponse(mockStrategies)
      );

      const result = await taxOptimizationService.getTaxStrategies({ taxYear: 2024 });

      expect(result.success).toBe(true);
      expect(result.data.results).toHaveLength(1);
    });

    it('should detect tax events automatically', async () => {
      mockAxiosInstance.post.mockResolvedValueOnce(
        mockSuccessResponse({ events_detected: 5 })
      );

      const result = await taxOptimizationService.detectTaxEvents({
        startDate: '2024-01-01',
        endDate: '2024-01-31',
      });

      expect(result.success).toBe(true);
    });

    it('should handle tax optimization errors', async () => {
      mockAxiosInstance.get.mockRejectedValueOnce(
        mockErrorResponse(400, 'Invalid tax year')
      );

      try {
        await taxOptimizationService.getTaxEvents({ taxYear: 1999 });
        expect(true).toBe(false); // Should not reach here
      } catch (error: any) {
        expect(error).toBeDefined();
        expect(error.status).toBeGreaterThanOrEqual(400);
      }
    });
  });

  describe('Treasury Service', () => {
    it('should fetch unified balances', async () => {
      const mockBalances = {
        total_usd_value: 100000,
        fiat_total: 60000,
        crypto_total_usd: 40000,
        net_change_30d: 5000,
        assets: [
          { id: '1', type: 'fiat', name: 'USD Account', balance: 60000, usd_value: 60000 },
          { id: '2', type: 'crypto', name: 'ETH', balance: 10, usd_value: 40000 },
        ],
      };

      mockAxiosInstance.get.mockResolvedValueOnce(
        mockSuccessResponse(mockBalances)
      );

      const result = await treasuryService.getUnifiedBalances();

      expect(result.success).toBe(true);
      expect(result.data.total_usd_value).toBe(100000);
      expect(mockAxiosInstance.get).toHaveBeenCalledWith(
        expect.stringContaining(API_CONFIG.ENDPOINTS.TREASURY.UNIFIED),
        undefined
      );
    });

    it('should fetch historical balances', async () => {
      const mockHistorical = [
        { date: '2024-01-01', total: 95000 },
        { date: '2024-01-02', total: 98000 },
      ];

      mockAxiosInstance.get.mockResolvedValueOnce(
        mockSuccessResponse(mockHistorical)
      );

      const result = await treasuryService.getHistoricalBalances({
        startDate: '2024-01-01',
        endDate: '2024-01-31',
      });

      expect(result.success).toBe(true);
      expect(Array.isArray(result.data)).toBe(true);
    });

    it('should calculate runway', async () => {
      mockAxiosInstance.get.mockResolvedValueOnce(
        mockSuccessResponse({ months: 12, burn_rate: 5000 })
      );

      const result = await treasuryService.getRunway({ burnRate: 5000 });

      expect(result.success).toBe(true);
      expect(result.data.months).toBe(12);
    });
  });

  describe('FX Conversion Service', () => {
    it('should get exchange rate', async () => {
      mockAxiosInstance.get.mockResolvedValueOnce(
        mockSuccessResponse({
          from: 'USD',
          to: 'EUR',
          rate: 0.85,
          lastUpdated: new Date().toISOString(),
          provider: 'ExchangeRate-API',
        })
      );

      const result = await fxConversionService.getExchangeRate('USD', 'EUR');

      expect(result.success).toBe(true);
      expect(result.data.rate).toBe(0.85);
      expect(mockAxiosInstance.get).toHaveBeenCalledWith(
        expect.stringContaining(API_CONFIG.ENDPOINTS.FX_CONVERSION.RATE),
        undefined
      );
    });

    it('should convert currency', async () => {
      mockAxiosInstance.post.mockResolvedValueOnce(
        mockSuccessResponse({
          fromCurrency: 'USD',
          toCurrency: 'EUR',
          amount: 100,
          convertedAmount: 85,
          rate: 0.85,
        })
      );

      const result = await fxConversionService.convertCurrency({
        fromCurrency: 'USD',
        toCurrency: 'EUR',
        amount: 100,
      });

      expect(result.success).toBe(true);
      expect(result.data.convertedAmount).toBe(85);
    });

    it('should get supported currencies', async () => {
      mockAxiosInstance.get.mockResolvedValueOnce(
        mockSuccessResponse({ currencies: ['USD', 'EUR', 'GBP', 'JPY'] })
      );

      const result = await fxConversionService.getSupportedCurrencies();

      expect(result.success).toBe(true);
      expect(Array.isArray(result.data.currencies)).toBe(true);
    });

    it('should update exchange rates', async () => {
      mockAxiosInstance.post.mockResolvedValueOnce(
        mockSuccessResponse({ rates_updated: 50 })
      );

      const result = await fxConversionService.updateRates();

      expect(result.success).toBe(true);
    });
  });

  describe('Vendor Verification Service', () => {
    it('should register vendor wallet', async () => {
      mockAxiosInstance.post.mockResolvedValueOnce(
        mockSuccessResponse({
          id: '1',
          supplier_id: 'supplier-1',
          wallet_address: '0x123...',
          network: 'ethereum',
          status: 'pending',
        })
      );

      const result = await vendorVerificationService.registerWallet('supplier-1', {
        walletAddress: '0x123...',
        network: 'ethereum',
      });

      expect(result.success).toBe(true);
      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        expect.stringContaining(API_CONFIG.ENDPOINTS.VENDOR_VERIFICATION.REGISTER_WALLET('supplier-1')),
        expect.objectContaining({
          walletAddress: '0x123...',
          network: 'ethereum',
        }),
        undefined
      );
    });

    it('should verify wallet address', async () => {
      mockAxiosInstance.post.mockResolvedValueOnce(
        mockSuccessResponse({
          verified: true,
          risk_score: 25,
          transaction_history_count: 10,
        })
      );

      const result = await vendorVerificationService.verifyWallet('supplier-1', {
        walletAddress: '0x123...',
        network: 'ethereum',
      });

      expect(result.success).toBe(true);
      expect(result.data.verified).toBe(true);
    });

    it('should get vendor wallets', async () => {
      const mockWallets = [
        {
          id: '1',
          supplier_name: 'Supplier A',
          wallet_address: '0x123...',
          status: 'verified',
          risk_score: 25,
        },
      ];

      mockAxiosInstance.get.mockResolvedValueOnce(
        mockPaginatedResponse(mockWallets)
      );

      const result = await vendorVerificationService.getVendorWallets();

      expect(result.success).toBe(true);
      expect(result.data.results).toHaveLength(1);
    });

    it('should check payment before processing', async () => {
      mockAxiosInstance.post.mockResolvedValueOnce(
        mockSuccessResponse({
          allowed: false,
          blocked: true,
          reason: 'High risk score detected',
          risk_score: 85,
        })
      );

      const result = await vendorVerificationService.checkPaymentBeforeProcessing({
        supplierId: 'supplier-1',
        amount: 1000,
        currency: 'USD',
      });

      expect(result.success).toBe(true);
      expect(result.data.blocked).toBe(true);
    });

    it('should get payment blocks', async () => {
      const mockBlocks = [
        {
          id: '1',
          supplier_name: 'Supplier A',
          amount: 1000,
          currency: 'USD',
          reason: 'High risk score',
          status: 'active',
        },
      ];

      mockAxiosInstance.get.mockResolvedValueOnce(
        mockPaginatedResponse(mockBlocks)
      );

      const result = await vendorVerificationService.getPaymentBlocks();

      expect(result.success).toBe(true);
    });
  });

  describe('ERP Integration Service', () => {
    it('should create ERP connection', async () => {
      mockAxiosInstance.post.mockResolvedValueOnce(
        mockSuccessResponse({
          id: '1',
          provider: 'quickbooks',
          name: 'My QuickBooks',
          status: 'connected',
        })
      );

      const result = await erpIntegrationService.createErpConnection({
        provider: 'quickbooks',
        name: 'My QuickBooks',
        config: {
          client_id: 'client-id',
          client_secret: 'secret',
        },
      });

      expect(result.success).toBe(true);
      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        expect.stringContaining(API_CONFIG.ENDPOINTS.ERP_INTEGRATION.CONNECTIONS.CREATE),
        expect.any(Object),
        undefined
      );
    });

    it('should sync ERP connection', async () => {
      mockAxiosInstance.post.mockResolvedValueOnce(
        mockSuccessResponse({
          sync_id: 'sync-1',
          status: 'in_progress',
          records_synced: 0,
        })
      );

      const result = await erpIntegrationService.syncErpConnection('conn-1', {
        syncType: 'full',
        entities: ['invoices', 'contacts'],
      });

      expect(result.success).toBe(true);
    });

    it('should get sync logs', async () => {
      const mockLogs = [
        {
          id: '1',
          connection_name: 'QuickBooks',
          sync_type: 'full',
          status: 'success',
          records_synced: 150,
        },
      ];

      mockAxiosInstance.get.mockResolvedValueOnce(
        mockPaginatedResponse(mockLogs)
      );

      const result = await erpIntegrationService.getSyncLogs();

      expect(result.success).toBe(true);
      expect(result.data.results).toHaveLength(1);
    });
  });

  describe('Gnosis Safe Service', () => {
    it('should create Gnosis Safe', async () => {
      mockAxiosInstance.post.mockResolvedValueOnce(
        mockSuccessResponse({
          id: '1',
          address: '0xabc...',
          network: 'ethereum',
          threshold: 2,
          owners: ['0x123...', '0x456...'],
        })
      );

      const result = await gnosisSafeService.createSafe({
        address: '0xabc...',
        network: 'ethereum',
        threshold: 2,
        owners: ['0x123...', '0x456...'],
      });

      expect(result.success).toBe(true);
      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        expect.stringContaining(API_CONFIG.ENDPOINTS.GNOSIS_SAFE.SAFES.CREATE),
        expect.any(Object),
        undefined
      );
    });

    it('should create transaction', async () => {
      mockAxiosInstance.post.mockResolvedValueOnce(
        mockSuccessResponse({
          id: 'tx-1',
          safe_id: 'safe-1',
          to: '0x789...',
          value: '1.0',
          status: 'pending',
          confirmations: 0,
          required_confirmations: 2,
        })
      );

      const result = await gnosisSafeService.createTransaction({
        safeId: 'safe-1',
        to: '0x789...',
        value: '1.0',
      });

      expect(result.success).toBe(true);
      expect(result.data.status).toBe('pending');
    });

    it('should confirm transaction', async () => {
      mockAxiosInstance.post.mockResolvedValueOnce(
        mockSuccessResponse({
          confirmed: true,
          confirmations: 1,
          required_confirmations: 2,
        })
      );

      const result = await gnosisSafeService.confirmTransaction('tx-1');

      expect(result.success).toBe(true);
      expect(result.data.confirmed).toBe(true);
    });

    it('should get safes list', async () => {
      const mockSafes = [
        {
          id: '1',
          name: 'My Safe',
          address: '0xabc...',
          network: 'ethereum',
          threshold: 2,
          owners: ['0x123...'],
        },
      ];

      mockAxiosInstance.get.mockResolvedValueOnce(
        mockPaginatedResponse(mockSafes)
      );

      const result = await gnosisSafeService.getSafes();

      expect(result.success).toBe(true);
      expect(result.data.results).toHaveLength(1);
    });
  });

  describe('Coinbase Prime Service', () => {
    it('should create Coinbase Prime connection', async () => {
      mockAxiosInstance.post.mockResolvedValueOnce(
        mockSuccessResponse({
          id: '1',
          status: 'connected',
        })
      );

      const result = await coinbasePrimeService.createConnection({
        apiKey: 'api-key',
        apiSecret: 'api-secret',
        passphrase: 'passphrase',
        sandbox: true,
      });

      expect(result.success).toBe(true);
      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        expect.stringContaining(API_CONFIG.ENDPOINTS.COINBASE_PRIME.CONNECTIONS.CREATE),
        expect.any(Object),
        undefined
      );
    });

    it('should get accounts', async () => {
      const mockAccounts = [
        {
          id: '1',
          account_id: 'account-1',
          currency: 'USD',
          balance: 10000,
          balance_usd: 10000,
        },
      ];

      mockAxiosInstance.get.mockResolvedValueOnce(
        mockPaginatedResponse(mockAccounts)
      );

      const result = await coinbasePrimeService.getAccounts();

      expect(result.success).toBe(true);
      expect(result.data.results).toHaveLength(1);
    });

    it('should create order', async () => {
      mockAxiosInstance.post.mockResolvedValueOnce(
        mockSuccessResponse({
          id: 'order-1',
          product_id: 'BTC-USD',
          side: 'buy',
          status: 'pending',
        })
      );

      const result = await coinbasePrimeService.createOrder({
        connectionId: 'conn-1',
        productId: 'BTC-USD',
        side: 'buy',
        orderType: 'market',
        size: 0.1,
      });

      expect(result.success).toBe(true);
      expect(result.data.status).toBe('pending');
    });

    it('should get orders', async () => {
      const mockOrders = [
        {
          id: 'order-1',
          product_id: 'BTC-USD',
          side: 'buy',
          status: 'filled',
          size: 0.1,
          price: 50000,
        },
      ];

      mockAxiosInstance.get.mockResolvedValueOnce(
        mockPaginatedResponse(mockOrders)
      );

      const result = await coinbasePrimeService.getOrders();

      expect(result.success).toBe(true);
      expect(result.data.results).toHaveLength(1);
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors', async () => {
      mockAxiosInstance.get.mockRejectedValueOnce(
        new Error('Network error')
      );

      try {
        await taxOptimizationService.getTaxEvents();
        expect(true).toBe(false); // Should not reach here
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it('should handle 401 unauthorized', async () => {
      mockAxiosInstance.get.mockRejectedValueOnce(
        mockErrorResponse(401, 'Unauthorized')
      );

      try {
        await treasuryService.getUnifiedBalances();
        expect(true).toBe(false); // Should not reach here
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it('should handle 404 not found', async () => {
      mockAxiosInstance.get.mockRejectedValueOnce(
        mockErrorResponse(404, 'Not found')
      );

      try {
        await gnosisSafeService.getSafe('invalid-id');
        expect(true).toBe(false); // Should not reach here
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it('should handle 500 server errors', async () => {
      mockAxiosInstance.get.mockRejectedValueOnce(
        mockErrorResponse(500, 'Internal server error')
      );

      try {
        await erpIntegrationService.getErpConnections();
        expect(true).toBe(false); // Should not reach here
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe('Pagination', () => {
    it('should handle paginated responses', async () => {
      const mockData = Array.from({ length: 20 }, (_, i) => ({
        id: `item-${i}`,
        name: `Item ${i}`,
      }));

      mockAxiosInstance.get.mockResolvedValueOnce(
        mockPaginatedResponse(mockData.slice(0, 10), 20, 1, 10)
      );

      const result = await taxOptimizationService.getTaxEvents({ page: 1, limit: 10 });

      expect(result.success).toBe(true);
      expect(result.data.results).toHaveLength(10);
      expect(result.data.count).toBe(20);
      expect(result.data.total_pages).toBe(2);
    });
  });
});

