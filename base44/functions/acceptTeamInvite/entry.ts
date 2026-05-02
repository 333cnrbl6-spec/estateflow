import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    const { teamMemberId } = await req.json();

    if (!user || !teamMemberId) {
      return Response.json({ error: 'Invalid request' }, { status: 400 });
    }

    // Get team member record
    const teamMember = await base44.asServiceRole.entities.TeamMember.get(teamMemberId);

    if (!teamMember || teamMember.email !== user.email) {
      return Response.json({ error: 'Invitation not found or already used' }, { status: 404 });
    }

    // Update status
    await base44.asServiceRole.entities.TeamMember.update(teamMemberId, {
      status: 'active',
      accepted_at: new Date().toISOString()
    });

    // Log audit
    await base44.asServiceRole.entities.AuditLog.create({
      action: 'team.invite_accepted',
      user_email: user.email,
      entity_type: 'TeamMember',
      entity_id: teamMemberId,
      changes: { status: 'active' },
      timestamp: new Date().toISOString()
    });

    return Response.json({ message: 'Invite accepted', teamMember });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});