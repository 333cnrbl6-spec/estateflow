import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import { jsPDF } from 'npm:jspdf@4.0.0';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { property_id, month } = await req.json();

    if (!property_id || !month) {
      return Response.json({ error: 'Missing property_id or month' }, { status: 400 });
    }

    // Fetch data
    const property = await base44.entities.Property.get(property_id);
    
    const [year, monthNum] = month.split('-');
    const monthStart = new Date(year, parseInt(monthNum) - 1, 1);
    const monthEnd = new Date(year, parseInt(monthNum), 0);

    const transactions = await base44.entities.FinancialTransaction.filter({
      property_id: property_id,
    });

    const maintenance = await base44.entities.MaintenanceRequest.filter({
      property_id: property_id,
    });

    const units = await base44.entities.Unit.filter({
      property_id: property_id,
    });

    const tenants = await base44.entities.Tenant.filter({
      property_id: property_id,
    });

    // Filter by month
    const monthlyTransactions = transactions.filter(t => {
      const tDate = new Date(t.created_date);
      return tDate >= monthStart && tDate <= monthEnd;
    });

    const monthlyMaintenance = maintenance.filter(m => {
      const mDate = new Date(m.completion_date || m.created_date);
      return mDate >= monthStart && mDate <= monthEnd;
    });

    // Calculate metrics
    const income = monthlyTransactions
      .filter(t => t.type === 'income' || t.type === 'rent_received')
      .reduce((sum, t) => sum + (t.amount || 0), 0);

    const expenses = monthlyTransactions
      .filter(t => t.type === 'expense' || t.type === 'service_charge')
      .reduce((sum, t) => sum + (t.amount || 0), 0);

    const maintenanceCost = monthlyMaintenance.reduce((sum, m) => sum + (m.actual_cost || m.estimated_cost || 0), 0);

    const occupiedUnits = units.filter(u => u.status === 'occupied').length;
    const occupancyRate = units.length > 0 ? (occupiedUnits / units.length * 100).toFixed(1) : 0;

    const profit = income - expenses;

    // Generate PDF
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const monthName = new Date(year, parseInt(monthNum) - 1).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let yPos = 20;

    // Header
    doc.setFontSize(24);
    doc.setTextColor(30, 30, 30);
    doc.text(`Monthly Property Report`, pageWidth / 2, yPos, { align: 'center' });

    yPos += 12;
    doc.setFontSize(14);
    doc.setTextColor(100, 100, 100);
    doc.text(`${property.name} - ${monthName}`, pageWidth / 2, yPos, { align: 'center' });

    yPos += 20;

    // Key Metrics
    doc.setFontSize(12);
    doc.setTextColor(30, 30, 30);
    doc.text('Key Metrics', 20, yPos);
    yPos += 8;

    const metricsBox = [
      { label: 'Total Income', value: `£${income.toFixed(2)}`, color: '#22c55e' },
      { label: 'Total Expenses', value: `£${expenses.toFixed(2)}`, color: '#ef4444' },
      { label: 'Net Profit', value: `£${profit.toFixed(2)}`, color: profit >= 0 ? '#3b82f6' : '#ef4444' },
      { label: 'Occupancy Rate', value: `${occupancyRate}%`, color: '#f59e0b' },
    ];

    metricsBox.forEach((metric, idx) => {
      const x = 20 + (idx % 2) * 85;
      const y = yPos + Math.floor(idx / 2) * 25;

      doc.setDrawColor(200, 200, 200);
      doc.rect(x, y, 75, 20);
      doc.setFontSize(9);
      doc.setTextColor(100, 100, 100);
      doc.text(metric.label, x + 5, y + 6);
      doc.setFontSize(12);
      doc.setTextColor(30, 30, 30);
      doc.text(metric.value, x + 5, y + 15);
    });

    yPos += 55;

    // Income & Expense Summary
    doc.setFontSize(12);
    doc.setTextColor(30, 30, 30);
    doc.text('Financial Summary', 20, yPos);
    yPos += 8;

    doc.setFontSize(10);
    const summaryItems = [
      { label: 'Rental Income', value: income },
      { label: 'Operating Expenses', value: expenses },
      { label: 'Maintenance Costs', value: maintenanceCost },
      { label: 'Net Profit', value: profit },
    ];

    summaryItems.forEach(item => {
      doc.setTextColor(80, 80, 80);
      doc.text(item.label, 25, yPos);
      doc.setTextColor(30, 30, 30);
      doc.text(`£${item.value.toFixed(2)}`, pageWidth - 30, yPos, { align: 'right' });
      yPos += 7;
    });

    yPos += 10;

    // Occupancy Details
    doc.setFontSize(12);
    doc.setTextColor(30, 30, 30);
    doc.text('Occupancy Status', 20, yPos);
    yPos += 8;

    doc.setFontSize(10);
    doc.setTextColor(80, 80, 80);
    doc.text('Total Units', 25, yPos);
    doc.setTextColor(30, 30, 30);
    doc.text(units.length.toString(), pageWidth - 30, yPos, { align: 'right' });
    yPos += 7;

    doc.setTextColor(80, 80, 80);
    doc.text('Occupied Units', 25, yPos);
    doc.setTextColor(30, 30, 30);
    doc.text(occupiedUnits.toString(), pageWidth - 30, yPos, { align: 'right' });
    yPos += 7;

    doc.setTextColor(80, 80, 80);
    doc.text('Vacant Units', 25, yPos);
    doc.setTextColor(30, 30, 30);
    doc.text((units.length - occupiedUnits).toString(), pageWidth - 30, yPos, { align: 'right' });
    yPos += 12;

    // Maintenance Breakdown
    if (monthlyMaintenance.length > 0) {
      doc.setFontSize(12);
      doc.setTextColor(30, 30, 30);
      doc.text('Maintenance Activities', 20, yPos);
      yPos += 8;

      doc.setFontSize(9);
      const categoryBreakdown = {};
      monthlyMaintenance.forEach(m => {
        const cat = m.category || 'Other';
        if (!categoryBreakdown[cat]) categoryBreakdown[cat] = 0;
        categoryBreakdown[cat] += m.actual_cost || m.estimated_cost || 0;
      });

      Object.entries(categoryBreakdown).forEach(([cat, cost]) => {
        doc.setTextColor(80, 80, 80);
        doc.text(cat, 25, yPos);
        doc.setTextColor(30, 30, 30);
        doc.text(`£${cost.toFixed(2)}`, pageWidth - 30, yPos, { align: 'right' });
        yPos += 6;
      });
    }

    yPos += 10;

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Generated on ${new Date().toLocaleDateString('en-GB')} | Premiso Property Management`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );

    // Save and upload
    const pdfData = doc.output('arraybuffer');
    const fileName = `${property.name}-${month}-Report.pdf`;

    // Upload PDF
    const uploadRes = await base44.integrations.Core.UploadFile({
      file: new Blob([pdfData], { type: 'application/pdf' }),
    });

    return Response.json({
      success: true,
      pdf_url: uploadRes.file_url,
      filename: fileName,
    });
  } catch (error) {
    console.error('Error generating report:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});