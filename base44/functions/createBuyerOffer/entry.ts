import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import { v4 as uuidv4 } from 'npm:uuid@10.0.0';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Parse request body
    const body = await req.json();
    const { 
      sales_listing_id, 
      buyer_name, 
      buyer_email, 
      buyer_phone,
      offer_amount, 
      mortgage_status,
      is_chain_free,
      solicitor_name,
      solicitor_contact,
      target_completion_date,
      conditions
    } = body;

    // Validate required fields
    if (!sales_listing_id || !buyer_name || !buyer_email || !offer_amount) {
      return Response.json({ 
        success: false, 
        error: 'Missing required fields' 
      }, { status: 400 });
    }

    // Generate secure access token
    const access_token = uuidv4();
    const portal_url = `/buyer-portal?token=${access_token}`;

    // Get listing details for notification
    const listing = await base44.entities.SalesListing.get(sales_listing_id);
    if (!listing) {
      return Response.json({ 
        success: false, 
        error: 'Listing not found' 
      }, { status: 404 });
    }

    // Create the offer
    const offer = await base44.entities.BuyerPortalOffer.create({
      sales_listing_id,
      buyer_name,
      buyer_email,
      buyer_phone: buyer_phone || '',
      offer_amount,
      offer_date: new Date().toISOString(),
      status: 'submitted',
      mortgage_status: mortgage_status || 'unknown',
      is_chain_free: is_chain_free || false,
      solicitor_name: solicitor_name || '',
      solicitor_contact: solicitor_contact || '',
      target_completion_date: target_completion_date || '',
      conditions: conditions || [],
      access_token,
      portal_url,
      notes: `Offer submitted via buyer portal on ${new Date().toLocaleDateString()}`
    });

    // Send notification to agent
    try {
      await base44.integrations.Core.SendEmail({
        to: listing.listing_agent_name ? `${listing.listing_agent_name} <${listing.listing_agent_id}>` : 'agent@premiso.com',
        subject: `🏠 New Offer Received - ${listing.property_id}`,
        body: `
          <h2>New Offer Submitted</h2>
          <p><strong>Property:</strong> ${listing.property_id}</p>
          <p><strong>Asking Price:</strong> £${listing.asking_price?.toLocaleString()}</p>
          <hr/>
          <h3>Buyer Details</h3>
          <p><strong>Name:</strong> ${buyer_name}</p>
          <p><strong>Email:</strong> ${buyer_email}</p>
          <p><strong>Phone:</strong> ${buyer_phone || 'Not provided'}</p>
          <hr/>
          <h3>Offer Details</h3>
          <p><strong>Offer Amount:</strong> £${offer_amount.toLocaleString()}</p>
          <p><strong>Chain Free:</strong> ${is_chain_free ? 'Yes' : 'No'}</p>
          <p><strong>Mortgage Status:</strong> ${mortgage_status || 'Unknown'}</p>
          ${solicitor_name ? `<p><strong>Solicitor:</strong> ${solicitor_name}</p>` : ''}
          <hr/>
          <p><a href="${portal_url}" style="background: #1e40af; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Review Offer in Portal</a></p>
        `
      });
    } catch (emailErr) {
      console.error('Failed to send agent notification:', emailErr);
    }

    // Send confirmation to buyer
    try {
      await base44.integrations.Core.SendEmail({
        to: buyer_email,
        subject: `✓ Offer Submitted - ${listing.property_id}`,
        body: `
          <h2>Thank You for Your Offer</h2>
          <p>Dear ${buyer_name},</p>
          <p>Your offer has been successfully submitted for the property at ${listing.property_id}.</p>
          <hr/>
          <h3>Offer Summary</h3>
          <p><strong>Offer Amount:</strong> £${offer_amount.toLocaleString()}</p>
          <p><strong>Submission Date:</strong> ${new Date().toLocaleDateString()}</p>
          <p><strong>Status:</strong> Submitted</p>
          <hr/>
          <h3>Track Your Offer</h3>
          <p>You can track the status of your offer in real-time using your personal portal link:</p>
          <p><a href="${portal_url}" style="background: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Access Buyer Portal</a></p>
          <p style="margin-top: 20px;">You will receive email notifications when:</p>
          <ul>
            <li>The agent reviews your offer</li>
            <li>Your offer status changes</li>
            <li>A counter-offer is made</li>
          </ul>
          <hr/>
          <p style="color: #6b7280; font-size: 14px;">If you have any questions, please contact the agent directly.</p>
        `
      });
    } catch (emailErr) {
      console.error('Failed to send buyer confirmation:', emailErr);
    }

    return Response.json({
      success: true,
      offer_id: offer.id,
      access_token,
      portal_url,
      message: 'Offer submitted successfully. Confirmation email sent to buyer.'
    });

  } catch (error) {
    return Response.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
});