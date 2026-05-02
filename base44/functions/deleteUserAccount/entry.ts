import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { confirm, reason } = await req.json();

    if (confirm !== true) {
      return Response.json({ error: 'Deletion not confirmed' }, { status: 400 });
    }

    // Mark for deletion (30-day grace period)
    const deleteAfter = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    await base44.auth.updateMe({
      marked_for_deletion: true,
      deletion_reason: reason,
      delete_after_date: deleteAfter.toISOString()
    });

    // Send confirmation email
    await base44.integrations.Core.SendEmail({
      to: user.email,
      subject: 'Account deletion scheduled',
      body: `Your account will be permanently deleted on ${deleteAfter.toDateString()}. Contact support to cancel deletion.`
    });

    return Response.json({
      message: 'Account marked for deletion',
      deleteDate: deleteAfter.toISOString(),
      gracePeriodDays: 30
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});