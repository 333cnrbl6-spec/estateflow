import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { tenant_id } = await req.json();

    if (!tenant_id) {
      return Response.json({ error: 'tenant_id required' }, { status: 400 });
    }

    // Fetch tenant to verify it exists and get details
    const tenant = await base44.entities.Tenant.get(tenant_id);
    if (!tenant) {
      return Response.json({ error: 'Tenant not found' }, { status: 404 });
    }

    // Generate secure random token using Web Crypto API
    const randomBytes = crypto.getRandomValues(new Uint8Array(32));
    const token = Array.from(randomBytes).map(b => b.toString(16).padStart(2, '0')).join('');
    
    // Hash token for storage
    const tokenData = new TextEncoder().encode(token);
    const hashBuffer = await crypto.subtle.digest('SHA-256', tokenData);
    const tokenHash = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
    
    // Create token record in database for later validation
    const tokenRecord = await base44.entities.TenantAccessToken.create({
      tenant_id: tenant.id,
      tenant_email: tenant.email,
      property_id: tenant.property_id,
      unit_id: tenant.unit_id,
      token: tokenHash,
      created_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(), // 90 days
      is_active: true
    });

    // Store tenant data locally for quick access (optional, for frontend token auth)
    const portalUrl = `${Deno.env.get('APP_URL') || 'http://localhost:5173'}/tenant-portal?token=${token}`;

    // Send email with access link (if SALES_LEAD_EMAIL is configured as email service)
    try {
      await base44.integrations.Core.SendEmail({
        to: tenant.email,
        subject: 'Your Tenant Portal Access Link',
        body: `
          <h2>Welcome to Your Tenant Portal</h2>
          <p>Hello ${tenant.full_name},</p>
          <p>You now have access to your personal tenant portal where you can:</p>
          <ul>
            <li>Submit and track maintenance requests with photo uploads</li>
            <li>View property announcements and updates</li>
            <li>Download lease agreements and safety certificates</li>
          </ul>
          <p><a href="${portalUrl}" style="background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Access Your Portal</a></p>
          <p>Or copy this link: ${portalUrl}</p>
          <p>This link will expire in 90 days.</p>
          <p>Best regards,<br/>Property Management Team</p>
        `
      });
    } catch (emailErr) {
      console.warn('Failed to send email:', emailErr.message);
      // Don't fail the entire request if email fails
    }

    return Response.json({
      success: true,
      token,
      portalUrl,
      expiresIn: '90 days',
      message: `Access link sent to ${tenant.email}`
    });
  } catch (error) {
    console.error('Error generating tenant portal token:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});