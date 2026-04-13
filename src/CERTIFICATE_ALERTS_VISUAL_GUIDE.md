# Certificate Expiry Alerts - Visual User Guide

## 🎯 Quick Navigation

### Where to Find It
```
Dashboard → Compliance → Certificate Compliance
                            ↓
                    "Configure Alerts" button (top right)
```

## 📸 Interface Overview

### Certificate Compliance Page

```
┌─────────────────────────────────────────────────────────────┐
│ Certificate Compliance                          [+ Add Cert] │
│ 6 safety certificates tracked                   [🔔 Configure Alerts] │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  [🔴 2 Expired] [🟠 3 Expiring Soon]                         │
│                                                               │
│  Search: [__________] Type: [All ▼] Status: [All ▼]          │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Gas Safety (CP12)                        [🟠 28 days] │   │
│  │ Property: 123 Main Street                            │   │
│  │ Expires: 15 May 2026 | Cert: GS-2024-123             │   │
│  │                                           [⋮] [📥]   │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Electrical (EICR)                       [🟢 180 days] │   │
│  │ Property: 45 High Street                             │   │
│  │ Expires: 10 Oct 2026 | Cert: EICR-2024-456           │   │
│  │                                           [⋮] [📥]   │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### Alert Configuration Dialog

```
┌──────────────────────────────────────────────────────────┐
│ 🔔 Configure Certificate Expiry Alerts                   │
├──────────────────────────────────────────────────────────┤
│ ℹ️ Alert Configuration                                    │
│ Set thresholds and notification preferences...            │
│                                                          │
│ ┌────────────────────────────────────────────────────┐  │
│ │ Alert Rule #1                         [Enabled ✓]  │  │
│ ├────────────────────────────────────────────────────┤  │
│ │ Certificate Type: [All Certificates ▼]             │  │
│ │ Alert Threshold:  [60] days before expiry          │  │
│ │                                                     │  │
│ │ ☑ Email Notifications    ☑ Dashboard Alerts        │  │
│ │                                                     │  │
│ │ Recipients:                                         │  │
│ │ ☑ Property Manager     ☑ Compliance Officer        │  │
│ │ ☐ Maintenance Team     ☐ Landlord                  │  │
│ │ ☐ Custom Email                                    │  │
│ └────────────────────────────────────────────────────┘  │
│                                                          │
│ ┌────────────────────────────────────────────────────┐  │
│ │ Alert Rule #2                         [Enabled ✓]  │  │
│ ├────────────────────────────────────────────────────┤  │
│ │ Certificate Type: [Gas Safety (CP12) ▼]            │  │
│ │ Alert Threshold:  [30] days before expiry          │  │
│ │                                                     │  │
│ │ ☑ Email Notifications    ☑ Dashboard Alerts        │  │
│ │                                                     │  │
│ │ Recipients:                                         │  │
│ │ ☑ Property Manager     ☑ Compliance Officer        │  │
│ │ ☑ Maintenance Team     ☐ Landlord                  │  │
│ └────────────────────────────────────────────────────┘  │
│                                                          │
│ [+ Add Another Alert Rule]                               │
│                                                          │
│                        [Cancel]  [💾 Save Configuration] │
└──────────────────────────────────────────────────────────┘
```

### Dashboard Widget

```
┌──────────────────────────────────────────────────────────┐
│ 🔔 Certificate Expiry Alerts              [View All >]  │
│ 5 pending · 2 acknowledged                               │
├──────────────────────────────────────────────────────────┤
│                                                          │
│ ❌ Critical (2)                                          │
│ ┌────────────────────────────────────────────────────┐  │
│ │ Gas Safety                    [28d]                │  │
│ │ Expires: 15 May 2026                               │  │
│ │                                          [>]       │  │
│ └────────────────────────────────────────────────────┘  │
│ ┌────────────────────────────────────────────────────┐  │
│ │ Fire Safety                   [5d]                 │  │
│ │ Expires: 20 Apr 2026                               │  │
│ │                                          [>]       │  │
│ └────────────────────────────────────────────────────┘  │
│                                                          │
│ ⚠️ Warning (3)                                           │
│ ┌────────────────────────────────────────────────────┐  │
│ │ Electrical (EICR)             [21d]                │  │
│ │ Expires: 10 May 2026                               │  │
│ │                                          [>]       │  │
│ └────────────────────────────────────────────────────┘  │
│                                                          │
│ [View All 5 Alerts]                                      │
└──────────────────────────────────────────────────────────┘
```

## 🎨 Color Coding System

### Urgency Levels
- 🔴 **Red (Critical)**: 0-7 days - Immediate action required
- 🟠 **Orange (Warning)**: 8-30 days - Schedule renewal soon
- 🔵 **Blue (Upcoming)**: 31-60 days - Plan ahead
- 🟢 **Green (Valid)**: 60+ days - No action needed yet
- ⚫ **Black (Expired)**: Past expiry date - Compliance issue

### Status Badges
- 🟢 **Valid**: Certificate is current
- 🟠 **Expiring Soon**: Within alert threshold
- 🔴 **Expired**: Past expiry date
- ⚪ **Pending**: Awaiting renewal

## 📋 Step-by-Step Workflows

### Workflow 1: Setting Up Alerts (First Time)

```
Step 1: Navigate to Compliance
┌─────────────────────────────────────┐
│ Main Menu                           │
│ ├─ Dashboard                        │
│ ├─ Properties                       │
│ ├─ Tenants                          │
│ └─ Compliance  ◄── Click here      │
└─────────────────────────────────────┘

Step 2: Open Alert Configuration
┌─────────────────────────────────────┐
│ Certificate Compliance              │
│                                     │
│ [Configure Alerts]  ◄── Click here │
└─────────────────────────────────────┘

Step 3: Review Default Rules
┌─────────────────────────────────────┐
│ Alert Rule #1 [Enabled]             │
│ ├─ Type: All Certificates           │
│ ├─ Threshold: 60 days               │
│ ├─ Email: ✓                         │
│ └─ Recipients: Property Manager     │
│                                     │
│ Alert Rule #2 [Enabled]             │
│ ├─ Type: Gas Safety                 │
│ ├─ Threshold: 30 days               │
│ ├─ Email: ✓                         │
│ └─ Recipients: Property Manager,    │
│                Compliance Officer   │
└─────────────────────────────────────┘

Step 4: Customize (Optional)
- Adjust thresholds
- Add/remove recipients
- Enable/disable rules
- Add certificate-specific rules

Step 5: Save Configuration
┌─────────────────────────────────────┐
│ [Cancel]  [💾 Save Configuration]   │
│           ◄── Click to activate    │
└─────────────────────────────────────┘

✓ Configuration Saved!
```

### Workflow 2: Responding to an Alert

```
Step 1: See Alert on Dashboard
┌─────────────────────────────────────┐
│ 🔔 Certificate Expiry Alerts        │
│                                     │
│ ❌ Critical (1)                     │
│ ┌──────────────────────────────┐   │
│ │ Gas Safety           [5d]    │   │
│ │ Expires: 20 Apr 2026         │   │
│ │                      [>]     │   │
│ └──────────────────────────────┘   │
└─────────────────────────────────────┘

Step 2: Click Alert to Navigate
┌─────────────────────────────────────┐
│ Certificate Compliance              │
└─────────────────────────────────────┘

Step 3: Locate Certificate
┌─────────────────────────────────────┐
│ Gas Safety (CP12)          [🟠 5d]  │
│ Property: 123 Main St               │
│ Expires: 20 Apr 2026                │
│                                     │
│ [Download] [Edit] [⋮]               │
└─────────────────────────────────────┘

Step 4: Take Action
Options:
A) Contact engineer for renewal
B) Upload new certificate
C) Edit existing record
D) Add notes

Step 5: Update Certificate
┌─────────────────────────────────────┐
│ Edit Certificate                    │
│                                     │
│ New Expiry Date: [20 Apr 2027]      │
│ New Certificate #: [GS-2025-789]    │
│ Upload Document: [Choose File]      │
│                                     │
│ [Save Certificate]                  │
└─────────────────────────────────────┘

Step 6: Alert Resolved
✓ Certificate updated
✓ Alert automatically cleared
✓ Dashboard updated
```

### Workflow 3: Email Notification Flow

```
Daily at 9:00 AM
       ↓
Automated Check Runs
       ↓
Finds Certificate Expiring in 28 Days
       ↓
Creates Alert Record
       ↓
Sends Email to Recipients
       ↓
┌─────────────────────────────────────┐
│ To: property.manager@example.com    │
│ Subject: Certificate Expiry Alert   │
│                                     │
│ URGENT: Certificate Expiry Alert    │
│                                     │
│ Type: Gas Safety Certificate        │
│ Property: 123 Main Street           │
│ Expires: 20 May 2026                │
│ Days Until Expiry: 28               │
│                                     │
│ ACTION REQUIRED:                    │
│ Please arrange renewal...           │
└─────────────────────────────────────┘
       ↓
Recipient Reads Email
       ↓
Logs into System
       ↓
Navigates to Certificate
       ↓
Arranges Renewal
```

## ⚙️ Configuration Examples

### Example 1: Simple Setup (Small Portfolio)
```
Single Rule:
├─ Type: All Certificates
├─ Threshold: 60 days
├─ Email: ✓
├─ Dashboard: ✓
└─ Recipients: Property Manager
```

### Example 2: Comprehensive Setup (Large Portfolio)
```
Rule 1 - Early Warning:
├─ Type: All Certificates
├─ Threshold: 90 days
├─ Email: ✗
├─ Dashboard: ✓
└─ Recipients: Property Manager

Rule 2 - Standard Alert:
├─ Type: Gas Safety
├─ Threshold: 60 days
├─ Email: ✓
├─ Dashboard: ✓
└─ Recipients: Property Manager, Compliance Officer

Rule 3 - Critical Alert:
├─ Type: Gas Safety
├─ Threshold: 30 days
├─ Email: ✓
├─ Dashboard: ✓
└─ Recipients: All stakeholders

Rule 4 - Electrical Specific:
├─ Type: Electrical (EICR)
├─ Threshold: 90 days
├─ Email: ✓
├─ Dashboard: ✓
└─ Recipients: Maintenance Team
```

## 🎯 Best Practices

### DO ✅
- Set multiple thresholds (90, 60, 30 days)
- Include multiple recipients for critical certificates
- Review dashboard alerts daily
- Acknowledge alerts after taking action
- Update certificates promptly after renewal
- Use custom emails for external stakeholders

### DON'T ❌
- Set thresholds too low (<14 days)
- Rely on a single notification method
- Ignore critical alerts
- Forget to update renewed certificates
- Add too many recipients (alert fatigue)
- Use personal email addresses

## 📊 Alert Status Lifecycle

```
Certificate Created
       ↓
Days Count Down
       ↓
Reaches Threshold (e.g., 60 days)
       ↓
Alert Generated (Status: pending)
       ↓
Email Sent (Status: sent)
       ↓
User Views Alert
       ↓
User Takes Action
       ↓
User Acknowledges (Status: acknowledged)
       ↓
Certificate Renewed
       ↓
Alert Auto-Resolved
```

## 🔍 Finding Information

### Where to See...

**Pending Alerts**
→ Dashboard → Certificate Expiry Alerts widget

**Alert Configuration**
→ Compliance → Certificate Compliance → Configure Alerts

**Alert History**
→ Compliance → Certificate Compliance → View all alerts

**Certificate Details**
→ Compliance → Certificate Compliance → Certificate list

**Email Notifications**
→ Check email inbox of configured recipients

**Automation Status**
→ Dashboard → Code → Automations → "Daily Certificate Expiry Check"

---

**Quick Reference:**
- 📍 Location: Compliance → Certificate Compliance
- ⏰ Schedule: Daily at 9:00 AM
- 📧 Delivery: Email + Dashboard
- 🎨 Urgency: Red (Critical), Orange (Warning), Blue (Upcoming)
- ✅ Action: Acknowledge after taking action