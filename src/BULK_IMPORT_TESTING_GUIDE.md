# Bulk Import Testing Guide

## Overview
This guide covers the complete testing suite for bulk data imports in Premiso.

## Files Created

### 1. Backend Functions
- `functions/generateBulkImportTestData.js` - Generates realistic test data
- `functions/validateBulkImport.js` - Validates CSV files before import

### 2. Frontend
- `pages/BulkImportTester.jsx` - UI for testing bulk imports

### 3. Sample CSV Templates
See below for ready-to-use CSV templates

---

## How to Use

### Step 1: Generate Test Data
1. Navigate to `/bulk-import-tester`
2. Select tier (Small/Medium/Large)
3. Click "Generate Test Data"
4. Download the generated CSV files

### Step 2: Validate CSV Files
1. Go to "Validate & Test" tab
2. Select entity type (Company, Property, Unit, Tenant, Contact)
3. Upload your CSV file
4. Review validation results

### Step 3: Execute Import
1. Fix any validation errors
2. Click "Execute Import"
3. Monitor progress
4. Verify data in the relevant pages

---

## Sample CSV Templates

### Companies Template
```csv
name,company_number,company_type,registration_date,status,email,phone,address_line_1,city,postcode
Test Company 1 Ltd,TC123456,property_management,2023-01-15,active,company1@test.co.uk,020 1234 5678,100 Business Park,London,SW1A 1AB
Test Company 2 Ltd,TC789012,landlord,2022-06-20,active,company2@test.co.uk,020 9876 5432,200 High Street,Brighton,BN1 2CD
```

### Properties Template
```csv
name,address_line_1,address_line_2,city,postcode,region,property_type,ownership_type,owning_company,management_company,total_units,year_built
Admiral Point,100 High Street,,London,SW1A 1AB,london,freehold_block,freehold,Test Company 1 Ltd,Test Company 1 Ltd,24,1985
Reed Close,50 Main Road,,Brighton,BN1 2CD,brighton,leasehold_block,leasehold,Test Company 2 Ltd,Test Company 2 Ltd,12,2010
```

### Units Template
```csv
property_id,unit_number,bedrooms,bathrooms,floor_area_sqft,rent_amount,rent_frequency,status,available_from
Admiral Point,Flat 1,2,1,750,1500,monthly,occupied,2024-01-01
Admiral Point,Flat 2,1,1,500,1200,monthly,vacant,2024-06-01
Reed Close,Flat 1,3,2,1000,2000,monthly,occupied,2023-09-15
```

### Tenants Template
```csv
full_name,email,phone,date_of_birth,ni_number,occupation,employer,annual_income,previous_address,emergency_contact_name,emergency_contact_phone,move_in_date,tenancy_end_date
John Smith,john.smith@email.com,07123456789,1985-03-15,AB123456C,Software Engineer,Tech Corp Ltd,65000,45 Old Street London,Jane Smith,07987654321,2024-01-01,2026-01-01
Emma Johnson,emma.johnson@email.com,07234567890,1990-07-22,CD789012E,Teacher,Education Trust,42000,78 Previous Road Brighton,Michael Johnson,07876543210,2024-03-15,2025-03-14
```

### Contacts Template
```csv
full_name,email,phone,contact_type,company_name,address
David Williams,david@contractor.com,020 1111 2222,contractor,ABC Services Ltd,10 Contractor Street London
Sarah Brown,sarah@solicitor.com,020 3333 4444,solicitor,Legal Partners LLP,20 Law Road Brighton
```

---

## Test Scenarios

### ✅ Valid Data Tests
- [ ] Import 10 companies successfully
- [ ] Import 20 properties with valid references
- [ ] Import 50 units linked to existing properties
- [ ] Import 100 tenants with valid emails
- [ ] Import 25 contacts

### ⚠️ Edge Case Tests
- [ ] Special characters in names (O'Brien, Müller, etc.)
- [ ] Very long addresses (200+ characters)
- [ ] Empty optional fields
- [ ] Date formats: DD/MM/YYYY vs YYYY-MM-DD
- [ ] Phone numbers with different formats
- [ ] Postcodes with spaces and without

### ❌ Error Handling Tests
- [ ] Missing required fields
- [ ] Invalid email formats
- [ ] Invalid dates
- [ ] Duplicate entries
- [ ] Invalid numeric values
- [ ] Wrong data types

### 🔄 Relationship Tests
- [ ] Units reference existing properties
- [ ] Tenants linked to valid units
- [ ] Companies referenced in properties exist
- [ ] Circular dependencies handled

### 📊 Performance Tests
- [ ] Import 100 rows in < 5 seconds
- [ ] Import 1000 rows in < 30 seconds
- [ ] Import 5000 rows in < 2 minutes
- [ ] Progress indicator updates correctly
- [ ] No timeout errors on large imports

---

## Validation Rules

### Required Fields by Entity

**Company:**
- name (required)

**Property:**
- name (required)
- address_line_1 (required)
- city (required)
- postcode (required)

**Unit:**
- property_id (required) - must reference existing property
- unit_number (required)

**Tenant:**
- full_name (required)
- email (required, must be valid format)

**Contact:**
- full_name (required)

### Format Validation

**Email:**
- Must match pattern: `^[^\s@]+@[^\s@]+\.[^\s@]+$`
- Examples: valid@email.com ✓, invalid@ ✓

**Phone:**
- Must contain 10+ digits
- Allows: spaces, +, -, ()
- Examples: 07123456789 ✓, 020 1234 5678 ✓

**Dates:**
- Must be parseable by JavaScript Date
- Formats accepted: YYYY-MM-DD, DD/MM/YYYY, ISO 8601

**Numbers:**
- Must be valid numeric values
- No currency symbols
- Decimals allowed

---

## Troubleshooting

### Common Issues

**Issue: "Invalid date format"**
- Solution: Use YYYY-MM-DD format (e.g., 2024-01-15)

**Issue: "Required field missing"**
- Solution: Check the validation report for specific row/column

**Issue: "Duplicate email found"**
- Solution: This is a warning, not an error. You can proceed or fix duplicates

**Issue: Import timeout on large files**
- Solution: Split into smaller batches (500-1000 rows max)

**Issue: Property references not found**
- Solution: Import properties first, then units that reference them

---

## API Reference

### Generate Test Data
```javascript
POST /functions/generateBulkImportTestData
{
  "tier": "small" | "medium" | "large",
  "includeRelationships": true
}
```

### Validate Import
```javascript
POST /functions/validateBulkImport
{
  "file_url": "https://...",
  "entity_type": "Company" | "Property" | "Unit" | "Tenant" | "Contact",
  "dry_run": true
}
```

### Response Format
```json
{
  "success": true,
  "validation": {
    "total_rows": 100,
    "valid_rows": 95,
    "invalid_rows": 5,
    "errors": [...],
    "warnings": [...],
    "field_stats": {...}
  },
  "ready_to_import": false,
  "recommendations": [...]
}
```

---

## Best Practices

1. **Always validate before importing** - Use the validation function first
2. **Test with small batches** - Start with 10-20 rows
3. **Import in order** - Companies → Properties → Units → Tenants
4. **Keep backups** - Export data before large imports
5. **Review warnings** - They indicate data quality issues
6. **Use dry_run mode** - Test without committing data
7. **Monitor progress** - Large imports should show progress

---

## Support

For issues or questions:
1. Check validation error messages
2. Review this guide's troubleshooting section
3. Test with sample templates first
4. Contact support for persistent issues