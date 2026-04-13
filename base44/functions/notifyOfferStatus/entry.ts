import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { offer_id, new_status, listing_address, buyer_name, seller_name } = await req.json();

    if (!offer_id || !new_status) {
      return Response.json({ error: 'Offer ID and status required' }, { status: 400 });
    }

    // Get offer details
    const offer = await base44.entities.Offer.get(offer_id);
    if (!offer) {
      return Response.json({ error: 'Offer not found' }, { status: 404 });
    }

    // Create communication record
    const communication = await base44.entities.SalesCommunication.create({
      sales_listing_id: offer.sales_listing_id,
      offer_id: offer_id,
      thread_id: `offer_${offer_id}`,
      sender_type: 'agent',
      sender_id: user.id,
      sender_name: user.full_name,
      sender_email: user.email,
      recipient_type: 'buyer',
      recipient_id: offer.buyer_contact_id,
      recipient_name: offer.buyer_name,
      recipient_email: offer.buyer_email,
      subject: `Offer Status Update - ${listing_address || 'Property'}`,
      body: `Dear ${buyer_name},\n\nYour offer of £${offer.offer_amount.toLocaleString()} for ${listing_address} has been ${new_status.replace('_', ' ')}.\n\n${new_status === 'accepted' ? 'Congratulations! We will be in touch shortly with next steps.' : new_status === 'rejected' ? 'Thank you for your interest. Please contact us if you have any questions.' : 'We will update you as soon as we have more information.'}\n\nBest regards,\n${seller_name || 'The Sales Team'}`,
      message_type: 'offer_update',
      status: 'sent',
    });

    // Send SMS notification
    if (offer.buyer_phone) {
      try {
        const smsResult = await base44.functions.invoke('sendSalesSMS', {
          contact_phone: offer.buyer_phone,
          message: `Your offer for ${listing_address} has been ${new_status.replace('_', ' ')}. Check your email for details.`,
          listing_address: listing_address,
        });

        if (smsResult.data?.success) {
          await base44.entities.SalesCommunication.update(communication.id, {
            is_sms_sent: true,
            sms_sent_at: new Date().toISOString(),
          });
        }
      } catch (smsError) {
        console.error('SMS send failed:', smsError);
      }
    }

    return Response.json({ 
      success: true, 
      communication_id: communication.id,
      sms_sent: communication.is_sms_sent 
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});