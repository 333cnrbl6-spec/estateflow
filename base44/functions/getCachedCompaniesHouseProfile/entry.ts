/**
 * getCachedCompaniesHouseProfile — Fetch company data with caching
 * Returns cached result if fresh, otherwise syncs with Companies House
 * TTL: 1 hour (company info doesn't change frequently)
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import { z } from 'npm:zod@3.24.2';

const RequestSchema = z.object({
  company_number: z.string().min(6),
  forceRefresh: z.boolean().optional().default(false),
});

const CACHE_TTL = 3600000; // 1 hour
const inMemoryCache = new Map(); // Simple in-memory cache

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let body;
    try {
      body = await req.json();
    } catch {
      return Response.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    const validation = RequestSchema.safeParse(body);
    if (!validation.success) {
      const errors = validation.error.errors.map(e => `${e.path.join('.')}: ${e.message}`);
      return Response.json({ error: 'Validation failed', details: errors }, { status: 400 });
    }

    const { company_number, forceRefresh } = validation.data;

    // Check cache
    if (!forceRefresh && inMemoryCache.has(company_number)) {
      const cached = inMemoryCache.get(company_number);
      if (Date.now() - cached.timestamp < CACHE_TTL) {
        return Response.json({ ...cached.data, cached: true });
      }
    }

    // Fetch from database
    const profiles = await base44.asServiceRole.entities.CompaniesHouseProfile.filter(
      { company_number }
    );

    if (!profiles || profiles.length === 0) {
      return Response.json({ error: 'Company not found' }, { status: 404 });
    }

    const profile = profiles[0];

    // Update cache
    inMemoryCache.set(company_number, {
      data: profile,
      timestamp: Date.now(),
    });

    return Response.json({ ...profile, cached: false });
  } catch (error) {
    console.error('[getCachedCompaniesHouseProfile]', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});