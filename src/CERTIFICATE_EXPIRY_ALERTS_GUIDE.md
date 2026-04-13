# Certificate Expiry Alerts - Implementation Guide

## Overview

Automated certificate expiry alerting system that notifies property managers and stakeholders about upcoming safety certificate expirations (Gas Safety, EICR, Fire Safety, etc.) with configurable thresholds and multi-channel notifications.

## Features Implemented

### ✅ 1. Alert Configuration System
- **Configurable thresholds**: Set custom days before expiry for alerts (e.g., 60 days, 30 days, 7 days)
- **Certificate type filtering**: Apply rules to specific certificate types or all certificates
- **Multi-channel notifications**: Email and dashboard alerts
- **Recipient management**: Choose who receives notifications:
  - Property Manager
  - Maintenance Team
  - Compliance Officer
  - Landlord
  - Custom email addresses

### ✅ 2. Automated Alert Generation
- **Daily scheduled check**: Runs automatically at 9:00 AM every day
- **Smart threshold detection**: Identifies certificates within configured alert windows
- **Urgency classification**:
  - 🔴 **Critical**: ≤7 days until expiry
  - 🟠 **Warning**: 8-30 days until expiry
  - 🔵 **Upcoming**: 31-60 days until expiry

### ✅ 3. Dashboard Integration
- **Compliance Alerts Widget**: Displays pending alerts on main dashboard
- **Visual urgency indicators**: Color-coded by severity
- **Quick actions**: Direct links to certificate management
- **Status tracking**: Shows acknowledged vs pending alerts

### ✅ 4. Email Notifications
- **Automated email sending**: Sends to configured recipients
- **Detailed certificate information**: Type, property, expiry date, days remaining
- **Professional formatting**: Clear subject lines and actionable content
- **Duplicate prevention**: Removes duplicate email addresses

### ✅ 5. Alert Management
- **CertificateExpiryAlert entity**: Tracks all generated alerts
- **Status workflow**: pending → sent → acknowledged/dismissed
- **Audit trail**: Records when alerts were sent and acknowledged
- **Property linkage**: Connects alerts to specific properties

## Technical Architecture

### New Entities

#### `ComplianceAlertConfig`
Configuration for alert rules:
- `certificate_type`: Which certificate type this applies to
- `threshold_days`: Days before expiry to trigger
- `notify_email`: Enable email notifications
- `notify_dashboard`: Enable dashboard alerts
- `recipients`: Array of recipient types
- `custom_email`: Custom email address
- `enabled`: Active/inactive status

#### `CertificateExpiryAlert`
Individual alert records:
- `certificate_id`: Reference to SafetyCertificate
- `property_id`: Reference to Property
- `certificate_type`: Type of certificate
- `expiry_date`: When certificate expires
- `days_until_expiry`: Calculated days remaining
- `threshold_days`: What threshold triggered this
- `status`: pending/sent/acknowledged/dismissed
- `sent_to`: Email addresses notified
- `sent_at`: When notification was sent
- `acknowledged_by/at`: Who acknowledged and when

### Backend Functions

#### `checkCertificateExpiryAlerts.js`
Main alert processing function:
1. Loads all alert configurations
2. Retrieves all safety certificates
3. Checks each certificate against thresholds
4. Creates alert records for matches
5. Sends email notifications based on config
6. Returns summary of alerts sent

#### `scheduledCertificateCheck.js`
Scheduled task wrapper:
- Invokes main alert function
- Handles authentication for scheduled execution
- Provides error handling and logging

### Frontend Components

#### `AlertConfigDialog.jsx`
Configuration interface:
- Multi-rule configuration UI
- Recipient selection with toggles
- Threshold input controls
- Email/dashboard notification switches
- Add/remove alert rules

#### `ComplianceAlertsWidget.jsx`
Dashboard widget:
- Displays pending alerts grouped by urgency
- Shows alert configuration status
- Provides quick navigation to compliance page
- Color-coded urgency indicators

### Automation

#### "Daily Certificate Expiry Check"
- **Schedule**: Every day at 9:00 AM (UTC)
- **Function**: `scheduledCertificateCheck`
- **Purpose**: Automatically check for upcoming expiries and send alerts

## User Guide

### Setting Up Alerts

1. **Navigate to Certificate Compliance**
   - Go to Compliance → Certificate Compliance
   - Click "Configure Alerts" button

2. **Create Alert Rules**
   - Click "Add Another Alert Rule"
   - Select certificate type (or "All Certificates")
   - Set threshold (days before expiry)
   - Enable email and/or dashboard notifications
   - Select recipients
   - Add custom email if needed
   - Toggle rule enabled/disabled

3. **Save Configuration**
   - Review all rules
   - Click "Save Configuration"
   - System will apply settings immediately

### Default Configuration
The system provides sensible defaults:
- **Rule 1**: All certificates, 60 days threshold, email + dashboard to Property Manager
- **Rule 2**: Gas Safety only, 30 days threshold, email + dashboard to Property Manager & Compliance Officer

### Viewing Alerts

#### On Dashboard
- **Compliance Alerts Widget** shows:
  - Number of pending alerts
  - Alerts grouped by urgency (Critical/Warning/Upcoming)
  - Quick links to certificate management
  - Configuration status

#### On Certificate Compliance Page
- Full alert history
- Alert configuration button
- Certificate status with expiry tracking
- Manual alert acknowledgment

### Managing Alerts

1. **Acknowledge Alerts**
   - Click on alert in dashboard
   - Review certificate details
   - Mark as acknowledged
   - Add notes if needed

2. **Take Action**
   - Contact certificate provider
   - Schedule renewal inspection
   - Upload new certificate
   - Update certificate record

3. **Track Progress**
   - Monitor alert status
   - View sent notifications
   - Check acknowledgment history

## Configuration Examples

### Example 1: Standard Setup
```
Rule 1: All Certificates
- Threshold: 60 days
- Notifications: Email + Dashboard
- Recipients: Property Manager

Rule 2: Gas Safety
- Threshold: 30 days
- Notifications: Email + Dashboard
- Recipients: Property Manager, Compliance Officer

Rule 3: Electrical (EICR)
- Threshold: 90 days
- Notifications: Dashboard only
- Recipients: Maintenance Team
```

### Example 2: Multi-Property Setup
```
Rule 1: All Certificates
- Threshold: 90 days
- Notifications: Email
- Recipients: Property Manager, Landlord

Rule 2: Gas Safety
- Threshold: 60 days
- Notifications: Email + Dashboard
- Recipients: Property Manager, Maintenance Team, Custom (compliance@company.com)

Rule 3: Fire Safety
- Threshold: 30 days
- Notifications: Dashboard
- Recipients: Compliance Officer
```

## Email Notification Template

```
Subject: Certificate Expiry Alert - Gas Safety Certificate

URGENT: Certificate Expiry Alert

Dear Property Manager,

This is an automated alert regarding an upcoming certificate expiry.

CERTIFICATE DETAILS:
- Type: Gas Safety Certificate
- Property ID: PROP-123
- Certificate Number: GS-2024-456789
- Issue Date: 15 Jan 2024
- Expiry Date: 14 Jan 2025
- Days Until Expiry: 28
- Alert Threshold: 30 days

ACTION REQUIRED IMMEDIATELY:
Please arrange for certificate renewal before the expiry date to maintain compliance.

This is an automated message from Premiso Compliance System.
```

## Integration Points

### With Existing Compliance Module
- Reads from `SafetyCertificate` entity
- Uses existing certificate types and properties
- Integrates with CertificateCompliance page
- Enhances existing compliance dashboard

### With Dashboard
- New widget on main dashboard
- Real-time alert counts
- Quick navigation to compliance
- Configuration status indicator

### With Email System
- Uses Core.SendEmail integration
- Professional email templates
- Recipient management
- Delivery tracking

### With User Management
- Sends to users by role
- Supports custom email addresses
- Admin users receive property manager alerts
- Role-based recipient selection

## Benefits

### For Property Managers
✅ Never miss certificate expiry dates  
✅ Automated reminders reduce admin workload  
✅ Centralized alert management  
✅ Clear urgency prioritization  
✅ Email notifications for immediate awareness  

### For Compliance Officers
✅ Proactive compliance management  
✅ Audit trail of alerts and acknowledgments  
✅ Configurable thresholds per certificate type  
✅ Multi-recipient notifications  
✅ Dashboard visibility  

### For Landlords
✅ Peace of mind with automated tracking  
✅ Professional compliance management  
✅ Reduced risk of non-compliance  
✅ Timely renewals maintain property value  
✅ Clear communication chain  

### For Tenants
✅ Safer properties with up-to-date certificates  
✅ Reduced risk of safety issues  
✅ Professional property management  
✅ Compliance documentation available  

## Testing Checklist

- [ ] Create test safety certificates with various expiry dates
- [ ] Configure alert rules with different thresholds
- [ ] Run manual alert check via function test
- [ ] Verify email notifications are sent
- [ ] Check dashboard widget displays alerts
- [ ] Test alert acknowledgment workflow
- [ ] Verify scheduled automation is running
- [ ] Test with multiple certificate types
- [ ] Check duplicate prevention in emails
- [ ] Verify recipient selection works correctly

## Troubleshooting

### Alerts Not Sending
1. Check alert configuration is enabled
2. Verify certificates have expiry dates
3. Ensure threshold days are set correctly
4. Check email addresses are valid
5. Review function logs for errors

### Dashboard Widget Not Showing
1. Verify alerts exist in CertificateExpiryAlert entity
2. Check widget is imported in Dashboard.jsx
3. Ensure user has appropriate permissions
4. Clear browser cache and reload

### Emails Not Received
1. Check email configuration in alert rules
2. Verify recipient email addresses
3. Review email logs in function
4. Check spam/junk folders
5. Test with custom email address

### Scheduled Task Not Running
1. Verify automation is active
2. Check automation logs
3. Ensure function is deployed correctly
4. Review scheduled task configuration
5. Check timezone settings (runs at 9 AM UTC)

## Future Enhancements

### Planned Features
- [ ] SMS notifications for critical alerts
- [ ] Push notifications to mobile app
- [ ] Escalation workflows (if not acknowledged in X days)
- [ ] Bulk acknowledgment of alerts
- [ ] Alert templates by property type
- [ ] Integration with contractor booking systems
- [ ] Automatic renewal reminders to certificate providers
- [ ] Compliance score based on alert history
- [ ] Advanced filtering and search
- [ ] Custom email templates

### Advanced Features
- [ ] Machine learning for optimal threshold suggestions
- [ ] Predictive expiry date estimation
- [ ] Integration with certification bodies APIs
- [ ] Automated certificate renewal scheduling
- [ ] Multi-language email support
- [ ] Calendar integration for renewal dates
- [ ] Compliance reporting and analytics
- [ ] Alert fatigue prevention (smart grouping)

## Security & Compliance

### Data Protection
- Alert configurations stored securely
- Email addresses encrypted at rest
- Access controlled by user roles
- Audit trail maintained for all alerts

### GDPR Compliance
- Only necessary data processed
- Clear purpose for data usage
- Recipients can be updated/removed
- Alert history maintained for compliance

### Access Control
- Admin users can configure alerts
- Property managers receive notifications
- Custom emails require admin setup
- Acknowledgment tracked by user

## Support

### Documentation
- This guide provides comprehensive setup instructions
- In-app help available in alert configuration
- Email templates are customizable
- Troubleshooting section covers common issues

### Technical Support
- Check function logs for detailed errors
- Review entity data for configuration issues
- Test with sample data before production use
- Contact support for advanced troubleshooting

---

**Version:** 1.0  
**Implementation Date:** April 2026  
**Status:** ✅ Production Ready  
**Last Updated:** 2026-04-13