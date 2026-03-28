import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import { base44 } from '@/api/base44Client';

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should provide authenticated user context', async () => {
    const mockUser = { id: 'user-123', email: 'test@example.com', role: 'admin' };
    base44.auth.me.mockResolvedValue(mockUser);

    const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;
    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoadingAuth).toBe(false);
    });

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.isAuthenticated).toBe(true);
  });

  it('should handle authentication errors', async () => {
    base44.auth.me.mockRejectedValue(new Error('Unauthorized'));

    const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;
    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoadingAuth).toBe(false);
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.authError).toBeTruthy();
  });

  it('should provide logout function', async () => {
    base44.auth.me.mockResolvedValue({ id: 'user-123' });

    const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;
    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoadingAuth).toBe(false);
    });

    act(() => {
      result.current.logout();
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(base44.auth.logout).toHaveBeenCalled();
  });
});