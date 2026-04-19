import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { propertyId } = await req.json().catch(() => ({}));

    // Fetch all necessary data
    const [properties, maintenanceOrders, documents, units] = await Promise.all([
      base44.asServiceRole.entities.Property.list(),
      base44.asServiceRole.entities.MaintenanceOrder.list(),
      base44.asServiceRole.entities.Document.list(),
      base44.asServiceRole.entities.Unit.list()
    ]);

    const predictions = [];
    const targetProperties = propertyId 
      ? properties.filter(p => p.id === propertyId)
      : properties;

    const today = new Date();

    for (const property of targetProperties) {
      let riskScore = 0;
      const riskFactors = [];

      // 1. Check expiring documents (high risk if expiring soon)
      const propertyDocs = documents?.filter(d => d.property_id === property.id) || [];
      propertyDocs.forEach(doc => {
        if (doc.expiry_date) {
          const expiry = new Date(doc.expiry_date);
          const daysUntilExpiry = Math.floor((expiry - today) / (1000 * 60 * 60 * 24));
          
          if (daysUntilExpiry < 30 && daysUntilExpiry >= 0) {
            riskScore += 15;
            riskFactors.push(`${doc.document_type} expires in ${daysUntilExpiry} days`);
          } else if (daysUntilExpiry < 0) {
            riskScore += 25;
            riskFactors.push(`${doc.document_type} EXPIRED - immediate action needed`);
          }
        }
      });

      // 2. Analyze maintenance frequency patterns
      const propertyMaintenance = maintenanceOrders?.filter(m => m.property_id === property.id) || [];
      
      if (propertyMaintenance.length > 0) {
        // Count maintenance by issue type in last 12 months
        const last12Months = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
        const recentMaintenance = propertyMaintenance.filter(m => {
          const orderDate = new Date(m.created_date || m.scheduled_date);
          return orderDate > last12Months;
        });

        // Calculate average maintenance frequency
        const avgMonthlyMaintenance = recentMaintenance.length / 12;
        if (avgMonthlyMaintenance > 2) {
          riskScore += 20;
          riskFactors.push(`High maintenance frequency (${recentMaintenance.length} jobs in 12 months)`);
        } else if (avgMonthlyMaintenance > 1) {
          riskScore += 10;
          riskFactors.push(`Moderate maintenance frequency (${recentMaintenance.length} jobs in 12 months)`);
        }

        // Check for recurring issues
        const issueTypes = {};
        propertyMaintenance.forEach(m => {
          const type = m.issue_type || 'unknown';
          issueTypes[type] = (issueTypes[type] || 0) + 1;
        });

        Object.entries(issueTypes).forEach(([type, count]) => {
          if (count >= 3) {
            riskScore += 15;
            riskFactors.push(`Recurring issue: ${type} (${count} incidents)`);
          }
        });
      }

      // 3. Property age factor (older properties need more maintenance)
      if (property.year_built) {
        const propertyAge = new Date().getFullYear() - property.year_built;
        if (propertyAge > 50) {
          riskScore += 20;
          riskFactors.push(`Property age: ${propertyAge} years (older properties need more maintenance)`);
        } else if (propertyAge > 30) {
          riskScore += 10;
          riskFactors.push(`Property age: ${propertyAge} years`);
        }
      }

      // 4. Total maintenance cost trend (if costs are increasing, more issues expected)
      if (propertyMaintenance.length >= 2) {
        const sortedByDate = propertyMaintenance.sort((a, b) => 
          new Date(a.scheduled_date || a.created_date) - new Date(b.scheduled_date || b.created_date)
        );

        const recentHalf = sortedByDate.slice(Math.floor(sortedByDate.length / 2));
        const olderHalf = sortedByDate.slice(0, Math.floor(sortedByDate.length / 2));

        const recentCost = recentHalf.reduce((sum, m) => sum + (m.total_cost || 0), 0);
        const olderCost = olderHalf.reduce((sum, m) => sum + (m.total_cost || 0), 0);

        if (olderCost > 0) {
          const costTrend = recentCost / olderCost;
          if (costTrend > 1.3) {
            riskScore += 15;
            riskFactors.push(`Maintenance costs trending up (${(costTrend * 100 - 100).toFixed(0)}% increase)`);
          }
        }
      }

      // Cap score at 100
      riskScore = Math.min(riskScore, 100);

      // Determine risk level
      let riskLevel = 'low';
      if (riskScore >= 70) {
        riskLevel = 'critical';
      } else if (riskScore >= 50) {
        riskLevel = 'high';
      } else if (riskScore >= 30) {
        riskLevel = 'medium';
      }

      predictions.push({
        propertyId: property.id,
        propertyName: property.name,
        riskScore,
        riskLevel,
        riskFactors,
        maintenanceCount: propertyMaintenance.length,
        expiredDocuments: propertyDocs.filter(d => d.expiry_date && new Date(d.expiry_date) < today).length,
        expiringDocuments: propertyDocs.filter(d => {
          const expiry = new Date(d.expiry_date || '2099-12-31');
          const daysUntilExpiry = Math.floor((expiry - today) / (1000 * 60 * 60 * 24));
          return daysUntilExpiry < 30 && daysUntilExpiry >= 0;
        }).length
      });
    }

    // Sort by risk score
    predictions.sort((a, b) => b.riskScore - a.riskScore);

    return Response.json({
      success: true,
      predictions,
      generated: new Date().toISOString()
    });
  } catch (error) {
    console.error('Prediction error:', error);
    return Response.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
});