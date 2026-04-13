# Environment Configuration Guide

## Overview
Production-grade environment setup for Premiso deployment.

## Required Secrets

### Stripe (Payment Processing)
```env
STRIPE_SECRET_KEY=sk_live_xxxxx  # Live secret key from Stripe Dashboard
STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx  # For client-side use only
STRIPE_WEBHOOK_SECRET=whsec_xxxxx  # For webhook signature verification
```

### Authentication & Security
```env
JWT_SECRET=your_super_secret_key_minimum_32_chars  # Rotate every 90 days
JWT_REFRESH_SECRET=another_secret_key_minimum_32_chars
SESSION_SECRET=session_secret_minimum_32_chars
ENCRYPTION_KEY=encryption_key_for_sensitive_data  # 32-byte hex string
```

### Database
```env
DATABASE_URL=postgresql://user:password@host:5432/premiso_prod
DATABASE_POOL_MIN=5
DATABASE_POOL_MAX=20
DATABASE_STATEMENT_CACHE_SIZE=100
DATABASE_SSL=true  # Always use SSL in production
```

### Cache & Real-time
```env
REDIS_URL=redis://default:password@host:6379/0
REDIS_MAX_RETRIES=3
REDIS_RETRY_DELAY=100
```

### Email & Communications
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=SG.xxxxx  # SendGrid API key
SMTP_FROM=noreply@premiso.co.uk
SMTP_FROM_NAME=Premiso

# Twilio (SMS - optional)
TWILIO_ACCOUNT_SID=ACxxxxx
TWILIO_AUTH_TOKEN=xxxxx
TWILIO_PHONE_NUMBER=+441234567890
TWILIO_ENABLED=false  # Set to true when verified
```

### Error Tracking & Monitoring
```env
SENTRY_DSN=https://xxxx@sentry.io/xxxxx
SENTRY_ENVIRONMENT=production
SENTRY_TRACES_SAMPLE_RATE=0.1  # 10% of transactions
SENTRY_RELEASE=v2.0.0

# APM (Application Performance Monitoring)
APM_SERVICE_NAME=premiso-prod
APM_SERVER_URL=https://apm.elastic.co
APM_SECRET_TOKEN=xxxxx
```

### Accounting Integrations
```env
XERO_CLIENT_ID=xxxxx
XERO_CLIENT_SECRET=xxxxx
XERO_ENABLED=false  # Wait for UAT

QUICKBOOKS_REALM_ID=xxxxx
QUICKBOOKS_CLIENT_ID=xxxxx
QUICKBOOKS_CLIENT_SECRET=xxxxx
QUICKBOOKS_ENABLED=false

SAGE_API_KEY=xxxxx
SAGE_ENABLED=false
```

### File Storage
```env
AWS_REGION=eu-west-2
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
AWS_S3_BUCKET=premiso-prod-files
AWS_S3_UPLOAD_TIMEOUT=300
AWS_S3_MAX_FILE_SIZE=104857600  # 100MB
```

### Compliance & Legal
```env
GDPR_ENABLED=true
DATA_RETENTION_DAYS=2555  # 7 years for UK tax
DATA_DELETION_ENABLED=true
AUDIT_LOGGING_ENABLED=true
```

### Feature Flags
```env
FEATURE_BULK_IMPORT=true
FEATURE_TAX_REPORTS=true
FEATURE_FINANCIAL_REPORTING=true
FEATURE_ACCOUNTING_SYNC=false  # UAT in progress
FEATURE_SMS_ALERTS=false  # Ready after SMS provider test
FEATURE_MAINTENANCE_PHOTOS=true
FEATURE_INSPECTION_REPORTS=true
FEATURE_CERTIFICATE_TRACKING=true
```

### Rate Limiting
```env
RATE_LIMIT_ENABLED=true
RATE_LIMIT_WINDOW_MS=60000  # 1 minute
RATE_LIMIT_MAX_REQUESTS=100  # Standard user
RATE_LIMIT_ADMIN_REQUESTS=500
RATE_LIMIT_BURST=150  # Allow 50% burst
```

### API Configuration
```env
API_BASE_URL=https://api.premiso.co.uk
API_TIMEOUT=30000  # 30 seconds
API_RETRY_ATTEMPTS=3
CORS_ORIGINS=https://app.premiso.co.uk,https://landlord.premiso.co.uk,https://contractor.premiso.co.uk
CORS_CREDENTIALS=true
```

### Application
```env
NODE_ENV=production
PORT=3000
LOG_LEVEL=info  # error, warn, info, debug
ENVIRONMENT=production
TIMEZONE=UTC

# Version & Deployment
APP_VERSION=2.0.0
BUILD_DATE=2026-04-13
BUILD_COMMIT=abc123def456
DEPLOYMENT_REGION=eu-west-2
```

## Environment Setup Steps

### 1. Production Database Setup
```bash
# Create database
createdb -U postgres premiso_prod

# Apply migrations
npm run migrate:prod

# Create backups user
createuser -U postgres backups --no-superuser
GRANT CONNECT ON DATABASE premiso_prod TO backups;

# Enable SSL
psql -U postgres -d premiso_prod -c "SELECT version();"
```

### 2. Redis Setup
```bash
# Start Redis with auth
redis-server --requirepass "your_redis_password" \
  --appendonly yes \
  --appendfsync everysec

# Test connection
redis-cli -a "your_redis_password" ping
```

### 3. AWS S3 Setup
```bash
# Create bucket
aws s3 mb s3://premiso-prod-files --region eu-west-2

# Set lifecycle policy (archive after 90 days)
aws s3api put-bucket-lifecycle-configuration \
  --bucket premiso-prod-files \
  --lifecycle-configuration file://s3-lifecycle.json

# Enable versioning
aws s3api put-bucket-versioning \
  --bucket premiso-prod-files \
  --versioning-configuration Status=Enabled

# Block public access
aws s3api put-public-access-block \
  --bucket premiso-prod-files \
  --public-access-block-configuration \
  "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true"
```

### 4. SSL Certificate Setup
```bash
# Using Let's Encrypt (recommended)
certbot certonly --standalone -d api.premiso.co.uk -d app.premiso.co.uk

# Deploy to load balancer
aws elbv2 create-listener \
  --load-balancer-arn arn:aws:elasticloadbalancing:... \
  --protocol HTTPS \
  --port 443 \
  --certificates CertificateArn=arn:aws:acm:...
```

### 5. Load Balancer Configuration
```nginx
# nginx.conf example
upstream app_backend {
  least_conn;  # Load balancing algorithm
  server app1.internal:3000 max_fails=3 fail_timeout=30s;
  server app2.internal:3000 max_fails=3 fail_timeout=30s;
  server app3.internal:3000 max_fails=3 fail_timeout=30s;
  keepalive 32;
}

server {
  listen 443 ssl http2;
  server_name api.premiso.co.uk;

  # SSL configuration
  ssl_certificate /etc/letsencrypt/live/api.premiso.co.uk/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/api.premiso.co.uk/privkey.pem;
  ssl_protocols TLSv1.2 TLSv1.3;
  ssl_ciphers HIGH:!aNULL:!MD5;

  # Rate limiting
  limit_req_zone $binary_remote_addr zone=api_limit:10m rate=100r/m;
  limit_req zone=api_limit burst=50 nodelay;

  location / {
    proxy_pass http://app_backend;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_http_version 1.1;
    proxy_set_header Connection "";
  }
}
```

### 6. Monitoring Setup
```bash
# Install Prometheus agent
wget https://github.com/prometheus/node_exporter/releases/...
./node_exporter --collector.filesystem --collector.diskstats

# Configure ELK Stack (Elasticsearch, Logstash, Kibana)
# Filebeat sends logs to Logstash → Elasticsearch → Kibana visualization
```

### 7. Backup Configuration
```bash
# Daily automated backup script
0 2 * * * /scripts/backup-database.sh
0 3 * * * /scripts/backup-files-s3.sh

# Test restore weekly
0 4 * * 0 /scripts/test-restore.sh
```

## Verification Checklist

### Security
- [ ] All secrets in .env, not in code
- [ ] HTTPS enforced (HSTS headers)
- [ ] CORS whitelist configured
- [ ] Database SSL enabled
- [ ] Redis auth required
- [ ] API key rotation scheduled
- [ ] Rate limiting active
- [ ] Audit logging enabled

### Performance
- [ ] Database connection pool tuned
- [ ] Redis cache warming
- [ ] CDN configured for static assets
- [ ] Compression enabled (gzip)
- [ ] Database indexes created
- [ ] Slow query logging enabled

### Reliability
- [ ] Automated backups running
- [ ] Backup restore tested
- [ ] Health checks configured
- [ ] Monitoring alerts active
- [ ] Error tracking enabled
- [ ] Log aggregation working
- [ ] Load balancer health checks passing

### Compliance
- [ ] Privacy policy linked
- [ ] Terms of service reviewed
- [ ] GDPR consent banner active
- [ ] Cookie policy configured
- [ ] Data retention policy set
- [ ] Audit logging verified

## Rotating Secrets (Every 90 Days)

```bash
# 1. Generate new secret
NEW_JWT_SECRET=$(openssl rand -hex 32)

# 2. Deploy with both old and new secrets
JWT_SECRET_OLD=$JWT_SECRET
JWT_SECRET_NEW=$NEW_JWT_SECRET

# 3. Monitor for issues (24 hours)
# 4. Remove old secret
JWT_SECRET=$NEW_JWT_SECRET

# 5. Restart application
systemctl restart premiso-app
```

## Disaster Recovery

### RTO: 1 hour | RPO: 15 minutes

```bash
# Test recovery procedure monthly
./scripts/disaster-recovery-test.sh

# Steps to restore:
1. Stop application servers
2. Restore database from latest backup
3. Restore files from S3 backup
4. Verify data consistency
5. Restart application servers
6. Run smoke tests
7. Monitor for 30 minutes
```

---
Last Updated: 2026-04-13
Maintained by: DevOps Team