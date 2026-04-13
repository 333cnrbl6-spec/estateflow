import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Verify this is a service role call
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { event, data, old_data } = await req.json();

    if (event.type !== 'update' || !data || !old_data) {
      return Response.json({ success: true, message: 'No action needed' });
    }

    // Check if status changed
    if (data.status !== old_data.status) {
      const listing = await base44.entities.SalesListing.get(data.sales_listing_id);
      
      // Send notification
      await base44.functions.invoke('notifyOfferStatus', {
        offer_id: data.id,
        new_status: data.status,
        listing_address: listing?.marketing_text?.substring(0, 100) || 'Property',
        buyer_name: data.buyer_name,
        seller_name: listing?.listing_agent_name || 'Sales Team',
      });

      console.log(`Offer status changed to ${data.status}, notification sent to ${data.buyer_email}`);
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error('Error in offer notification automation:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});