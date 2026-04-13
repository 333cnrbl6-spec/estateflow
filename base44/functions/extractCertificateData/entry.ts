import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the payload from entity automation
    const { event, data } = await req.json();
    
    if (!data || !data.document_url) {
      return Response.json({ 
        error: 'No document URL found', 
        success: false 
      }, { status: 400 });
    }

    const certificateId = event.entity_id;
    const documentUrl = data.document_url;
    const certificateType = data.certificate_type;

    // Use Base44 OCR integration to extract data from the certificate
    const ocrResult = await base44.integrations.Core.ExtractDataFromUploadedFile({
      file_url: documentUrl,
      json_schema: {
        type: "object",
        properties: {
          certificate_number: {
            type: "string",
            description: "Unique certificate reference number"
          },
          issue_date: {
            type: "string",
            description: "Date certificate was issued (DD/MM/YYYY or YYYY-MM-DD)"
          },
          expiry_date: {
            type: "string",
            description: "Date certificate expires (DD/MM/YYYY or YYYY-MM-DD)"
          },
          contractor_name: {
            type: "string",
            description: "Name of contractor or engineer who issued certificate"
          },
          contractor_company: {
            type: "string",
            description: "Company name of contractor"
          },
          contractor_qualification: {
            type: "string",
            description: "Contractor qualification (e.g., Gas Safe number, NICEIC)"
          },
          property_address: {
            type: "string",
            description: "Property address on certificate"
          },
          overall_result: {
            type: "string",
            description: "Overall assessment (e.g., satisfactory, safe, pass)"
          }
        },
        required: ["certificate_number", "issue_date", "expiry_date"]
      }
    });

    if (ocrResult.status === "error") {
      return Response.json({ 
        error: 'OCR extraction failed', 
        details: ocrResult.details,
        success: false 
      }, { status: 500 });
    }

    const extractedData = ocrResult.output;

    // Parse dates to ISO format
    const parseDate = (dateStr) => {
      if (!dateStr) return null;
      
      // Try DD/MM/YYYY format
      const ddmmyyyy = dateStr.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
      if (ddmmyyyy) {
        return `${ddmmyyyy[3]}-${ddmmyyyy[2].padStart(2, '0')}-${ddmmyyyy[1].padStart(2, '0')}`;
      }
      
      // Try DD-MM-YYYY format
      const ddmmmyyyy = dateStr.match(/(\d{1,2})-(\d{1,2})-(\d{4})/);
      if (ddmmmyyyy) {
        return `${ddmmmyyyy[3]}-${ddmmmyyyy[2].padStart(2, '0')}-${ddmmmyyyy[1].padStart(2, '0')}`;
      }
      
      // Already ISO format or return as-is
      return dateStr;
    };

    // Prepare update data
    const updateData = {
      certificate_number: extractedData.certificate_number || data.certificate_number,
      issue_date: parseDate(extractedData.issue_date) || data.issue_date,
      expiry_date: parseDate(extractedData.expiry_date) || data.expiry_date,
      status: 'valid' // Default status
    };

    // Add contractor details based on certificate type
    if (certificateType === 'gas_safety') {
      updateData.engineer_name = extractedData.contractor_name || data.engineer_name;
      updateData.engineer_company = extractedData.contractor_company || data.engineer_company;
      updateData.engineer_gas_safe_number = extractedData.contractor_qualification || data.engineer_gas_safe_number;
    } else if (certificateType === 'eicr') {
      updateData.contractor_name = extractedData.contractor_name || data.contractor_name;
      updateData.contractor_company = extractedData.contractor_company || data.contractor_company;
      updateData.contractor_qualifications = extractedData.contractor_qualification ? 
        [extractedData.contractor_qualification] : data.contractor_qualifications;
    } else {
      updateData.issuing_body = extractedData.contractor_company || extractedData.contractor_name || data.issuing_body;
    }

    // Determine certificate status based on expiry date
    const expiryDate = new Date(updateData.expiry_date);
    const today = new Date();
    const daysUntilExpiry = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));

    if (daysUntilExpiry < 0) {
      updateData.status = 'expired';
    } else if (daysUntilExpiry <= 30) {
      updateData.status = 'expiring_soon';
    } else if (daysUntilExpiry <= 90) {
      updateData.status = 'valid'; // But should trigger warning soon
    } else {
      updateData.status = 'valid';
    }

    // Update the certificate entity
    let updatedCertificate;
    if (certificateType === 'gas_safety') {
      updatedCertificate = await base44.entities.GasSafetyCertificate.update(certificateId, updateData);
    } else if (certificateType === 'eicr') {
      updatedCertificate = await base44.entities.EICRCertificate.update(certificateId, updateData);
    } else {
      updatedCertificate = await base44.entities.SafetyCertificate.update(certificateId, updateData);
    }

    // Log the automation execution
    await base44.entities.WorkflowExecution.create({
      workflow_name: 'OCR Certificate Data Extraction',
      entity_type: certificateType === 'gas_safety' ? 'GasSafetyCertificate' : 
                   certificateType === 'eicr' ? 'EICRCertificate' : 'SafetyCertificate',
      entity_id: certificateId,
      status: 'success',
      execution_date: new Date().toISOString(),
      result: {
        ocr_extracted: extractedData,
        fields_updated: Object.keys(updateData),
        days_until_expiry: daysUntilExpiry,
        status_set: updateData.status
      }
    });

    return Response.json({
      success: true,
      message: 'Certificate data extracted and updated successfully',
      extracted_data: extractedData,
      updated_fields: updateData,
      days_until_expiry: daysUntilExpiry,
      certificate_status: updateData.status
    });

  } catch (error) {
    // Log the error
    try {
      const base44 = createClientFromRequest(req);
      await base44.entities.WorkflowExecution.create({
        workflow_name: 'OCR Certificate Data Extraction',
        status: 'failed',
        execution_date: new Date().toISOString(),
        error_message: error.message
      });
    } catch (logError) {
      // Ignore logging errors
    }

    return Response.json({ 
      error: error.message,
      success: false 
    }, { status: 500 });
  }
});