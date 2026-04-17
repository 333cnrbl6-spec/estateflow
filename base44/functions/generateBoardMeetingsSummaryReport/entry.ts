import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import { jsPDF } from 'npm:jspdf@4.0.0';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Calculate date range (last 30 days)
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Fetch concluded meetings from last month
    const meetings = await base44.asServiceRole.entities.BoardMeeting.filter({
      status: 'concluded'
    }, '-created_date', 100);

    const recentMeetings = meetings.filter(m => {
      const meetingDate = new Date(m.created_date);
      return meetingDate >= startDate && meetingDate <= endDate;
    });

    if (recentMeetings.length === 0) {
      return Response.json({ 
        status: 'skipped',
        reason: 'no_concluded_meetings_this_month'
      });
    }

    // Collect all decisions and action items
    const allDecisions = [];
    const allActions = [];

    recentMeetings.forEach(meeting => {
      if (meeting.decisions?.length) {
        meeting.decisions.forEach(d => {
          allDecisions.push({
            ...d,
            meeting_title: meeting.title,
            meeting_date: meeting.meeting_date
          });
        });
      }
      // Extract action items from decisions that have implementation_owner
      meeting.decisions?.forEach(d => {
        if (d.implementation_owner) {
          allActions.push({
            item: d.item,
            owner: d.implementation_owner,
            deadline: d.deadline,
            status: 'pending',
            meeting: meeting.title
          });
        }
      });
    });

    // Generate PDF
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;
    let yPosition = margin;

    // Header
    doc.setFontSize(20);
    doc.text('Board Meetings Monthly Summary', margin, yPosition);
    yPosition += 10;

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Report Period: ${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`, margin, yPosition);
    doc.text(`Generated: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`, margin, yPosition + 5);
    yPosition += 15;

    // Summary Stats
    doc.setTextColor(0);
    doc.setFontSize(12);
    doc.text('Summary', margin, yPosition);
    yPosition += 8;
    doc.setFontSize(10);
    doc.text(`Meetings Concluded: ${recentMeetings.length}`, margin + 5, yPosition);
    doc.text(`Decisions Made: ${allDecisions.length}`, margin + 5, yPosition + 5);
    doc.text(`Pending Action Items: ${allActions.length}`, margin + 5, yPosition + 10);
    yPosition += 20;

    // Decisions Section
    doc.setFontSize(12);
    doc.text('Decisions Made', margin, yPosition);
    yPosition += 8;

    doc.setFontSize(9);
    allDecisions.forEach((decision, idx) => {
      if (yPosition > pageHeight - margin - 10) {
        doc.addPage();
        yPosition = margin;
      }

      doc.setTextColor(0, 0, 100);
      doc.text(`${idx + 1}. ${decision.meeting_title}`, margin + 3, yPosition);
      yPosition += 5;

      doc.setTextColor(0);
      doc.text(`Decision: ${decision.decision?.substring(0, 70)}`, margin + 5, yPosition);
      yPosition += 4;

      if (decision.implementation_owner) {
        doc.text(`Owner: ${decision.implementation_owner}`, margin + 5, yPosition);
        yPosition += 4;
      }

      if (decision.deadline) {
        doc.text(`Deadline: ${new Date(decision.deadline).toLocaleDateString()}`, margin + 5, yPosition);
        yPosition += 4;
      }

      yPosition += 4;
    });

    yPosition += 8;

    // Action Items Section
    if (yPosition > pageHeight - margin - 30) {
      doc.addPage();
      yPosition = margin;
    }

    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text('Pending Action Items', margin, yPosition);
    yPosition += 8;

    doc.setFontSize(9);
    allActions.forEach((action, idx) => {
      if (yPosition > pageHeight - margin - 10) {
        doc.addPage();
        yPosition = margin;
      }

      doc.setTextColor(0, 0, 100);
      doc.text(`${idx + 1}. ${action.item}`, margin + 3, yPosition);
      yPosition += 5;

      doc.setTextColor(0);
      doc.text(`Owner: ${action.owner}`, margin + 5, yPosition);
      yPosition += 4;

      if (action.deadline) {
        const isOverdue = new Date(action.deadline) < new Date();
        doc.setTextColor(isOverdue ? 200 : 0);
        doc.text(`Deadline: ${new Date(action.deadline).toLocaleDateString()} ${isOverdue ? '(OVERDUE)' : ''}`, margin + 5, yPosition);
        yPosition += 4;
      }

      doc.setTextColor(100);
      doc.text(`From: ${action.meeting}`, margin + 5, yPosition);
      yPosition += 5;
    });

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text('Confidential - Board Members Only', margin, pageHeight - 10);

    // Convert PDF to base64
    const pdfBase64 = doc.output('dataurlstring').split('base64,')[1];

    // Get all board members
    const boardMembers = await base44.asServiceRole.entities.BoardMember.list();
    const emailAddresses = boardMembers
      .map(m => m.email)
      .filter(e => e); // Filter out empty emails

    // Send email to each board member
    const emailPromises = emailAddresses.map(email =>
      base44.integrations.Core.SendEmail({
        to: email,
        subject: `Board Meetings Monthly Summary - ${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}`,
        body: `Dear Board Member,

Please find attached your monthly summary of board meeting decisions and pending action items for the period ${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}.

Summary:
- Meetings Concluded: ${recentMeetings.length}
- Decisions Made: ${allDecisions.length}
- Pending Action Items: ${allActions.length}

This report includes all concluded meetings from the past 30 days. Please review the pending action items and ensure timely completion.

For more details, log in to the Boardroom at /boardroom.

Best regards,
Head Office Board`
      })
    );

    await Promise.all(emailPromises);

    return Response.json({
      status: 'success',
      meetings_included: recentMeetings.length,
      decisions_summarized: allDecisions.length,
      action_items_listed: allActions.length,
      emails_sent: emailAddresses.length,
      report_period: {
        start: startDate.toISOString().split('T')[0],
        end: endDate.toISOString().split('T')[0]
      }
    });

  } catch (error) {
    console.error('Error generating board summary report:', error);
    return Response.json({ 
      error: error.message,
      status: 'failed'
    }, { status: 500 });
  }
});