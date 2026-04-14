import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import jsPDF from 'npm:jspdf@4.0.0';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { propertyIds } = await req.json();

    // Fetch data
    const properties = propertyIds && propertyIds.length > 0
      ? (await Promise.all(propertyIds.map(id => base44.entities.Property?.get?.(id).catch(() => null)))) || []
      : (await base44.entities.Property?.list?.() || []);

    const certificates = await base44.entities.GasSafetyCertificate?.list?.() || [];
    const eicrCerts = await base44.entities.EICRCertificate?.list?.() || [];
    const epcs = await base44.entities.EnergyPerformanceCertificate?.list?.() || [];
    const insurance = await base44.entities.VendorInsurance?.list?.() || [];
    const maintenance = await base44.entities.MaintenanceOrder?.list?.() || [];
    const transactions = await base44.entities.FinancialTransaction?.list?.() || [];

    // Filter data
    const relevantCerts = certificates.filter(c => propertyIds ? propertyIds.includes(c.property_id) : true);
    const relevantEicr = eicrCerts.filter(c => propertyIds ? propertyIds.includes(c.property_id) : true);
    const relevantEpc = epcs.filter(c => propertyIds ? propertyIds.includes(c.property_id) : true);
    const relevantMaintenance = maintenance.filter(m => propertyIds ? propertyIds.includes(m.property_id) : true);

    // Calculate expiry statuses
    const now = new Date();
    const certExpirations = [
      ...relevantCerts.map(c => ({
        type: 'Gas Safety',
        property: properties.find(p => p.id === c.property_id)?.address || c.property_id,
        expiryDate: c.expiry_date,
        daysLeft: Math.floor((new Date(c.expiry_date) - now) / (1000 * 60 * 60 * 24))
      })),
      ...relevantEicr.map(c => ({
        type: 'EICR',
        property: properties.find(p => p.id === c.property_id)?.address || c.property_id,
        expiryDate: c.expiry_date,
        daysLeft: Math.floor((new Date(c.expiry_date) - now) / (1000 * 60 * 60 * 24))
      })),
      ...relevantEpc.map(c => ({
        type: 'EPC',
        property: properties.find(p => p.id === c.property_id)?.address || c.property_id,
        expiryDate: c.expiry_date,
        daysLeft: Math.floor((new Date(c.expiry_date) - now) / (1000 * 60 * 60 * 24))
      }))
    ].sort((a, b) => a.daysLeft - b.daysLeft);

    // Maintenance spending
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const maintenanceSpend = relevantMaintenance
      .filter(m => new Date(m.completion_date || m.created_date) > sixMonthsAgo)
      .reduce((sum, m) => sum + (m.cost || 0), 0);

    const monthlySpend = {};
    relevantMaintenance.forEach(m => {
      const date = new Date(m.completion_date || m.created_date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthlySpend[monthKey] = (monthlySpend[monthKey] || 0) + (m.cost || 0);
    });

    // Create PDF
    const doc = new jsPDF();
    let yPosition = 20;

    // Header
    doc.setFontSize(20);
    doc.text('Property Portfolio Compliance Report', 20, yPosition);
    yPosition += 12;

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated: ${new Date().toLocaleDateString()} | Properties: ${properties.length}`, 20, yPosition);
    yPosition += 15;

    // Executive Summary
    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text('Executive Summary', 20, yPosition);
    yPosition += 8;

    doc.setFontSize(10);
    const expiringSoon = certExpirations.filter(c => c.daysLeft > 0 && c.daysLeft <= 30).length;
    const expired = certExpirations.filter(c => c.daysLeft <= 0).length;

    doc.text(`Total Properties: ${properties.length}`, 20, yPosition);
    yPosition += 6;
    doc.text(`Safety Certificates Expiring Soon (30 days): ${expiringSoon}`, 20, yPosition);
    yPosition += 6;
    doc.text(`Expired Certificates: ${expired}`, 20, yPosition);
    yPosition += 6;
    doc.text(`6-Month Maintenance Spend: £${(maintenanceSpend / 100).toFixed(2)}`, 20, yPosition);
    yPosition += 15;

    // Certificate Expirations
    doc.setFontSize(14);
    doc.text('Upcoming Safety Certificate Expirations', 20, yPosition);
    yPosition += 8;

    if (certExpirations.length === 0) {
      doc.setFontSize(10);
      doc.text('No certificates found.', 20, yPosition);
      yPosition += 10;
    } else {
      doc.setFontSize(9);
      const tableData = certExpirations.slice(0, 15).map(cert => [
        cert.type,
        cert.property.substring(0, 25),
        cert.expiryDate,
        cert.daysLeft > 0 ? `${cert.daysLeft} days` : 'EXPIRED'
      ]);

      doc.autoTable({
        head: [['Type', 'Property', 'Expiry Date', 'Status']],
        body: tableData,
        startY: yPosition,
        margin: { left: 20, right: 20 },
        columnStyles: {
          0: { cellWidth: 25 },
          1: { cellWidth: 60 },
          2: { cellWidth: 35 },
          3: { cellWidth: 30 }
        }
      });

      yPosition = doc.lastAutoTable.finalY + 10;
    }

    if (yPosition > 250) {
      doc.addPage();
      yPosition = 20;
    }

    // Insurance Status
    doc.setFontSize(14);
    doc.text('Insurance Status Updates', 20, yPosition);
    yPosition += 8;

    if (insurance.length === 0) {
      doc.setFontSize(10);
      doc.text('No insurance policies found.', 20, yPosition);
      yPosition += 10;
    } else {
      doc.setFontSize(9);
      const insuranceStatus = insurance.slice(0, 10).map(policy => {
        const expiry = new Date(policy.expiry_date);
        const daysLeft = Math.floor((expiry - now) / (1000 * 60 * 60 * 24));
        const status = daysLeft < 0 ? 'EXPIRED' : daysLeft <= 30 ? 'EXPIRING' : 'ACTIVE';
        return [
          policy.insurance_type.replace(/_/g, ' '),
          policy.provider.substring(0, 20),
          policy.expiry_date,
          status
        ];
      });

      doc.autoTable({
        head: [['Type', 'Provider', 'Expiry Date', 'Status']],
        body: insuranceStatus,
        startY: yPosition,
        margin: { left: 20, right: 20 },
        columnStyles: {
          0: { cellWidth: 30 },
          1: { cellWidth: 35 },
          2: { cellWidth: 35 },
          3: { cellWidth: 30 }
        }
      });

      yPosition = doc.lastAutoTable.finalY + 10;
    }

    if (yPosition > 250) {
      doc.addPage();
      yPosition = 20;
    }

    // Maintenance Spend Trends
    doc.setFontSize(14);
    doc.text('Historical Maintenance Spend (Last 6 Months)', 20, yPosition);
    yPosition += 8;

    const months = Object.keys(monthlySpend).sort();
    if (months.length === 0) {
      doc.setFontSize(10);
      doc.text('No maintenance spend data available.', 20, yPosition);
    } else {
      doc.setFontSize(9);
      const spendData = months.map(month => {
        const [year, monthNum] = month.split('-');
        const monthName = new Date(year, parseInt(monthNum) - 1).toLocaleString('default', { month: 'short', year: 'numeric' });
        return [monthName, `£${(monthlySpend[month] / 100).toFixed(2)}`];
      });

      doc.autoTable({
        head: [['Month', 'Spend']],
        body: spendData,
        startY: yPosition,
        margin: { left: 20, right: 20 },
        columnStyles: {
          0: { cellWidth: 100 },
          1: { cellWidth: 70 }
        }
      });
    }

    // Footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text(
        `Page ${i} of ${pageCount}`,
        doc.internal.pageSize.getWidth() / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'center' }
      );
    }

    const pdfBytes = doc.output('arraybuffer');
    
    return new Response(pdfBytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="compliance-report-${new Date().toISOString().split('T')[0]}.pdf"`
      }
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});