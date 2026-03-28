import { vi } from 'vitest';
import { QueryClient } from '@tanstack/react-query';

// Mock Base44 SDK
vi.mock('@/api/base44Client', () => ({
  base44: {
    auth: {
      me: vi.fn(() => Promise.resolve({
        id: 'user-123',
        email: 'test@example.com',
        full_name: 'Test User',
        role: 'admin'
      })),
      isAuthenticated: vi.fn(() => Promise.resolve(true)),
      redirectToLogin: vi.fn(),
      logout: vi.fn(),
      updateMe: vi.fn()
    },
    entities: {
      Company: {
        list: vi.fn(() => Promise.resolve([])),
        get: vi.fn((id) => Promise.resolve({ id, name: 'Test Company' })),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn()
      },
      Property: {
        list: vi.fn(() => Promise.resolve([])),
        filter: vi.fn(() => Promise.resolve([])),
        get: vi.fn(),
        create: vi.fn(),
        update: vi.fn()
      },
      Unit: {
        list: vi.fn(() => Promise.resolve([])),
        filter: vi.fn(() => Promise.resolve([])),
        get: vi.fn()
      },
      Tenant: {
        list: vi.fn(() => Promise.resolve([])),
        filter: vi.fn(() => Promise.resolve([])),
        get: vi.fn()
      },
      OutOfHoursCall: {
        list: vi.fn(() => Promise.resolve([])),
        filter: vi.fn(() => Promise.resolve([])),
        get: vi.fn(),
        create: vi.fn(),
        update: vi.fn()
      },
      MaintenanceOrder: {
        list: vi.fn(() => Promise.resolve([])),
        filter: vi.fn(() => Promise.resolve([])),
        create: vi.fn(),
        update: vi.fn()
      },
      FinancialTransaction: {
        list: vi.fn(() => Promise.resolve([])),
        filter: vi.fn(() => Promise.resolve([]))
      },
      ServiceCharge: {
        list: vi.fn(() => Promise.resolve([])),
        filter: vi.fn(() => Promise.resolve([]))
      }
    },
    functions: {
      invoke: vi.fn()
    },
    analytics: {
      track: vi.fn()
    }
  }
}));

// Setup React Query
global.queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false }
  }
});

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});