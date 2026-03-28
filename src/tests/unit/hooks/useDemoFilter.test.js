import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useDemoFilter } from '@/hooks/useDemoFilter';
import { base44 } from '@/api/base44Client';

describe('useDemoFilter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should load demo context when user has current_demo_company_id', async () => {
    base44.auth.me.mockResolvedValue({
      id: 'user-123',
      current_demo_company_id: 'company-456'
    });
    base44.entities.Property.filter.mockResolvedValue([
      { id: 'prop-1', owning_company: 'company-456' },
      { id: 'prop-2', owning_company: 'company-456' }
    ]);

    const { result } = renderHook(() => useDemoFilter());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.demoCompanyId).toBe('company-456');
    expect(result.current.propertyIds).toEqual(['prop-1', 'prop-2']);
  });

  it('should return null for demoCompanyId when user has no demo context', async () => {
    base44.auth.me.mockResolvedValue({ id: 'user-123' });

    const { result } = renderHook(() => useDemoFilter());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.demoCompanyId).toBeNull();
    expect(result.current.propertyIds).toBeNull();
  });

  it('should handle errors gracefully', async () => {
    base44.auth.me.mockRejectedValue(new Error('Auth failed'));

    const { result } = renderHook(() => useDemoFilter());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.demoCompanyId).toBeNull();
  });
});