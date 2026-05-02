import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { email, full_name, role } = await req.json();

    if (!email || !role) {
      return Response.json({ error: 'Email and role required' }, { status: 400 });
    }

    // Check if already invited
    const existing = await base44.asServiceRole.entities.TeamMember.filter({ email: email });
    if (existing.length > 0) {
      return Response.json({ error: 'Already invited' }, { status: 409 });
    }

    // Create team member record
    const teamMember = await base44.asServiceRole.entities.TeamMember.create({
      email,
      full_name: full_name || email.split('@')[0],
      role,
      status: 'invited',
      invited_by: user.email,
      invited_at: new Date().toISOString(),
      permissions: getDefaultPermissions(role)
    });

    // Send invitation email
    await base44.integrations.Core.SendEmail({
      to: email,
      subject: 'You\'ve been invited to Premiso',
      body: `${user.full_name} invited you to join their Premiso team with ${role} access. Click here to accept: https://app.premiso.io/accept-invite/${teamMember.id}`
    });

    return Response.json({ 
      message: 'Invitation sent',
      teamMember 
    });
  } catch (error) {
    console.error('Invite error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function getDefaultPermissions(role) {
  const permissionMap = {
    admin: {
      properties: ['create', 'read', 'update', 'delete'],
      tenants: ['create', 'read', 'update', 'delete'],
      financials: ['read', 'export'],
      maintenance: ['create', 'read', 'update', 'assign'],
      team: ['invite', 'manage', 'remove'],
      reports: ['read', 'export', 'custom']
    },
    manager: {
      properties: ['read', 'update'],
      tenants: ['read', 'update'],
      financials: ['read'],
      maintenance: ['create', 'read', 'update', 'assign'],
      team: [],
      reports: ['read', 'export']
    },
    accountant: {
      properties: ['read'],
      tenants: [],
      financials: ['read', 'export'],
      maintenance: [],
      team: [],
      reports: ['read', 'export']
    },
    maintenance_coordinator: {
      properties: ['read'],
      tenants: ['read'],
      financials: [],
      maintenance: ['create', 'read', 'update', 'assign'],
      team: [],
      reports: ['read']
    },
    viewer: {
      properties: ['read'],
      tenants: ['read'],
      financials: ['read'],
      maintenance: ['read'],
      team: [],
      reports: ['read']
    }
  };

  return permissionMap[role] || permissionMap.viewer;
}