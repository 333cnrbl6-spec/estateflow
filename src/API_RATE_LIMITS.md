# API Rate Limits & Security Guidelines

## Overview
Premiso implements rate limiting to protect infrastructure and ensure fair usage across all users.

## Rate Limit Tiers

### Standard User
- **Requests per minute**: 100
- **Concurrent requests**: 10
- **Bulk operations**: 5,000 records/batch
- **Export size limit**: 100MB/month

### Admin User
- **Requests per minute**: 500
- **Concurrent requests**: 50
- **Bulk operations**: 50,000 records/batch
- **Export size limit**: Unlimited

## Endpoint-Specific Limits

### Authentication
- Login attempts: 5 per minute
- Token refresh: 30 per minute
- Password reset requests: 3 per hour

### Data Operations
- List endpoints: 100 req/min
- Create/Update: 50 req/min
- Delete: 10 req/min
- Bulk import: 5 req/min
- Export: 10 req/min

### Reporting & Analytics
- Report generation: 20 req/min
- Dashboard queries: 100 req/min
- Chart data: 200 req/min

### Third-party Integrations
- Accounting sync: 10 req/min
- Webhook delivery: Rate limited by provider
- File uploads: 1GB/day per user

## Rate Limit Headers

All API responses include:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1681234567
```

## Handling Rate Limits

### 429 Too Many Requests
When you exceed the limit:
1. HTTP Status: `429 Too Many Requests`
2. Retry-After header indicates seconds to wait
3. Request is rejected and not processed

### Best Practices
```javascript
// Implement exponential backoff
async function retryWithBackoff(fn, maxAttempts = 3) {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (error.status === 429 && attempt < maxAttempts) {
        const delayMs = Math.pow(2, attempt) * 1000;
        await new Promise(r => setTimeout(r, delayMs));
      } else {
        throw error;
      }
    }
  }
}
```

## DDoS Protection

### Implemented Safeguards
- IP-based rate limiting (temporary blocks for suspicious patterns)
- Request signature validation
- Geographic anomaly detection
- Automatic rate adjustment for bulk operations

### Suspicious Activity Triggers
- 1000+ requests/minute from single IP
- Rapid login failures (>10 attempts)
- Multiple simultaneous sessions from different IPs
- Unusual geographic access patterns

## Token Security

### Access Token Limits
- Issued: 24 hours
- Refresh window: 12 hours before expiry
- Revocation: Immediate on logout
- Max tokens per user: 5 active

### Tenant/Contractor Tokens
- Contractor portal tokens: 7 days (read-only)
- Tenant portal tokens: 30 days (limited scope)
- Single-use action tokens: 1 hour

## API Keys (Backend)
- Production: Rotated every 90 days
- Staging: Rotated every 30 days
- Never commit to version control
- Store in environment variables only
- IP whitelisting recommended for webhooks

## Monitoring & Alerts

### Alerts Triggered On:
- User exceeds rate limit 5+ times in 1 hour
- API error rate > 5% of requests
- Response time > 2 seconds (p95)
- Failed authentication attempts > 10/hour

### Admin Dashboard
- Real-time request metrics
- User quota usage
- Rate limit violations log
- Bulk operation queue status

## Quota Reset Schedule
- Per-minute limits: Reset every 60 seconds
- Per-day limits: Reset at 00:00 UTC
- Monthly limits: Reset on 1st of month

## Escalation Process
1. **Soft limit (70%)**: Warning notification
2. **Hard limit (100%)**: Requests rejected with 429
3. **Abuse detected**: IP/user temporarily blocked
4. **Persistent abuse**: Account review + suspension risk

## Contact Support
- Rate limit issues: support@premiso.co.uk
- Legitimate high-volume needs: Submit quota increase request
- Security concerns: security@premiso.co.uk

---
Last Updated: 2026-04-13