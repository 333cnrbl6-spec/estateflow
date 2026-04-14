import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { vendorId } = await req.json();

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

    const subject = `Vendor Agreement Signed: ${vendor.name}`;
    const body = `
Vendor ${vendor.name} has signed the service agreement.

Registration Status: READY FOR FINAL APPROVAL

Vendor Details:
- Name: ${vendor.name}
- Type: ${vendor.type.replace(/_/g, ' ')}
- Contact: ${vendor.contact_name}
- Email: ${vendor.email}
- Phone: ${vendor.phone}

All required documents have been submitted:
✓ Business Registration
✓ Insurance Documents
✓ Service Agreement

Next Steps:
1. Final review of all documents
2. Send approval email to vendor
3. Vendor can begin accepting jobs

Vendor ID: ${vendorId}
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