import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { vendorId, uploadedCount } = await req.json();

    // Get vendor details
    const vendor = await base44.asServiceRole.entities.Vendor.get(vendorId);

    // Get admin users
    const adminUsers = await base44.asServiceRole.entities.User.filter({
      role: 'admin'
    });

    const emailList = adminUsers.map(u => u.email).filter(e => e);

    if (emailList.length === 0) {
      return Response.json({ success: true });
    }

    const subject = `Vendor Document Upload: ${vendor.name}`;
    const body = `
Vendor ${vendor.name} has uploaded insurance documents.

Documents Uploaded: ${uploadedCount}

Action Required:
1. Review uploaded insurance certificates
2. Verify coverage amounts and expiry dates
3. Approve or request additional documentation

Vendor: ${vendor.name}
Contact: ${vendor.email}
Phone: ${vendor.phone}

Please review within 1 business day.
    `;

    await Promise.all(
      emailList.map(email =>
        base44.integrations.Core.SendEmail({
          to: email,
          subject,
          body
        }).catch(err => {
          console.error(`Failed to send email to ${email}:`, err);
          return null;
        })
      )
    );

    return Response.json({ success: true, adminsNotified: emailList.length });
  } catch (error) {
    console.error('Notification error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});