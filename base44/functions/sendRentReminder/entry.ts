import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import { z } from 'npm:zod@3.24.2';

const RentReminderSchema = z.object({
  invoiceId: z.string().min(1, 'Invoice ID required'),
  sendEmail: z.boolean().default(true),
});

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let body;
    try {
      body = await req.json();
    } catch {
      return Response.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    const validation = RentReminderSchema.safeParse(body);
    if (!validation.success) {
      const errors = validation.error.errors.map(e => `${e.path.join('.')}: ${e.message}`);
      return Response.json({ error: 'Validation failed', details: errors }, { status: 400 });
    }

    const { invoiceId, sendEmail } = validation.data;

    // Fetch invoice
    const invoice = await base44.entities.Invoice.get(invoiceId);
    if (!invoice) {
      return Response.json({ error: 'Invoice not found' }, { status: 404 });
    }

    // Fetch tenant
    const tenant = await base44.entities.Tenant.get(invoice.contractor_id);
    if (!tenant) {
      return Response.json({ error: 'Tenant not found' }, { status: 404 });
    }

    // Calculate days overdue
    const invoiceDate = new Date(invoice.submitted_date);
    const daysOverdue = Math.floor((new Date() - invoiceDate) / (1000 * 60 * 60 * 24));

    // Send reminder email
    if (sendEmail && tenant.email) {
      const emailSubject = daysOverdue > 30 
        ? `URGENT: Overdue Rent Payment - £${invoice.amount}`
        : `Rent Payment Reminder - £${invoice.amount}`;

      const emailBody = `
Dear ${tenant.name},

${daysOverdue > 30 
  ? `Your rent payment is now ${daysOverdue} days overdue.` 
  : `This is a friendly reminder that your rent payment is due.`}

Invoice Details:
- Amount: £${invoice.amount}
- Due Date: ${new Date(invoice.submitted_date).toLocaleDateString()}
- Days Outstanding: ${daysOverdue}
- Invoice: ${invoiceId.slice(0, 8)}

Please arrange payment immediately to avoid further action.

If you have already paid, please disregard this notice.

Best regards,
Property Management Team
      `;

      try {
        await base44.integrations.Core.SendEmail({
          to: tenant.email,
          subject: emailSubject,
          body: emailBody,
        });
      } catch (emailError) {
        console.error('Email send error:', emailError);
        // Continue even if email fails
      }
    }

    // Update invoice with reminder sent
    await base44.entities.Invoice.update(invoiceId, {
      notes: (invoice.notes || '') + `\nReminder sent: ${new Date().toISOString()}`,
    });

    // CRITICAL: Never return PII or sensitive invoice details in API response
    return Response.json({
      success: true,
      message: 'Reminder sent successfully'
    });
  } catch (error) {
    console.error('Rent reminder error:', error.message);
    return Response.json(
      { error: 'Failed to send reminder' },
      { status: 500 }
    );
  }
});