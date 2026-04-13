import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized - Admin access required' }, { status: 403 });
    }

    const { file_url, entity_type, dry_run = true } = await req.json();

    if (!file_url || !entity_type) {
      return Response.json({ 
        error: 'file_url and entity_type are required',
        success: false 
      }, { status: 400 });
    }

    // Extract data from uploaded file
    const extractionResult = await base44.integrations.Core.ExtractDataFromUploadedFile({
      file_url,
      json_schema: {
        type: "object",
        properties: {
          records: {
            type: "array",
            items: {
              type: "object",
              properties: {
                row_number: { type: "number" },
                data: { type: "object" }
              }
            }
          }
        }
      }
    });

    if (extractionResult.status === "error") {
      return Response.json({
        error: 'Failed to extract data from file',
        details: extractionResult.details,
        success: false
      }, { status: 500 });
    }

    const records = extractionResult.output?.records || [];
    
    // Validation results
    const validation = {
      total_rows: records.length,
      valid_rows: 0,
      invalid_rows: 0,
      errors: [],
      warnings: [],
      field_stats: {}
    };

    // Define required fields per entity type
    const requiredFields = {
      Company: ['name'],
      Property: ['name', 'address_line_1', 'city', 'postcode'],
      Unit: ['property_id', 'unit_number'],
      Tenant: ['full_name', 'email'],
      Contact: ['full_name'],
      SalesLead: ['lead_type', 'contact_name']
    };

    const entityFields = requiredFields[entity_type] || [];

    // Validate each row
    records.forEach((record, index) => {
      const rowNumber = record.row_number || index + 2; // +2 for header row and 0-index
      const data = record.data || {};
      const rowErrors = [];
      const rowWarnings = [];

      // Check required fields
      entityFields.forEach(field => {
        if (!data[field] || data[field].toString().trim() === '') {
          rowErrors.push({
            field,
            error: 'required_field_missing',
            message: `Required field '${field}' is missing or empty`
          });
        }
      });

      // Validate email format
      if (data.email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(data.email)) {
          rowErrors.push({
            field: 'email',
            error: 'invalid_email_format',
            message: `Invalid email format: ${data.email}`
          });
        }
      }

      // Validate date formats
      const dateFields = ['date_of_birth', 'move_in_date', 'tenancy_end_date', 'registration_date', 'available_from'];
      dateFields.forEach(field => {
        if (data[field]) {
          const date = new Date(data[field]);
          if (isNaN(date.getTime())) {
            rowErrors.push({
              field,
              error: 'invalid_date_format',
              message: `Invalid date format: ${data[field]}`
            });
          }
        }
      });

      // Validate phone numbers (basic check)
      if (data.phone) {
        const phoneRegex = /^[\d\s\+\-\(\)]{10,}$/;
        if (!phoneRegex.test(data.phone.replace(/-/g, ''))) {
          rowWarnings.push({
            field: 'phone',
            warning: 'invalid_phone_format',
            message: `Phone number may be invalid: ${data.phone}`
          });
        }
      }

      // Validate numeric fields
      const numericFields = ['rent_amount', 'annual_income', 'bedrooms', 'bathrooms', 'floor_area_sqft', 'total_units'];
      numericFields.forEach(field => {
        if (data[field] !== undefined && data[field] !== null && data[field] !== '') {
          const num = Number(data[field]);
          if (isNaN(num)) {
            rowErrors.push({
              field,
              error: 'invalid_number',
              message: `Field '${field}' must be a number: ${data[field]}`
            });
          }
        }
      });

      // Check for duplicates (by email or unique identifier)
      if (data.email) {
        const duplicateCheck = records.filter((r, i) => 
          i !== index && r.data?.email === data.email
        );
        if (duplicateCheck.length > 0) {
          rowWarnings.push({
            field: 'email',
            warning: 'duplicate_email',
            message: `Duplicate email found in row ${records.indexOf(duplicateCheck[0]) + 2}`
          });
        }
      }

      // Update validation stats
      if (rowErrors.length > 0) {
        validation.invalid_rows++;
        validation.errors.push({
          row: rowNumber,
          errors: rowErrors
        });
      } else {
        validation.valid_rows++;
      }

      validation.warnings.push(...rowWarnings.map(w => ({ row: rowNumber, ...w })));

      // Collect field statistics
      Object.keys(data).forEach(field => {
        if (!validation.field_stats[field]) {
          validation.field_stats[field] = {
            present: 0,
            empty: 0,
            unique_values: new Set()
          };
        }
        validation.field_stats[field].present++;
        if (data[field] === '' || data[field] === null || data[field] === undefined) {
          validation.field_stats[field].empty++;
        } else {
          validation.field_stats[field].unique_values.add(String(data[field]));
        }
      });
    });

    // Convert field stats to serializable format
    const fieldStats = {};
    Object.entries(validation.field_stats).forEach(([field, stats]) => {
      fieldStats[field] = {
        present: stats.present,
        empty: stats.empty,
        unique_count: stats.unique_values.size,
        sample_values: Array.from(stats.unique_values).slice(0, 5)
      };
    });

    // Log validation
    await base44.entities.WorkflowExecution.create({
      workflow_name: 'Bulk Import Validation',
      entity_type,
      status: dry_run ? 'dry_run' : 'validated',
      execution_date: new Date().toISOString(),
      result: {
        file_url,
        total_rows: validation.total_rows,
        valid_rows: validation.valid_rows,
        invalid_rows: validation.invalid_rows,
        error_count: validation.errors.length,
        warning_count: validation.warnings.length
      }
    });

    return Response.json({
      success: true,
      validation: {
        ...validation,
        field_stats: fieldStats
      },
      ready_to_import: validation.invalid_rows === 0,
      dry_run,
      recommendations: [
        validation.invalid_rows === 0 ? '✓ All rows are valid and ready to import' : `⚠ Fix ${validation.invalid_rows} invalid rows before importing`,
        validation.warnings.length > 0 ? `ℹ Review ${validation.warnings.length} warnings for data quality` : '✓ No data quality warnings'
      ]
    });

  } catch (error) {
    return Response.json({
      error: error.message,
      success: false
    }, { status: 500 });
  }
});