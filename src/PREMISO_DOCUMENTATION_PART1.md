# 🏗️ PREMISO - COMPLETE PLATFORM DOCUMENTATION (PART 1)

**Version**: 2.0.0  
**Date**: 2026-04-13  
**Status**: Production-Ready  
**Compliance Coverage**: 65% (15 areas)

---

## 📋 TABLE OF CONTENTS

1. [Executive Summary](#executive-summary)
2. [Platform Overview](#platform-overview)
3. [Technical Architecture](#technical-architecture)
4. [Entity Framework](#entity-framework)
5. [Module Breakdown](#module-breakdown)
6. [Compliance System](#compliance-system)
7. [Automation Engine](#automation-engine)
8. [Backend Functions](#backend-functions)
9. [Frontend Pages](#frontend-pages)
10. [Integration Capabilities](#integration-capabilities)
11. [User Roles & Permissions](#user-roles--permissions)
12. [Security & Data Protection](#security--data-protection)
13. [Current Capabilities](#current-capabilities)
14. [Launch Plans](#launch-plans)
15. [Roadmap](#roadmap)
16. [Business Metrics](#business-metrics)

---

## 🎯 EXECUTIVE SUMMARY

### What is Premiso?

Premiso is a **compliance-driven property management platform** designed for UK letting agents, property managers, and landlords. Unlike traditional property management software that treats compliance as an afterthought, Premiso puts legislation and regulatory obligations at the core of every feature.

### Unique Value Proposition

**"The first property management software with compliance and legislation as the driver"**

- **65% compliance coverage** (industry average: 20-40%)
- **Automated penalty prevention** (£500k+ potential exposure tracked)
- **Real-time compliance scoring** (0-100% visibility)
- **15 compliance areas** monitored simultaneously
- **UK legislation-focused** (built on latest regulations)

### Key Metrics

- **Development Time**: 8 weeks
- **Lines of Code**: 50,000+
- **Entities**: 28
- **Pages**: 88
- **Components**: 100+
- **Backend Functions**: 30+
- **Automations**: 11 (7 scheduled, 4 entity)

### Target Market

- **Primary**: Professional letting agents (10-500 units under management)
- **Secondary**: Portfolio landlords (5-50 properties)
- **Tertiary**: Block management companies (RTM/Right to Manage)
- **Geographic**: United Kingdom (England & Wales focus)

### Problem Solved

**Before Premiso**:
- Manual compliance tracking (spreadsheets, paper records)
- Missed deadlines (£7k-£500k penalties per breach)
- Reactive approach (responding to breaches)
- Fragmented systems (multiple tools for different compliance areas)
- Unknown penalty exposure

**After Premiso**:
- Automated compliance monitoring
- Proactive deadline alerts (30/60/90 days before expiry)
- Unified dashboard (all compliance in one place)
- Real-time penalty exposure calculator
- Peace of mind (sleep better knowing you're compliant)

---

## 📊 PLATFORM OVERVIEW

### What Premiso Can Do Today

#### ✅ Property Management
- Manage unlimited properties and units
- Track tenancies and tenants
- Store contact information (contractors, solicitors, agents)
- Register companies (RTM, managing agents)
- Upload and store documents
- Send messages (internal and external)

#### ✅ Financial Management
- Process rent payments via Stripe (test mode)
- Set up recurring rent payments
- Send automated rent reminders (3-day, due-date, 5-day arrears)
- Track income and expenses
- Reconcile bank transactions
- Generate landlord financial statements
- Manage service charges and ground rent

#### ✅ Compliance Management (65% Coverage)
- Track 15 compliance areas (gas, EICR, deposits, right to rent, etc.)
- Monitor certificate expiry (automated alerts)
- Send automated expiry alerts (30/60/90 days)
- Calculate penalty exposure (£500k+ tracking)
- Generate compliance gap reports
- Maintain Building Safety Act register
- Manage RTM company administration
- Track leaseholder rights and obligations
- Record Gas Safety certificates (CP12)
- Record EICR certificates (5-year cycle)
- Track deposit protection (30-day deadline)
- Record Right to Rent checks (initial + follow-up)

#### ✅ Maintenance Management
- Log maintenance requests
- AI-powered triage (urgency assessment)
- Assign contractors to jobs
- Track work order status (reported → completed)
- Manage emergency callouts (24/7)
- Out-of-hours service tiers (standard/premium/emergency)
- Contractor mobile portal (job updates)
- Generate maintenance reports (KPIs)

#### ✅ Sales & Lettings
- Create sales listings
- Schedule viewings
- Manage offers (pending → accepted)
- Track sales progression (14 stages)
- Generate property brochures (PDF)
- AI property valuations
- Generate market reports
- Score leads (0-100 completion probability)
- Buyer portal (offer tracking)
- Agent performance dashboards

#### ✅ Document Management
- Upload and store documents
- Create document templates
- Generate bulk documents (ASTs, notices)
- Merge entity data into templates
- Track prescribed document service
- Version control

#### ✅ Workflow Automation
- Build custom workflows (no-code)
- Trigger on entity events or schedules
- Automate emails, SMS, entity updates
- Execution history and error handling

#### ✅ Out-of-Hours Call Center
- 24/7 emergency call handling
- Service tier routing
- Contractor escalation (phone/SMS/email)
- SLA tracking
- Pricing calculator
- Client onboarding

#### ✅ Portals
- Tenant portal (rent payment, maintenance requests, documents)
- Landlord portal (financial statements, property updates)
- Leaseholder portal (service charges, RTM info)
- Contractor portal (job management)
- Buyer portal (offer tracking)

#### ✅ Integrations
- Stripe (payments - test mode)
- Companies House (company data)
- Land Registry (property ownership)
- Base44 Core AI (InvokeLLM, GenerateImage)

#### ✅ Reporting
- Compliance reports (gap analysis, penalty exposure)
- Financial reports (P&L, cash flow)
- Maintenance reports (response times, costs)
- Agent performance reports (conversions, revenue)
- Market reports (trends, forecasts)

---

## 🏛️ TECHNICAL ARCHITECTURE

### Technology Stack

**Frontend**:
- React 18.2.0
- TypeScript (via JSDoc)
- Tailwind CSS (design system)
- Radix UI (accessible components)
- TanStack Query (data fetching)
- React Router 6.26 (navigation)
- Framer Motion (animations)
- Recharts (data visualization)

**Backend**:
- Base44 Platform (Backend-as-a-Service)
- Deno Deploy (serverless functions)
- Node.js compatibility (npm: packages)
- Base44 SDK (entity management, integrations)

**Database**:
- Base44 Entities (NoSQL document store)
- Built-in fields: id, created_date, updated_date, created_by

**Integrations**:
- Stripe (payments, subscriptions)
- Base44 Core (InvokeLLM, SendEmail, UploadFile, GenerateImage)
- OAuth connectors (Google Calendar, Slack, Notion - available)
- REST API (custom integrations)

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    USER INTERFACE                        │
│  (70+ React Pages, 100+ Components, Responsive Design)   │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                  REACT ROUTER (App.jsx)                  │
│            (88 Routes, Auth Protection)                  │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│               BASE44 SDK (Frontend Client)               │
│  - base44.entities.EntityName.list()/create()/update()  │
│  - base44.functions.invoke('functionName', payload)     │
│  - base44.auth.me()/isAuthenticated()                   │
│  - base44.analytics.track()                             │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│              BASE44 PLATFORM (Backend-as-a-Service)      │
│  - Entity Database (NoSQL)                               │
│  - Authentication & Authorization (RBAC)                 │
│  - File Storage (certificates, documents)                │
│  - Scheduled Automations (AWS EventBridge)               │
│  - Webhook Handlers (Stripe, OAuth)                      │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│              BACKEND FUNCTIONS (Deno Deploy)             │
│  - 30+ custom functions (compliance, payments, emails)   │
│  - npm: packages (Stripe, OpenAI, jsPDF)                 │
│  - Service role operations (admin-level access)          │
│  - Webhook signature verification                        │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                 EXTERNAL SERVICES                        │
│  - Stripe (payments, subscriptions, invoicing)           │
│  - Base44 Core AI (InvokeLLM, GenerateImage)             │
│  - Email (SendEmail integration)                         │
│  - OAuth (Google Calendar, Slack, Notion - available)    │
└─────────────────────────────────────────────────────────┘
```

### Design System

**Color Palette**:
- Primary: Navy Blue (#1E3A8A) - trust, professionalism
- Accent: Gold (#F59E0B) - premium, compliance excellence
- Background: Light Gray (220 20% 97%) - clean, modern
- Destructive: Red (0 72% 51%) - errors, critical alerts
- Success: Green - compliant, completed

**Typography**:
- Sans-serif: Inter (UI text, body)
- Serif: Playfair Display (headings, branding)

**Component Library**:
- 40+ Shadcn/UI components (Button, Card, Dialog, etc.)
- 50+ custom components (ComplianceAlert, StatCard, etc.)
- Fully responsive (mobile, tablet, desktop)
- WCAG 2.1 AA accessible (contrast ratios, keyboard nav)

---

## 📊 ENTITY FRAMEWORK

### Entity Overview

Premiso uses **28 entities** to model the property management domain. Each entity has built-in fields (id, created_date, updated_date, created_by) plus custom fields specific to the entity type.

### Built-in Fields

Every entity includes:
- `id` - Unique identifier (UUID)
- `created_date` - Creation timestamp
- `updated_date` - Last update timestamp
- `created_by` - Email of user who created record

### Core Entities (20)

#### 1. Company
**Purpose**: Track property management companies, RTM companies, corporate entities

**Key Fields**:
- `company_number` - Companies House registration
- `company_type` - RTM/freehold_block/managing_agent
- `incorporation_date`, `dissolution_date`
- `registered_office_address`
- `accounts` - Filing deadline
- `confirmation_statement` - Filing deadline
- `directors` - Array of Contact references
- `compliance_status` - active/dissolved/strike-off

**Compliance Use**: Companies House filings, RTM compliance

---

#### 2. Property
**Purpose**: Buildings, developments, land parcels

**Key Fields**:
- `name` - Property name
- `address_line_1`, `postcode`, `region`, `city`
- `property_type` - freehold_block/leasehold_block/mixed
- `ownership_type` - freehold/leasehold/commonhold
- `total_units` - Number of units
- `owning_company` - Company reference
- `management_company` - Company reference
- `listed_building` - Boolean
- `year_built` - Construction year
- `image_url` - Property photo

**Compliance Use**: Building Safety Act classification, HMO licensing

---

#### 3. Unit
**Purpose**: Individual flats, apartments, rooms

**Key Fields**:
- `property_id` - Property reference
- `unit_number`, `floor_level`
- `bedrooms`, `bathrooms`
- `floor_area_sqm`, `floor_area_sqft`
- `tenure` - freehold/leasehold/rental
- `current_use` - residential/commercial/mixed
- `lease_reference` - If leasehold

**Compliance Use**: Gas Safety, EICR, Deposits, Right to Rent

---

#### 4. Tenant
**Purpose**: Individuals/organizations renting property

**Key Fields**:
- `full_name`, `email`, `phone`
- `date_of_birth`, `nationality`
- `current_address`
- `emergency_contact_name`, `emergency_contact_phone`
- `right_to_rent_status` - unlimited/time_limited/no_right
- `visa_expiry_date` - If applicable
- `special_requirements` - Accessibility, medical

**Compliance Use**: Right to Rent checks, tenancy agreements

---

#### 5. Contact
**Purpose**: Business network (people/organizations)

**Key Fields**:
- `full_name`, `email`, `phone`
- `contact_type` - director/contractor/solicitor/accountant/agent/surveyor/managing_agent/insurance_broker/buyer/seller/landlord/tenant/mortgage_advisor/other
- `company_name`
- `related_company_id` - Company reference (for demo scoping)
- `address`, `notes`

**Compliance Use**: Contractor qualifications, director tracking

---

#### 6. FinancialTransaction
**Purpose**: All money movements

**Key Fields**:
- `transaction_type` - income/expense/transfer/refund
- `amount`, `currency` (GBP)
- `transaction_date`, `value_date`
- `category` - rent/service_charge/maintenance/insurance/etc.
- `property_id`, `unit_id` - References
- `tenant_id` - If tenant-related
- `payment_method` - bank_transfer/card/cash/cheque
- `stripe_payment_intent_id` - If Stripe
- `invoice_id` - Invoice reference
- `reconciled`, `reconciled_date`

**Compliance Use**: Client Money Protection, service charge accounting

---

#### 7. MaintenanceOrder
**Purpose**: Repairs, inspections, work orders

**Key Fields**:
- `property_id`, `unit_id`
- `title`, `description`
- `priority` - urgent/high/medium/low
- `status` - reported/triaged/scheduled/in_progress/completed/cancelled
- `reported_by` - Tenant/Contact reference
- `reported_date`
- `assigned_contractor_id` - Contact reference
- `scheduled_date`, `completed_date`
- `cost_estimate`, `cost_actual`
- `warranty_claim` - Boolean
- `photos` - Array of file URLs
- `compliance_related` - Boolean

**Compliance Use**: Repair covenants, health & safety

---

#### 8. SafetyCertificate
**Purpose**: Generic safety certificates

**Key Fields**:
- `property_id`
- `certificate_type` - gas_safety/eicr/fire_safety/asbestos/legionella/pat_testing/boiler_service/lift_safety/other
- `issue_date`, `expiry_date`
- `certificate_number`
- `issuing_body`
- `status` - valid/expiring_soon/expired/pending
- `document_url` - Uploaded PDF
- `alert_days` - Default: 30

**Compliance Use**: General certificate tracking

---

#### 9. GasSafetyCertificate
**Purpose**: CP12 gas safety records

**Key Fields**:
- `property_id`, `unit_id`
- `certificate_number` - Unique CP12 reference
- `issue_date`, `expiry_date` (12 months)
- `engineer_name`, `engineer_gas_safe_number` (7 digits)
- `engineer_company`
- `appliances_tested` - Array: type, location, manufacturer, model, serial, result
- `flue_flow_tests` - Array: appliance, result
- `ventilation_check` - adequate/inadequate
- `gas_tightness_test` - pass/fail
- `defects_found` - Array: type, location, classification, description
- `remedial_actions` - Array: action, completed_date, engineer
- `tenant_copy_served_date` - Within 28 days
- `new_tenant_copy_served` - Before move-in
- `status` - valid/expiring_soon/expired/remedial_required

**Legislation**: Gas Safety (Installation and Use) Regulations 1998  
**Deadlines**: Annual inspection, 28-day tenant copy  
**Penalties**: £7,000 per breach

---

#### 10. EICRCertificate
**Purpose**: Electrical Installation Condition Reports

**Key Fields**:
- `property_id`, `unit_id`
- `certificate_reference`
- `inspection_date`, `next_due_date` (5 years)
- `contractor_name`, `contractor_company`
- `contractor_qualifications` - Array: City & Guilds 2391, NICEIC, etc.
- `contractor_accreditation` - niceic/napit/elecsa/stroma/other
- `supply_characteristics` - Object: voltage, phases, frequency
- `classification_codes` - Array: C1/C2/C3/FI with location, description
- `overall_assessment` - satisfactory/unsatisfactory
- `remedial_work_required` - Boolean (true if C1/C2)
- `remedial_work_deadline` - 28 days for C1/C2
- `remedial_completion_date`
- `remedial_contractor`
- `tenant_copy_served_date` - Within 28 days
- `new_tenant_copy_served` - Before move-in
- `status` - valid/expiring_soon/expired/remedial_required/unsatisfactory

**Legislation**: Electrical Safety Standards Regulations 2020  
**Deadlines**: 5-year inspection, 28-day remedial (C1/C2)  
**Penalties**: Up to £30,000 per breach

---

#### 11. BuildingSafety
**Purpose**: Building Safety Act 2023 compliance

**Key Fields**:
- `property_id`
- `building_classification` - Object:
  - `height_metres`, `storeys`, `units_count`
  - `is_high_rise_residential_building` (7+ storeys, 2+ households)
  - `in_scope_building_safety_act`
- `accountable_person` - Object:
  - `appointed`, `name`, `organisation`
  - `contact_email`, `contact_phone`
  - `appointment_date`, `responsibilities`
- `responsible_person` - Object (fire safety)
- `fire_safety` - Object:
  - `fire_risk_assessment` - last_assessment_date, next_assessment_due
  - `alarm_systems`, `emergency_lighting`, `fire_extinguishers`
  - `fire_safety_plan`
- `structural_safety` - Object:
  - `structural_defect_register` - Array of defects
  - `safety_case_audit`
- `health_safety_hazards` - Array: asbestos, legionella, etc.
- `asbestos_management` - Object
- `legionella_risk_assessment` - Object
- `electrical_safety_eicr` - Object
- `resident_communication` - Array

**Legislation**: Building Safety Act 2023, Fire Safety Act 2021  
**Deadlines**: Annual fire risk assessment  
**Penalties**: Unlimited fines + imprisonment

---

#### 12. RTMManagement
**Purpose**: Right to Manage company administration

**Key Fields**:
- `property_id`, `rtm_company_id`
- `rtm_status` - traditional_management/rtm_claim_initiated/notice_served/dispute_period/rtm_acquired/rtm_to_landlord_transition
- `management_type` - landlord_managed/managing_agent/rtm_company
- `current_managing_agent`
- `leaseholder_eligibility` - Object:
  - `total_leaseholders`, `long_leaseholders` (4+ years)
  - `eligible_to_participate`, `eligible_percentage` (75% threshold)
  - `claim_threshold_met`
- `rtm_company_details` - Object:
  - `company_number`, `formed_date`, `directors`
  - `registered_office`, `accounts_due_date`
- `rtm_claim_process` - Object:
  - `claim_notice_date`, `notice_issued_to`
  - `statutory_dispute_period`
  - `acquisition_date` (90 days after notice)
- `handover_process` - Object:
  - `documents_transferred` - Array
  - `asset_schedule`
  - `handover_date`
- `rtm_company_responsibilities` - Array
- `transition_to_landlord` - Object
- `leaseholder_communications` - Array

**Legislation**: Commonhold & Leasehold Reform Act 2002  
**Deadlines**: 90-day acquisition period, annual accounts  
**Penalties**: RTM claim rejection, tribunal costs

---

#### 13. LeaseholderRights
**Purpose**: Statutory rights for leaseholders

**Key Fields**:
- `unit_id`, `property_id`, `tenant_id`
- `lease_details` - Object:
  - `lease_start_date`, `lease_end_date`
  - `original_term_years`, `remaining_years`
  - `years_expiry_warning` (default: 80)
  - `is_long_leaseholder` (4+ years = RTM eligible)
  - `lease_document_url`
- `lease_variation` - Object
- `lease_extension` - Object:
  - `eligibility_from_date` (2+ years ownership)
  - `eligible_for_extension`, `extension_claimed`
  - `notice_served_date`, `premium_negotiated`
  - `new_lease_term_years`, `completion_date`
- `collective_enfranchisement` - Object:
  - `property_eligible` (2/3+ leaseholders)
  - `group_formed`, `participating_leaseholders`
  - `acquisition_status`
- `statutory_rights` - Array
- `prescribed_information` - Object:
  - `notice_provided` (Housing Act 2004 s.213)
  - `managing_agent_name`, `managing_agent_address`
  - `dispute_body_name` (TPO/LETTINGREDRESS)
- `service_charge_transparency` - Object:
  - `annual_statement_received`
  - `service_charge_amount`, `arrears_amount`
  - `payment_plan`, `disputes_filed`
- `complaint_handling` - Array
- `management_company_accountability` - Object

**Legislation**: Leasehold Reform Act 1993, Housing Act 2004  
**Deadlines**: 2-year ownership for extension, 80-year lease warning  
**Penalties**: Tribunal claims, forfeiture challenges

---

#### 14. DepositProtection
**Purpose**: Tenancy deposit protection tracking

**Key Fields**:
- `tenancy_id`, `tenant_id`, `property_id`, `unit_id`
- `scheme_name` - dps/mydeposits/tds
- `scheme_reference`
- `deposit_amount`, `rent_amount`
- `tenancy_start_date`, `tenancy_end_date`
- `deposit_received_date`
- `protected_date` - Must be within 30 days
- `prescribed_info_served_date` - Within 30 days
- `prescribed_info_method` - email/post/hand_delivered
- `compliance_status` - compliant/late_protection/not_protected/disputed
- `days_to_protect` - Calculated
- `is_late` - Boolean (>30 days)
- `penalty_exposure` - 1-3x deposit_amount
- `disputes` - Array
- `deductions_proposed` - Array
- `deductions_agreed` - Array
- `deposit_returned_date`, `deposit_returned_amount`
- `certificate_url`
- `prescribed_info_document_url`

**Legislation**: Housing Act 2004 s.212-215  
**Deadlines**: 30-day protection, 30-day prescribed information  
**Penalties**: 1-3x deposit amount + no Section 21

---

#### 15. RightToRentCheck
**Purpose**: Immigration Act compliance

**Key Fields**:
- `tenant_id`, `property_id`, `unit_id`
- `check_type` - initial/follow_up/random
- `check_date`
- `document_type` - british_passport/ee_passport/uk_residence_permit/biometric_residence_permit/visa/settled_status/pre_settled_status
- `document_number`, `document_expiry_date`
- `tenant_full_name`, `tenant_date_of_birth`, `tenant_nationality`
- `check_method` - in_person/video_call/online_idvp
- `documents_verified` - Boolean
- `copies_retained` - Boolean (keep 6 years)
- `copy_urls` - Array
- `check_result` - pass/fail/pending_home_office
- `right_to_rent_status` - unlimited/time_limited/no_right_to_rent
- `time_limit_expiry`
- `follow_up_check_required` - Boolean
- `follow_up_check_date` - 12 months or before visa expiry
- `follow_up_check_completed` - Boolean
- `home_office_reference`, `home_office_check_date`, `home_office_response`
- `conducted_by`, `conducted_by_role`

**Legislation**: Immigration Act 2014, Immigration Act 2016  
**Deadlines**: Initial before tenancy, follow-up 12 months later  
**Penalties**: £10,000 (first), £20,000 (repeat) + criminal

---

#### 16-20. Additional Core Entities

**CertificateExpiryAlert** - Automated expiry alerts  
**ComplianceAlertConfig** - Alert rule configuration  
**EmergencyCallout** - 24/7 emergency tracking  
**Message** - Communication tracking  
**Tenancy** - Tenancy agreements

---

### Sales Module Entities (8)

**SalesListing**, **Offer**, **ViewingAppointment**, **SalesLead**, **SalesCommunication**, **SalesTransaction**, **BuyerPortalOffer**, **MarketReport**

*(Full details in PLATFORM_ENTITY_REFERENCE.md)*

---

## 📦 MODULE BREAKDOWN

### Module 1: Property Management
**Pages**: `/properties`, `/units`, `/tenants`, `/contacts`, `/companies`

### Module 2: Compliance Dashboard
**Pages**: `/compliance`, `/compliance-audit`, `/compliance-dashboard-2`, `/certificate-compliance`, `/building-safety-register`

### Module 3: Financial Management
**Pages**: `/financials`, `/rent-ledger`, `/service-charges`, `/ground-rent`, `/banking`, `/expenses`, `/financial-reporting`

### Module 4: Maintenance Management
**Pages**: `/maintenance`, `/maintenance-workflow`, `/emergency-callouts`, `/out-of-hours`, `/contractor-portal`

### Module 5: Sales & Lettings CRM
**Pages**: `/sales`, `/crm`, `/viewings`, `/buyer-portal`, `/market-reports`, `/agent-performance`

### Module 6: Document Management
**Pages**: `/document-repository`, `/document-templates`, `/document-automation`

### Module 7: Workflow Automation
**Pages**: `/workflows`, `/workflow-executions`

### Module 8: Block Management
**Pages**: `/block-management`, `/rtm-management`, `/service-charges-management`, `/leaseholder-portal`

### Module 9: Tenant & Leaseholder Portals
**Pages**: `/tenant-portal`, `/leaseholder-portal`

### Module 10: Out-of-Hours Call Center
**Pages**: `/out-of-hours`, `/call-center-config`, `/out-of-hours-pricing`

### Module 11: Integrations & API
**Pages**: `/integrations`, `/api-integrations`, `/accounting`

### Module 12: Setup & Configuration
**Pages**: `/setup`, `/dev-demo-switcher`, `/demo-station`, `/billing`

---

**END OF PART 1**

*Continue to PART 2 for: Compliance System, Automation Engine, Backend Functions, Frontend Pages, Integrations, Security, Launch Plans, Roadmap, and Business Metrics*

---

**Document Version**: 2.0  
**Last Updated**: 2026-04-13  
**Author**: Premiso Development Team