import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // This is a scheduled task - verify it's being called by the system
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.includes('Bearer')) {
      // Allow execution without user auth for scheduled tasks
      console.log('Running scheduled certificate expiry check');
    }

    // Call the main alert checking function
    const result = await base44.functions.invoke('checkCertificateExpiryAlerts', {});
    
    return Response.json({ 
      success: true,
      message: 'Certificate expiry check completed',
      result: result.data
    });

  } catch (error) {
    console.error('Error in scheduled certificate check:', error);
    return Response.json({ 
      success: false,
      error: error.message 
    }, { status: 500 });
  }
});