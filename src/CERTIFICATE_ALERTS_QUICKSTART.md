# Certificate Expiry Alerts - Quick Start Guide

## 🚀 5-Minute Setup

### Step 1: Navigate to Compliance
1. Go to **Compliance** → **Certificate Compliance**
2. Click the **"Configure Alerts"** button (bell icon)

### Step 2: Set Up Your First Alert Rule
The system comes with sensible defaults, but you can customize:

**Recommended Configuration:**
```
Alert Rule 1: All Certificates
- Threshold: 60 days before expiry
- Enable: Email + Dashboard notifications
- Recipients: Property Manager, Compliance Officer

Alert Rule 2: Gas Safety (Critical)
- Threshold: 30 days before expiry  
- Enable: Email + Dashboard notifications
- Recipients: Property Manager, Maintenance Team
```

### Step 3: Save Configuration
- Click **"Save Configuration"**
- Your alerts are now active!

### Step 4: Check Dashboard
- Return to **Dashboard**
- You'll see the **Certificate Expiry Alerts** widget
- Shows pending alerts grouped by urgency

## 📧 How It Works

### Daily Automated Check
- **Runs automatically** at 9:00 AM every day
- Scans all safety certificates
- Identifies certificates within your alert thresholds
- Sends email notifications to configured recipients
- Creates dashboard alerts

### Alert Urgency Levels
- 🔴 **Critical** (Red): ≤7 days until expiry - immediate action needed
- 🟠 **Warning** (Amber): 8-30 days - schedule renewal soon
- 🔵 **Upcoming** (Blue): 31-60 days - plan ahead

## 🎯 Common Use Cases

### Use Case 1: Standard Property Management
**Setup:**
- Rule 1: All certificates → 60 days → Email to Property Manager
- Rule 2: Gas Safety → 30 days → Email + Dashboard to all stakeholders

**Result:**
- Get early warnings 2 months before expiry
- Critical gas safety alerts 1 month before
- Never miss renewal deadlines

### Use Case 2: Large Portfolio with Compliance Team
**Setup:**
- Rule 1: All certificates → 90 days → Dashboard only
- Rule 2: Gas Safety → 60 days → Email to Compliance Officer
- Rule 3: Electrical → 90 days → Email to Maintenance Team
- Rule 4: Fire Safety → 30 days → Email to all stakeholders

**Result:**
- Early visibility for planning
- Targeted notifications by certificate type
- Distributed responsibility across team

### Use Case 3: Landlord Direct Communication
**Setup:**
- Rule 1: All certificates → 60 days → Email to Landlord
- Rule 2: Gas Safety → 30 days → Email + SMS (future feature)
- Rule 3: Any expiring → 7 days → Email to Property Manager + Landlord

**Result:**
- Landlords stay informed
- Transparent compliance management
- Professional service delivery

## ✅ What Gets Monitored

The system tracks all certificate types:
- ✅ Gas Safety (CP12)
- ✅ Electrical Safety (EICR)
- ✅ Fire Safety Certificate
- ✅ Asbestos Survey
- ✅ Legionella Risk Assessment
- ✅ PAT Testing
- ✅ Boiler Service
- ✅ Lift Safety
- ✅ Other Safety Certificates

## 📱 Where You'll See Alerts

### 1. Dashboard Widget
**Location:** Main Dashboard  
**Shows:** 
- Total pending alerts
- Grouped by urgency (Critical/Warning/Upcoming)
- Quick links to certificate management
- Configuration status

### 2. Email Notifications
**Sent to:** Configured recipients  
**Includes:**
- Certificate type and property
- Expiry date and days remaining
- Alert threshold that triggered it
- Clear call-to-action

### 3. Certificate Compliance Page
**Location:** Compliance → Certificate Compliance  
**Features:**
- Full alert history
- Alert configuration
- Certificate management
- Manual acknowledgment

## 🔧 Customization Options

### Adjust Alert Thresholds
- Default: 30 days
- Range: 1-365 days
- Recommended: 60-90 days for early warning

### Choose Notification Channels
- ✅ Email notifications
- ✅ Dashboard alerts
- 🔜 SMS notifications (coming soon)
- 🔜 Push notifications (coming soon)

### Select Recipients
- Property Manager
- Maintenance Team
- Compliance Officer
- Landlord
- Custom email addresses

### Filter by Certificate Type
- All certificates (global rule)
- Specific types (e.g., Gas Safety only)
- Multiple rules for different types

## 📊 Example Email

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
Please arrange for certificate renewal before the expiry date.

This is an automated message from Premiso Compliance System.
```

## ⚠️ Important Notes

### Certificate Status Updates
- Alerts are generated based on `expiry_date` in SafetyCertificate entity
- Update certificates when renewed to stop alerts
- Expired certificates show as "OVERDUE" in alerts

### Email Delivery
- Emails sent via Core.SendEmail integration
- Check spam folders if not received
- Custom emails must be valid addresses

### Scheduled Task
- Runs daily at 9:00 AM UTC
- Adjust timezone in automation settings if needed
- Can run manually via function test

## 🎉 Benefits

### Reduce Admin Workload
- Automated tracking saves hours of manual checking
- No more spreadsheet monitoring
- Proactive instead of reactive

### Improve Compliance
- Never miss expiry dates
- Maintain up-to-date certificates
- Avoid penalties and safety issues

### Better Communication
- Clear notifications to right people
- Documented audit trail
- Professional stakeholder management

### Peace of Mind
- System works 24/7
- Early warnings for planning
- Centralized compliance management

## 🆘 Troubleshooting

### No Alerts Showing?
1. Check certificates have expiry dates set
2. Verify alert configuration is enabled
3. Ensure thresholds are appropriate
4. Run manual check via function test

### Emails Not Received?
1. Check recipient email addresses
2. Verify email notifications enabled
3. Review spam/junk folders
4. Test with custom email address

### Too Many Alerts?
1. Increase threshold days
2. Consolidate rules (use "All Certificates")
3. Reduce number of recipients
4. Use dashboard-only for less critical types

## 📞 Next Steps

### After Setup
1. ✅ Add your safety certificates
2. ✅ Configure alert rules
3. ✅ Test with sample data
4. ✅ Verify email delivery
5. ✅ Train your team

### Ongoing Management
- Review alerts daily on dashboard
- Acknowledge alerts when actioned
- Renew certificates before expiry
- Update configurations as needed
- Monitor compliance metrics

### Advanced Usage
- Create multiple rules for different property types
- Set up escalation workflows
- Integrate with contractor booking
- Generate compliance reports
- Track alert response times

---

**Need Help?**  
Check the full implementation guide: `CERTIFICATE_EXPIRY_ALERTS_GUIDE.md`

**Ready to Go!** 🎉  
Your automated certificate expiry alert system is now configured and running.