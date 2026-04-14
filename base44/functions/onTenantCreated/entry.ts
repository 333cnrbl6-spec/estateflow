import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { event, data } = await req.json();

    // Verify this is a create event
    if (event.type !== 'create') {
      return Response.json({ success: true, skipped: true });
    }

    const tenant = data;
    console.log(`[Tenant Workflow] Processing new tenant: ${tenant.full_name} (${tenant.id})`);

    // 1. Generate portal access token and send welcome email
    console.log('[Tenant Workflow] Generating portal access link...');
    const tokenResponse = await generatePortalToken(base44, tenant);

    // 2. Create lease/tenancy agreement
    console.log('[Tenant Workflow] Creating tenancy agreement...');
    await createTenancyDocuments(base44, tenant);

    // 3. Initiate Right to Rent verification
    console.log('[Tenant Workflow] Initiating Right to Rent verification...');
    await initiateRightToRent(base44, tenant);

    return Response.json({
      success: true,
      tenant_id: tenant.id,
      portal_link_sent: !!tokenResponse,
      documents_created: true,
      rtr_initiated: true
    });
  } catch (error) {
    console.error('[Tenant Workflow] Error:', error);
    return Response.json({ error: error.message, success: false }, { status: 500 });
  }
});

async function generatePortalToken(base44, tenant) {
  try {
    // Generate secure random token
    const randomBytes = crypto.getRandomValues(new Uint8Array(32));
    const token = Array.from(randomBytes).map(b => b.toString(16).padStart(2, '0')).join('');
    
    // Hash token for storage
    const tokenData = new TextEncoder().encode(token);
    const hashBuffer = await crypto.subtle.digest('SHA-256', tokenData);
    const tokenHash = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');

    // Create token record in database
    const tokenRecord = await base44.asServiceRole.entities.TenantAccessToken.create({
      tenant_id: tenant.id,
      tenant_email: tenant.email,
      property_id: tenant.property_id,
      unit_id: tenant.unit_id,
      token: tokenHash,
      created_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
      is_active: true
    });

    const portalUrl = `${Deno.env.get('APP_URL') || 'http://localhost:5173'}/tenant-portal?token=${token}`;

    // Send welcome email
    await base44.asServiceRole.integrations.Core.SendEmail({
      to: tenant.email,
      subject: 'Welcome! Your Tenant Portal Access',
      body: `
        <h2>Welcome to Your New Home!</h2>
        <p>Hello ${tenant.full_name},</p>
        <p>Your tenancy has been set up and we're excited to have you. Your personal tenant portal is now ready.</p>
        
        <h3>What You Can Do:</h3>
        <ul>
          <li>✓ Submit and track maintenance requests with photos</li>
          <li>✓ View your lease agreement and important documents</li>
          <li>✓ Receive property announcements and updates</li>
          <li>✓ Access safety certificates and compliance info</li>
        </ul>
        
        <p style="margin: 20px 0;">
          <a href="${portalUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">Access Your Portal Now</a>
        </p>
        
        <p><strong>Or copy this link:</strong><br/>${portalUrl}</p>
        
        <p style="color: #666; font-size: 12px; margin-top: 20px;">This link will expire in 90 days. Contact us if you need a new one.</p>
        
        <p>Best regards,<br/><strong>Property Management Team</strong></p>
      `
    });

    console.log('[Tenant Workflow] Portal token created and welcome email sent');
    return true;
  } catch (error) {
    console.error('[Tenant Workflow] Error generating portal token:', error);
    throw error;
  }
}

async function createTenancyDocuments(base44, tenant) {
  try {
    // Get property and templates
    const property = await base44.asServiceRole.entities.Property.get(tenant.property_id);
    
    // Get lease agreement template
    const templates = await base44.asServiceRole.entities.DocumentTemplate.filter(
      {
        document_type: 'tenancy_agreement',
        is_active: true
      },
      '-created_date',
      1
    );

    if (templates.length === 0) {
      console.log('[Tenant Workflow] No tenancy agreement template found, skipping document creation');
      return;
    }

    const template = templates[0];

    // Prepare data for document generation
    const documentData = {
      TENANT_NAME: tenant.full_name,
      TENANT_EMAIL: tenant.email,
      TENANT_PHONE: tenant.phone || '',
      PROPERTY_ADDRESS: property?.address || '',
      TENANCY_START_DATE: tenant.tenancy_start_date || new Date().toISOString().split('T')[0],
      TENANCY_END_DATE: tenant.tenancy_end_date || '',
      MONTHLY_RENT: property?.monthly_rent || '0',
      DEPOSIT_AMOUNT: tenant.deposit_amount || '0'
    };

    // Create generated document
    const generatedDoc = await base44.asServiceRole.entities.GeneratedDocument.create({
      template_id: template.id,
      template_code: template.template_code,
      property_id: tenant.property_id,
      unit_id: tenant.unit_id,
      tenant_id: tenant.id,
      document_name: `Tenancy Agreement - ${tenant.full_name}`,
      document_type: 'tenancy_agreement',
      generated_date: new Date().toISOString(),
      generated_by: 'system',
      data_used: documentData,
      document_url: 'pending', // Would be generated by actual document service
      status: 'draft'
    });

    console.log('[Tenant Workflow] Tenancy agreement document created');
    return true;
  } catch (error) {
    console.error('[Tenant Workflow] Error creating tenancy documents:', error);
    throw error;
  }
}

async function initiateRightToRent(base44, tenant) {
  try {
    // Create Right to Rent check record
    const rtrCheck = await base44.asServiceRole.entities.RightToRentCheck.create({
      tenant_id: tenant.id,
      property_id: tenant.property_id,
      tenant_email: tenant.email,
      tenant_name: tenant.full_name,
      status: 'pending',
      initiated_date: new Date().toISOString(),
      check_type: 'initial_tenancy'
    });

    // Send RTR verification email to tenant
    await base44.asServiceRole.integrations.Core.SendEmail({
      to: tenant.email,
      subject: 'Right to Rent Verification Required',
      body: `
        <h2>Right to Rent Verification</h2>
        <p>Hello ${tenant.full_name},</p>
        <p>As part of the UK rental requirements, we need to verify your right to rent in the UK.</p>
        
        <h3>What You Need to Provide:</h3>
        <p>Please provide a copy of one of the following documents:</p>
        <ul>
          <li>Valid passport</li>
          <li>UK driving license</li>
          <li>National ID card</li>
          <li>Visa with stay permission</li>
        </ul>
        
        <p>Please reply to this email with the document or visit your tenant portal to upload it.</p>
        <p>This verification must be completed before your tenancy begins.</p>
        
        <p>Best regards,<br/><strong>Property Management Team</strong></p>
      `
    });

    console.log('[Tenant Workflow] Right to Rent verification initiated');
    return true;
  } catch (error) {
    console.error('[Tenant Workflow] Error initiating Right to Rent:', error);
    throw error;
  }
}