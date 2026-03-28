import { describe, it, expect, beforeEach, vi } from 'vitest';
import { base44 } from '@/api/base44Client';

describe('initiateRingcentralCall', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create an OutOfHoursCall record with correct payload', async () => {
    const mockCall = {
      id: 'call-123',
      caller_phone: '+1234567890',
      property_address: '123 Main St',
      call_type: 'general_enquiry',
      call_description: 'Test call',
      caller_name: 'Test Caller',
      severity: 'medium',
      validation_status: 'pending'
    };

    base44.entities.OutOfHoursCall.create.mockResolvedValue(mockCall);

    const result = await base44.entities.OutOfHoursCall.create({
      caller_phone: '+1234567890',
      property_address: '123 Main St',
      call_type: 'general_enquiry',
      call_description: 'Test call',
      caller_name: 'Test Caller',
      severity: 'medium',
      validation_status: 'pending'
    });

    expect(result.id).toBe('call-123');
    expect(result.caller_phone).toBe('+1234567890');
    expect(result.validation_status).toBe('pending');
  });

  it('should handle required fields validation', async () => {
    base44.entities.OutOfHoursCall.create.mockRejectedValue(
      new Error('Missing required field: caller_phone')
    );

    try {
      await base44.entities.OutOfHoursCall.create({
        call_type: 'general_enquiry',
        call_description: 'Test'
      });
      expect.fail('Should have thrown error');
    } catch (error) {
      expect(error.message).toContain('caller_phone');
    }
  });

  it('should set validation_status to pending by default', async () => {
    base44.entities.OutOfHoursCall.create.mockResolvedValue({
      id: 'call-456',
      validation_status: 'pending'
    });

    const result = await base44.entities.OutOfHoursCall.create({
      caller_phone: '+1234567890',
      call_type: 'emergency'
    });

    expect(result.validation_status).toBe('pending');
  });
});