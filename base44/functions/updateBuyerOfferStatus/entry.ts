import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { offer_id, status, agent_notes, counter_offer_amount } = body;

    if (!offer_id || !status) {
      return Response.json({ 
        success: false, 
        error: 'Missing required fields' 
      }, { status: 400 });
    }

    // Get the offer
    const offer = await base44.entities.BuyerPortalOffer.get(offer_id);
    if (!offer) {
      return Response.json({ 
        success: false, 
        error: 'Offer not found' 
      }, { status: 404 });
    }

    // Update the offer status
    const updatedOffer = await base44.entities.BuyerPortalOffer.update(offer_id, {
      status,
      notes: agent_notes ? `${offer.notes || ''}\n\n[Agent Update ${new Date().toLocaleDateString()}]: ${agent_notes}` : offer.notes,
      counter_offer_amount: counter_offer_amount || offer.counter_offer_amount
    });

    // Get listing details
    const listing = await base44.entities.SalesListing.get(offer.sales_listing_id);

    // Send status update notification to buyer
    const statusMessages = {
      'under_review': 'Your offer is now under review by the agent',
      'accepted': 'Congratulations! Your offer has been accepted',
      'rejected': 'We regret to inform you that your offer has not been accepted',
      'counter_offered': 'The seller has made a counter-offer',
      'withdrawn': 'Your offer has been withdrawn'
    };

    try {
      await base44.integrations.Core.SendEmail({
        to: offer.buyer_email,
        subject: `📧 Offer Status Update - ${listing?.property_id || 'Property'}`,
        body: `
          <h2>Offer Status Update</h2>
          <p>Dear ${offer.buyer_name},</p>
          <p>${statusMessages[status] || 'Your offer status has been updated'}</p>
          <hr/>
          <h3>Current Status</h3>
          <p><strong>Status:</strong> <span style="background: #dbeafe; color: #1e40af; padding: 4px 12px; border-radius: 4px; font-weight: bold;">${status.replace('_', ' ').toUpperCase()}</span></p>
          ${counter_offer_amount ? `<p><strong>Counter Offer:</strong> £${counter_offer_amount.toLocaleString()}</p>` : ''}
          ${agent_notes ? `<hr/><h3>Message from Agent</h3><p style="background: #f3f4f6; padding: 15px; border-radius: 5px;">${agent_notes}</p>` : ''}
          <hr/>
          <p><a href="${offer.portal_url}" style="background: #1e40af; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View in Buyer Portal</a></p>
        `
      });
    } catch (emailErr) {
      console.error('Failed to send status update:', emailErr);
    }

    return Response.json({
      success: true,
      offer: updatedOffer,
      message: 'Offer status updated successfully'
    });

  } catch (error) {
    return Response.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
});