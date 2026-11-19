import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    // This function is called by the scheduled automation
    // It simply invokes the main notification function
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch((e) => (e.status === 401 ? null : Promise.reject(e)));
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    const result = await base44.asServiceRole.functions.invoke('sendTenantNotifications', {});
    
    return Response.json({
      success: true,
      timestamp: new Date().toISOString(),
      result: result.data
    });
  } catch (error) {
    console.error('Scheduled notification error:', error);
    return Response.json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
});