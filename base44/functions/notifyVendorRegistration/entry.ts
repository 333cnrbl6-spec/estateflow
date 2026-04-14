import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { vendorId, vendorData } = await req.json();

    // Get admin users
    const adminUsers = await base44.asServiceRole.entities.User.filter({
      role: 'admin'
    });

    const emailList = adminUsers.map(u => u.email).filter(e => e);

    if (emailList.length === 0) {
      console.log('No admin users found for notification');
      return Response.json({ success: true });
    }

    // Send notification email to admins
    const subject = `New Vendor Registration: ${vendorData.name}`;
    const body = `
A new vendor has registered through the self-service portal:

Company: ${vendorData.name}
Contact: ${vendorData.contact_name}
Email: ${vendorData.email}
Phone: ${vendorData.phone}
Type: ${vendorData.type.replace(/_/g, ' ')}
Address: ${vendorData.address}, ${vendorData.postcode}

Next Steps:
1. Review the vendor profile
2. Verify insurance documents when uploaded
3. Approve and contact vendor to finalize agreement

Vendor ID: ${vendorId}

Action Required: This vendor needs document verification within 2 business days.
    `;

    // Send emails to all admins
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