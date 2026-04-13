# Production Deployment & Release Guide

## Pre-Deployment Checklist

### Code Quality
- [ ] All tests passing (E2E, unit)
- [ ] No console errors/warnings
- [ ] Code review completed
- [ ] Linting passed
- [ ] Security scanning completed
- [ ] Performance benchmarks met

### Infrastructure
- [ ] Staging environment matches production
- [ ] Database backups configured
- [ ] Disaster recovery plan documented
- [ ] Monitoring/alerting active
- [ ] Load balancing configured
- [ ] CDN cache strategy set

### Documentation
- [ ] API rate limits documented
- [ ] Admin onboarding guide complete
- [ ] User help docs published
- [ ] Change log updated
- [ ] Rollback procedures documented
- [ ] Incident response plan reviewed

### Secrets & Configuration
- [ ] Production secrets in .env
- [ ] No secrets in version control
- [ ] CORS headers configured
- [ ] SSL/TLS certificate valid
- [ ] API keys rotated recently
- [ ] Third-party API credentials verified

### Compliance
- [ ] GDPR data processing verified
- [ ] Data retention policies set
- [ ] Privacy notice updated
- [ ] Terms of service reviewed
- [ ] Audit logging enabled
- [ ] Encryption in transit confirmed

## Critical Path (Complete First)

### 1. Security Hardening
```bash
# Rate limiting
- Implement IP-based rate limits (100 req/min standard, 500 req/min admin)
- Configure DDoS protection
- Enable API key rotation (90 days)
- Set up token expiry monitoring

# Access Control
- Enable 2FA for all admin accounts
- Configure role-based permissions
- Implement audit logging for sensitive actions
- Set up session timeouts (30 min inactivity)

# Data Protection
- Enable encryption at rest
- Verify HTTPS enforced
- Configure backup encryption
- Set up data retention purges
```

### 2. Monitoring & Alerting
```bash
# Error Tracking
- Deploy error collector (errorCollector.js)
- Set up Sentry/Rollbar integration
- Create error dashboards
- Configure critical alerts

# Performance Monitoring
- Set up APM (Application Performance Monitoring)
- Create latency dashboards
- Configure slow query alerts
- Monitor database connection pool

# Uptime Monitoring
- Set up ping monitoring
- Configure status page
- Create incident alerts
- Set up on-call escalation
```

### 3. Backup & Disaster Recovery
```bash
# Database Backups
- Configure daily automated backups
- Test restore procedures
- Store backups in separate region
- Implement 30-day retention

# Disaster Recovery
- Document RTO (Recovery Time Objective): 1 hour
- Document RPO (Recovery Point Objective): 15 minutes
- Test failover procedures monthly
- Maintain runbooks for common issues
```

### 4. Environment Configuration
```bash
# Production Secrets (.env)
STRIPE_SECRET_KEY=sk_live_xxxxx
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
JWT_SECRET=xxxxx (rotate every 90 days)
SENTRY_DSN=https://...
SMTP_PASSWORD=xxxxx
TWILIO_AUTH_TOKEN=xxxxx

# Feature Flags
ENABLE_BULK_IMPORT=true
ENABLE_TAX_REPORTS=true
ENABLE_ACCOUNTING_SYNC=false (until verified)
ENABLE_SMS_ALERTS=false (until SMS provider verified)
```

### 5. Database Optimization
```sql
-- Create indexes for common queries
CREATE INDEX idx_properties_company ON property(owning_company);
CREATE INDEX idx_tenants_property ON tenant(property_id);
CREATE INDEX idx_transactions_date ON financial_transaction(transaction_date);
CREATE INDEX idx_maintenance_status ON maintenance_request(status);
CREATE INDEX idx_audit_log_user ON audit_log(user_email);
CREATE INDEX idx_error_log_timestamp ON error_log(timestamp);

-- Partition large tables by date for faster queries
ALTER TABLE financial_transaction PARTITION BY RANGE (YEAR(transaction_date));
ALTER TABLE audit_log PARTITION BY RANGE (YEAR(created_date));
```

## Deployment Steps

### 1. Pre-Flight (1 hour before)
```bash
# Confirm all systems healthy
./scripts/health-check.sh

# Notify stakeholders
- Send deployment notification email
- Update status page (Maintenance Mode)
- Brief support team on known issues

# Final code review
- Verify all PR approvals
- Check rollback plan ready
```

### 2. Deploy Code (15 minutes)
```bash
# Option A: Blue-Green Deployment (recommended)
1. Deploy to secondary (green) server
2. Run smoke tests on green
3. Verify database migrations successful
4. Switch load balancer to green
5. Monitor green for 5 minutes
6. Scale down blue (keep for 1 hour)

# Option B: Canary Deployment
1. Deploy to 10% of servers
2. Monitor error rate & latency
3. Gradually roll out to 50%
4. Then 100% if no issues detected
```

### 3. Database Migrations
```bash
# If required, run before code deploy
1. Backup production database
2. Run migration scripts in order
3. Verify no data loss
4. Confirm indexes created
5. Update connection strings if needed
```

### 4. Post-Deployment Verification
```bash
# Automated smoke tests (run immediately)
- Login as admin user
- Create test property
- View dashboard
- Export financial report
- Test rent payment flow

# Manual QA (30 minutes)
- Test on multiple browsers
- Test on mobile
- Check email notifications
- Verify SMS delivery (if enabled)
- Check API response times
```

## Monitoring (First 24 hours)

### Immediate (First 1 hour)
- Monitor error rates (target: < 1%)
- Check response times (p95 < 2 sec)
- Verify no database connection issues
- Monitor server CPU/memory (< 70%)
- Check failed login attempts

### Hourly (First 8 hours)
- Review user feedback/bug reports
- Check for unusual traffic patterns
- Monitor payment processing
- Verify email/SMS delivery
- Check file upload functionality

### Daily (First 7 days)
- Daily error rate analysis
- User adoption metrics
- Performance trend analysis
- Compliance audit log review
- Database performance review

## Rollback Procedures

### Immediate Rollback (Critical Issue)
```bash
# If system down or critical bug detected:
1. Alert on-call lead
2. Switch load balancer back to previous version
3. Notify users of incident
4. Begin root cause analysis
5. Prepare communication

Estimated time: 5-15 minutes
```

### Gradual Rollback (Performance Issue)
```bash
# If performance degraded but not critical:
1. Switch 50% traffic back to previous version
2. Monitor metrics for 15 minutes
3. If improved, continue rollback
4. Investigate cause in staging
5. Plan fix and re-deploy
```

### Database Rollback
```bash
# If migration caused issues:
1. Stop application servers
2. Restore database from backup (taken before deploy)
3. Verify restore completed
4. Restart application servers
5. Re-test functionality
```

## Release Notes Template

```
# Premiso v2.0.0 - Released 2026-04-13

## Breaking Changes
- Deprecated API endpoint /v1/reports (use /v2/reports)
- Changed auth token format (old tokens invalid after 7 days)

## New Features
✨ Financial Reporting Module
  - Monthly cash flow statements
  - Property profit/loss analysis
  - Tax-ready summaries
  - CSV/PDF exports

✨ Enhanced Compliance Dashboard
  - Real-time certificate tracking
  - Automated renewal reminders
  - Deposit protection verification

## Bug Fixes
🐛 Fixed maintenance status not updating
🐛 Fixed CSV export encoding issues
🐛 Fixed tenant portal mobile layout

## Performance
⚡ 30% faster report generation
⚡ 50% reduction in API response time
⚡ Improved search indexing

## Security
🔒 Implemented rate limiting
🔒 Enhanced audit logging
🔒 Improved token security

## Breaking Changes for Integrations
- Xero sync format changed (migration guide: docs/xero-v2-migration.md)

## Upgrade Path
- No manual migration needed
- Automatic data transformation on first login
- Expected downtime: 0 minutes (blue-green deployment)

## Known Issues
- SMS notifications delayed by 2-3 minutes (provider issue)
- Some reports slow with >10,000 transactions (index query ongoing)

## Support
- Release notes: github.com/premiso/premiso/releases/v2.0.0
- Issues: support@premiso.co.uk
- Status: status.premiso.co.uk
```

## Post-Release (First Week)

### Day 1
- [ ] Monitor all error logs
- [ ] Collect initial user feedback
- [ ] Verify all payment processing working
- [ ] Check email delivery

### Days 2-3
- [ ] Analyze user adoption metrics
- [ ] Review performance trends
- [ ] Process user feedback
- [ ] Plan hotfix if needed

### Days 4-7
- [ ] Conduct retrospective meeting
- [ ] Document lessons learned
- [ ] Update runbooks based on issues
- [ ] Plan next iteration

## Incident Response

### On-Call Rotation
- Business hours: 09:00-17:00 UK time
- After hours: On-call lead (rotated weekly)
- Response SLA: 15 minutes
- Resolution SLA: 2 hours (critical), 4 hours (high)

### Incident Communication
- Alert to #ops-incidents Slack channel
- Create incident ticket (Jira/Linear)
- Update status page every 15 minutes
- Post-incident review within 24 hours

### Common Issues & Solutions
See [INCIDENT_RESPONSE_GUIDE.md](./INCIDENT_RESPONSE_GUIDE.md)

---
Last Updated: 2026-04-13
Deployment Lead: Engineering Team