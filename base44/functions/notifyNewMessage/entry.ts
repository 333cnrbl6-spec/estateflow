import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Allow both authenticated users and service role (for automations)
    const user = await base44.auth.me();
    
    const { message_id, recipient_type, property_id, maintenance_order_id } = await req.json();

    if (!message_id || !recipient_type) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const message = await base44.entities.Message.get(message_id);
    if (!message) {
      return Response.json({ error: 'Message not found' }, { status: 404 });
    }

    // Get recipient details based on type
    let recipientEmail = null;
    let recipientName = null;

    if (recipient_type === 'property_manager') {
      // Get property manager from property
      if (property_id) {
        const property = await base44.entities.Property.get(property_id);
        // In a real system, this would come from a PropertyManager entity or User with role
        // For now, we'll send to admin users
        const admins = await base44.entities.User.filter({ role: 'admin' });
        if (admins.length > 0) {
          recipientEmail = admins[0].email;
          recipientName = 'Property Manager';
        }
      }
    } else if (recipient_type === 'contractor') {
      // Get contractor from maintenance order
      if (maintenance_order_id) {
        const order = await base44.entities.MaintenanceOrder.get(maintenance_order_id);
        if (order && order.assigned_contractor_email) {
          recipientEmail = order.assigned_contractor_email;
          recipientName = order.assigned_contractor_name || 'Contractor';
        }
      }
    }

    if (!recipientEmail) {
      return Response.json({ 
        success: false, 
        message: 'No recipient found for notification' 
      });
    }

    // Send email notification
    const emailSubject = `📬 New Message: ${message.subject}`;
    const emailBody = `
Dear ${recipientName},

You have received a new message from ${message.sender_name}.

MESSAGE DETAILS
Subject: ${message.subject}
Type: ${message.message_type}
From: ${message.sender_name} (${message.sender_email || 'Tenant'})
Date: ${new Date(message.created_date).toLocaleString('en-GB')}

MESSAGE
${message.body}

---
To respond, please log in to the property management system or reply directly to this email.
    `.trim();

    await base44.asServiceRole.integrations.Core.SendEmail({
      to: recipientEmail,
      subject: emailSubject,
      body: emailBody,
    });

    // Create in-app notification for property manager
    if (recipient_type === 'property_manager') {
      await base44.entities.TenantNotification.create({
        tenant_id: null, // System notification
        title: `📬 New Message from ${message.sender_name}`,
        message: `${message.subject}: ${message.body.substring(0, 100)}...`,
        notification_type: 'message',
        is_read: false,
        sent_date: new Date().toISOString(),
        metadata: {
          message_id: message.id,
          thread_id: message.thread_id,
          property_id: message.property_id,
        },
      });
    }

    return Response.json({
      success: true,
      message: 'Notification sent successfully',
      recipient_email: recipientEmail,
    });

  } catch (error) {
    console.error('Message notification error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});