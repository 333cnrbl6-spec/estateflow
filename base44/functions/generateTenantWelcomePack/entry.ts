import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { tenantId, propertyId } = await req.json();

    if (!tenantId || !propertyId) {
      return Response.json({ error: 'Missing tenantId or propertyId' }, { status: 400 });
    }

    // Get tenant and property details
    const [tenant, property] = await Promise.all([
      base44.asServiceRole.entities.Tenant.get(tenantId),
      base44.asServiceRole.entities.Property.get(propertyId)
    ]);

    if (!tenant || !property) {
      return Response.json({ error: 'Tenant or property not found' }, { status: 404 });
    }

    // Create welcome pack document
    const welcomePackContent = `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; color: #333; line-height: 1.6; }
            .header { background-color: #2c3e50; color: white; padding: 20px; }
            .section { margin: 20px 0; padding: 15px; border-left: 4px solid #3498db; }
            h2 { color: #2c3e50; }
            .welcome { background-color: #e8f4f8; }
            .rules { background-color: #fff3cd; }
            .contact { background-color: #d4edda; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Welcome to ${property.name}</h1>
            <p>Your Digital Tenancy Welcome Pack</p>
          </div>

          <div class="section welcome">
            <h2>Welcome, ${tenant.full_name}!</h2>
            <p>We're delighted to welcome you to ${property.name}. This welcome pack contains important information about your tenancy, property rules, and contact details.</p>
          </div>

          <div class="section">
            <h2>📍 Your Property</h2>
            <p><strong>${property.name}</strong></p>
            <p>${property.address_line_1}<br>${property.address_line_2 || ''}<br>${property.city}, ${property.postcode}</p>
            <p><strong>Property Type:</strong> ${property.property_type || 'Residential'}</p>
          </div>

          <div class="section rules">
            <h2>🏠 Property Rules & Responsibilities</h2>
            <h3>Rent Payment</h3>
            <ul>
              <li>Rent is due on the 1st of each month</li>
              <li>Payment should be made via direct debit to the account provided</li>
              <li>Late payments will incur a late fee as outlined in your tenancy agreement</li>
            </ul>
            
            <h3>Maintenance & Repairs</h3>
            <ul>
              <li>Report maintenance issues immediately via your tenant portal</li>
              <li>Do not attempt repairs without landlord authorization</li>
              <li>Emergency issues should be reported to the out-of-hours service</li>
            </ul>

            <h3>Health & Safety</h3>
            <ul>
              <li>Keep emergency contact information readily available</li>
              <li>Follow all health and safety procedures</li>
              <li>Report any safety concerns immediately</li>
            </ul>

            <h3>Occupancy & Guests</h3>
            <ul>
              <li>Only registered occupants are permitted to reside at the property</li>
              <li>Overnight guests should be notified to the landlord for extended stays</li>
              <li>Do not sublet without written permission</li>
            </ul>

            <h3>Noise & Disturbance</h3>
            <ul>
              <li>Respect quiet hours between 22:00 and 08:00</li>
              <li>Keep noise to reasonable levels at all times</li>
              <li>Inform neighbors if hosting events or parties</li>
            </ul>

            <h3>Inventory & Condition</h3>
            <ul>
              <li>An inventory report was completed at the start of your tenancy</li>
              <li>Report any damage or missing items immediately</li>
              <li>The property will be re-inspected at the end of your tenancy</li>
            </ul>
          </div>

          <div class="section contact">
            <h2>📞 Important Contacts</h2>
            <p><strong>Property Manager:</strong><br>
            Email: support@premiso.app<br>
            Phone: 0800 123 4567<br>
            Hours: Monday-Friday, 09:00-17:00</p>
            
            <p><strong>Emergency (24/7):</strong><br>
            Phone: 0800 999 8888<br>
            For: Gas leaks, electrical hazards, severe water leaks, security issues</p>
          </div>

          <div class="section">
            <h2>💻 Your Tenant Portal</h2>
            <p>Access your tenant portal to:</p>
            <ul>
              <li>Pay rent and view payment history</li>
              <li>Report maintenance issues</li>
              <li>Download documents and certificates</li>
              <li>View inspection reports</li>
              <li>Communicate with your landlord</li>
            </ul>
          </div>

          <div class="section">
            <h2>📋 Your Tenancy Details</h2>
            <p><strong>Tenancy Start Date:</strong> ${new Date(tenant.tenancy_start_date).toLocaleDateString('en-GB')}</p>
            <p><strong>Tenancy Type:</strong> ${tenant.tenant_type || 'Assured Shorthold'}</p>
            <p><strong>Status:</strong> Active</p>
          </div>

          <div style="text-align: center; margin-top: 40px; color: #7f8c8d; font-size: 12px;">
            <p>This welcome pack was generated on ${new Date().toLocaleDateString('en-GB')}</p>
            <p>For questions, contact your property manager.</p>
          </div>
        </body>
      </html>
    `;

    // Generate PDF from HTML (using integrations if available, otherwise create as document)
    await base44.asServiceRole.entities.Document.create({
      tenant_id: tenantId,
      property_id: propertyId,
      document_type: 'Other',
      file_name: `Welcome_Pack_${property.name}.html`,
      file_url: `data:text/html;base64,${Buffer.from(welcomePackContent).toString('base64')}`,
      status: 'approved',
      uploaded_by: 'system',
      review_notes: 'Auto-generated welcome pack'
    });

    // Send welcome email
    await base44.integrations.Core.SendEmail({
      to: tenant.email,
      subject: `Welcome to ${property.name} - Your Tenancy Starts Now!`,
      body: `
        <html>
          <body style="font-family: Arial, sans-serif;">
            <h2>Welcome to Your New Home!</h2>
            <p>Dear ${tenant.full_name},</p>
            <p>Congratulations! Your onboarding is complete and your tenancy at <strong>${property.name}</strong> is now active.</p>
            
            <p>Your digital welcome pack has been saved to your tenant portal and contains:</p>
            <ul>
              <li>Property details and access information</li>
              <li>House rules and tenant responsibilities</li>
              <li>Important contact numbers for emergencies</li>
              <li>Information about your tenant portal</li>
            </ul>

            <p>Next steps:</p>
            <ol>
              <li>Review your welcome pack</li>
              <li>Log in to your tenant portal to view any documents or messages</li>
              <li>Ensure your direct debit is set up for automatic rent payments</li>
              <li>Contact us if you have any questions</li>
            </ol>

            <p>If you have any questions or concerns, please don't hesitate to reach out to our support team.</p>
            
            <p>Best regards,<br>The Property Management Team</p>
          </body>
        </html>
      `
    });

    return Response.json({
      success: true,
      message: 'Welcome pack generated and email sent',
      tenantId,
      propertyId
    });

  } catch (error) {
    console.error('Welcome pack generation error:', error);
    return Response.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
});