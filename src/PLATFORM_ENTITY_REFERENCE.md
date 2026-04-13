# 📊 PREMISO - ENTITY REFERENCE GUIDE

**Version**: 2.0.0  
**Date**: 2026-04-13  
**Total Entities**: 28 (20 core + 8 sales)

---

## 🔧 BUILT-IN FIELDS

Every entity includes these automatic fields:
- `id` - Unique identifier (UUID)
- `created_date` - Creation timestamp
- `updated_date` - Last update timestamp
- `created_by` - Email of user who created record

---

## 📋 CORE ENTITIES (20)

### 1. Company
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

### 2. Property
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

### 3. Unit
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

### 4. Tenant
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

### 5. Contact
**Purpose**: Business network (people/organizations)

**Key Fields**:
- `full_name`, `email`, `phone`
- `contact_type` - director/contractor/solicitor/accountant/agent/surveyor/managing_agent/insurance_broker/buyer/seller/landlord/tenant/mortgage_advisor/other
- `company_name`
- `related_company_id` - Company reference (for demo scoping)
- `address`, `notes`

**Compliance Use**: Contractor qualifications, director tracking

---

### 6. FinancialTransaction
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

### 7. MaintenanceOrder
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

### 8. SafetyCertificate
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

### 9. GasSafetyCertificate
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

### 10. EICRCertificate
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

### 11. BuildingSafety
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

### 12. RTMManagement
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

### 13. LeaseholderRights
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

### 14. DepositProtection
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

### 15. RightToRentCheck
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

### 16. CertificateExpiryAlert
**Purpose**: Automated expiry alerts

**Key Fields**:
- `certificate_id` - SafetyCertificate reference
- `property_id`, `certificate_type`, `expiry_date`
- `days_until_expiry` - Calculated
- `threshold_days` - Alert threshold
- `status` - pending/sent/acknowledged/dismissed
- `sent_to` - Array of emails
- `sent_at` - Timestamp
- `acknowledged_by`, `acknowledged_at`
- `notes`

**Automation**: Created by daily scheduled function

---

### 17. ComplianceAlertConfig
**Purpose**: Alert rule configuration

**Key Fields**:
- `certificate_type` - all/gas_safety/eicr/fire_safety/etc.
- `threshold_days` - Default: 30
- `notify_email`, `notify_dashboard` - Booleans
- `recipients` - Array: property_manager/maintenance_team/compliance_officer/landlord/custom
- `custom_email` - String
- `enabled` - Boolean

**Default Rules**: Pre-configured for all certificate types

---

### 18. EmergencyCallout
**Purpose**: 24/7 emergency tracking

**Key Fields**:
- `property_id`, `unit_id`
- `caller_name`, `caller_phone`
- `call_received_date` - Timestamp
- `call_type` - water_leak/gas_smell/electrical_fault/fire_alarm/security_breach/heating_failure/structural_damage/other
- `severity` - critical/high/medium/low
- `description`
- `response_time_minutes` - Calculated
- `status` - logged/escalated/contractor_assigned/in_progress/resolved/cancelled
- `assigned_contractor_id`, `assigned_contractor_name`, `assigned_contractor_phone`, `assigned_contractor_email`
- `escalation_method` - phone/sms/email/multiple
- `escalation_time`, `estimated_arrival_time`, `actual_arrival_time`
- `resolution_notes`, `resolved_date`
- `follow_up_required`, `follow_up_notes`
- `cost_estimate`, `cost_actual`

**Compliance Use**: Health & Safety at Work Act 1974

---

### 19. Message
**Purpose**: Communication tracking

**Key Fields**:
- `thread_id` - Conversation grouping
- `sender_type` - agent/tenant/contractor/landlord
- `sender_id`, `sender_name`, `sender_email`
- `recipient_type`, `recipient_id`, `recipient_name`, `recipient_email`
- `subject`, `body`
- `message_type` - general_inquiry/maintenance/emergency/payment/other
- `status` - sent/delivered/read/archived
- `is_sms_sent`, `sms_sent_at`
- `attachments` - Array
- `replied_to_message_id` - Reference
- `notes`

**Compliance Use**: Prescribed information service, audit trail

---

### 20. Tenancy
**Purpose**: Tenancy agreements

**Key Fields**:
- `property_id`, `unit_id`, `tenant_id`
- `tenancy_type` - assured_shorthold/assured/regulated/company_let
- `start_date`, `end_date`
- `is_periodic` - Boolean (rolling)
- `rent_amount`, `rent_frequency`
- `rent_review_date`
- `deposit_amount`, `deposit_scheme`
- `break_clause` - Object
- `special_conditions` - Array
- `guarantor_name`, `guarantor_contact`
- `status` - active/expired/terminated/notice_served
- `notice_served_date`, `notice_period_days`
- `check_in_date`, `check_out_date`
- `inventory_url`
- `epc_url`
- `how_to_rent_served` - Boolean
- `prescribed_info_served` - Boolean
- `gas_safety_served` - Boolean
- `eicr_served` - Boolean

**Compliance Use**: Housing Act 1988, prescribed document service

---

## 💼 SALES ENTITIES (8)

### 21. SalesListing
- `property_id`, `unit_id`
- `listing_type` - sale/rent/both
- `status` - draft/active/under_offer/sold_subject_to_contract/completed/withdrawn/expired
- `asking_price`, `price_qualifier`
- `marketing_text`, `featured_text`
- `bedrooms`, `bathrooms`, `reception_rooms`
- `property_type`, `tenure`, `lease_remaining_years`
- `council_tax_band`, `epc_rating`
- `floor_area_sqft`, `floor_area_sqm`
- `features` - Array
- `images` - Array
- `floor_plan_urls`, `virtual_tour_url`, `video_url`
- `listing_agent_id`, `listing_agent_name`
- `listed_date`
- `portal_links` - rightmove_id, zoopla_id, onthemarket_id
- `viewing_count`, `offer_count`

---

### 22. Offer
- `sales_listing_id`, `buyer_contact_id`
- `buyer_name`, `buyer_email`, `buyer_phone`
- `offer_amount`, `offer_date`
- `status` - pending/accepted/rejected/withdrawn/counter_offered
- `conditions` - Array
- `is_chain_free` - Boolean
- `mortgage_status` - not_required/agreed_in_principle/full_offer/pending/unknown
- `solicitor_name`, `solicitor_contact`
- `target_exchange_date`, `target_completion_date`
- `vendor_feedback`
- `counter_offer_amount`
- `accepted_date`, `rejected_date`

---

### 23. ViewingAppointment
- `sales_listing_id`, `sales_lead_id`, `contact_id`
- `contact_name`, `contact_email`, `contact_phone`
- `agent_id`, `agent_name`
- `appointment_type` - first_viewing/second_viewing/virtual_tour/phone_consultation/property_valuation
- `scheduled_date`, `duration_minutes` (default: 30)
- `status` - requested/confirmed/completed/cancelled/no_show/rescheduled
- `location_type` - in_person/virtual/phone
- `meeting_instructions`
- `calendar_link`
- `reminder_sent`, `reminder_sent_at`
- `feedback`, `feedback_submitted_at`

---

### 24. SalesLead
- `lead_type` - buyer/seller/landlord/tenant
- `contact_id`, `contact_name`, `contact_email`, `contact_phone`
- `source` - website/phone/email/portal/referral/walk_in/social_media
- `status` - new/contacted/qualified/nurturing/converted/lost
- `property_interest`, `budget_min`, `budget_max`, `location_preference`
- `bedrooms_min`, `property_type`, `tenure_preference`
- `motivation`, `timescale` - immediate/1_month/3_months/6_months/12_months/unsure
- `assigned_agent_id`, `assigned_agent_name`
- `lead_score` - 0-100 (AI-calculated)
- `priority_tier` - hot/warm/cold
- `scoring_breakdown` - Object
- `completion_probability`, `recommended_action`
- `last_scored_date`, `last_contact_date`, `next_follow_up_date`

---

### 25. SalesCommunication
- `sales_listing_id`, `sales_lead_id`, `offer_id`
- `thread_id`
- `sender_type`, `sender_id`, `sender_name`, `sender_email`
- `recipient_type`, `recipient_id`, `recipient_name`, `recipient_email`
- `subject`, `body`
- `message_type` - offer_update/viewing_request/viewing_confirmation/general_inquiry/negotiation/document_request/other
- `status` - sent/delivered/read/archived
- `is_sms_sent`, `sms_sent_at`
- `attachments` - Array
- `replied_to_message_id`

---

### 26. SalesTransaction
- `sales_listing_id`, `accepted_offer_id`
- `seller_contact_id`, `buyer_contact_id`
- `seller_solicitor_id`, `buyer_solicitor_id`
- `sale_price`, `status` - 14 stages (offer_accepted → completed)
- `exchange_date`, `completion_date`, `target_completion_date`
- `chain_position` - no_chain/first_time_buyer/in_chain/cash_buyer
- `deposit_amount`, `agent_commission`, `commission_percentage`
- `tasks` - Array
- `milestones` - Array
- `assigned_agent_id`, `assigned_agent_name`
- `days_on_market`

---

### 27. BuyerPortalOffer
- `sales_listing_id`
- `buyer_name`, `buyer_email`, `buyer_phone`
- `offer_amount`, `offer_date`
- `status` - submitted/under_review/accepted/rejected/counter_offered/withdrawn
- `conditions` - Array
- `is_chain_free`, `mortgage_status`
- `solicitor_name`, `solicitor_contact`
- `target_exchange_date`, `target_completion_date`
- `access_token` - Secure token
- `portal_url` - Unique URL

---

### 28. MarketReport
- `generated_date`
- `regions_covered` - Array
- `executive_summary`
- `key_metrics` - Object
- `price_trends` - Object
- `demand_forecast` - Object
- `recommendations` - Array
- `raw_data` - Object
- `generated_by` - User email

---

## 📊 ENTITY RELATIONSHIPS

### One-to-Many
- Company → Properties
- Company → Contacts (directors)
- Property → Units
- Property → Safety Certificates
- Property → Maintenance Orders
- Property → Building Safety
- Unit → Tenants (via Tenancy)
- Unit → Leaseholder Rights
- Unit → Deposit Protection
- Tenant → Right to Rent Checks
- Tenant → Messages
- Contact → Maintenance Orders (as contractor)
- SalesListing → Offers
- SalesListing → Viewings
- Offer → Sales Communications
- SalesTransaction → Tasks/Milestones

### Many-to-One
- Multiple Units → One Property
- Multiple Tenants → One Property (via units)
- Multiple Certificates → One Property
- Multiple Offers → One Sales Listing

### Many-to-Many
- Tenants ↔ Properties (via Tenancy entity)
- Contacts ↔ Companies (as directors/contractors)

---

## 🎯 USAGE EXAMPLES

### Create Property
```javascript
import { base44 } from '@/api/base44Client';

const property = await base44.entities.Property.create({
  name: "Riverside Apartments",
  address_line_1: "123 High Street",
  postcode: "SW1A 1AA",
  property_type: "leasehold_block",
  total_units: 24,
  owning_company: companyId
});
```

### Query Certificates
```javascript
// Get all expiring gas certificates
const expiring = await base44.entities.GasSafetyCertificate.filter({
  status: "expiring_soon"
});
```

### Update Tenant
```javascript
await base44.entities.Tenant.update(tenantId, {
  right_to_rent_status: "time_limited",
  visa_expiry_date: "2027-06-30"
});
```

### Create Sales Listing
```javascript
const listing = await base44.entities.SalesListing.create({
  property_id: propertyId,
  asking_price: 450000,
  bedrooms: 2,
  status: "active",
  listing_agent_name: "John Smith"
});
```

---

**Entity Count**: 28 total  
**Compliance Entities**: 10 (Gas, EICR, Building Safety, RTM, Leaseholder, Deposit, RTR, Alerts, Config, Emergency)  
**Financial Entities**: 6 (Transaction, Invoice, Recurring, Rent, Service Charge, Ground Rent)  
**Sales Entities**: 8  
**Core Entities**: 14 (Property, Unit, Tenant, Contact, Company, Maintenance, Message, Tenancy)