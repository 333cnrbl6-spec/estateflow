import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { event_data } = await req.json();
    const inspection = event_data.data;

    // Only process if submitted and has findings requiring maintenance
    if (inspection.status !== 'submitted' || !inspection.findings || inspection.findings.length === 0) {
      return Response.json({ success: false, reason: 'No findings or not submitted' });
    }

    const maintenanceTickets = [];
    const findingsRequiringMaintenance = inspection.findings.filter(f => f.requires_maintenance);

    for (const finding of findingsRequiringMaintenance) {
      // Skip if already has maintenance request
      if (finding.maintenance_request_id) {
        continue;
      }

      try {
        const ticket = await base44.entities.MaintenanceRequest.create({
          property_id: inspection.property_id,
          unit_id: inspection.unit_id,
          title: `${finding.issue_type.replace(/_/g, ' ').toUpperCase()}: ${finding.location}`,
          description: finding.description,
          category: mapIssueToCategoryy(finding.issue_type),
          priority: mapSeverityToPriority(finding.severity),
          status: 'reported',
          photos: finding.photo_urls || [],
          internal_notes: `Flagged from inspection report by ${inspection.inspector_name} on ${new Date(inspection.inspection_date).toLocaleDateString()}`,
        });

        maintenanceTickets.push({
          finding_type: finding.issue_type,
          maintenance_request_id: ticket.id,
          severity: finding.severity,
        });

        // Update inspection finding with maintenance request ID
        const updatedFindings = inspection.findings.map(f =>
          f === finding ? { ...f, maintenance_request_id: ticket.id } : f
        );
        await base44.entities.InspectionReport.update(inspection.id, {
          findings: updatedFindings,
        });
      } catch (error) {
        console.error(`Error creating maintenance ticket for finding ${finding.issue_type}:`, error);
      }
    }

    return Response.json({
      success: true,
      inspection_id: inspection.id,
      maintenance_tickets_created: maintenanceTickets.length,
      tickets: maintenanceTickets,
    });
  } catch (error) {
    console.error('Error in createMaintenanceFromInspection:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function mapIssueToCategoryy(issueType) {
  const mapping = {
    electrical: 'electrical',
    plumbing: 'plumbing',
    structural: 'structural',
    heating: 'heating',
    decoration: 'decorating',
    safety: 'general',
    pest: 'general',
    damp_mould: 'general',
    other: 'general',
  };
  return mapping[issueType] || 'general';
}

function mapSeverityToPriority(severity) {
  const mapping = {
    critical: 'emergency',
    high: 'urgent',
    medium: 'standard',
    low: 'low',
  };
  return mapping[severity] || 'standard';
}