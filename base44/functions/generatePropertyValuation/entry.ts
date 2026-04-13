import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { property_id, listing_id } = await req.json();

    if (!property_id && !listing_id) {
      return Response.json({ error: 'Property ID or Listing ID required' }, { status: 400 });
    }

    // Fetch property data
    let property;
    if (property_id) {
      property = await base44.entities.Property.get(property_id);
    } else if (listing_id) {
      const listing = await base44.entities.SalesListing.get(listing_id);
      if (listing?.property_id) {
        property = await base44.entities.Property.get(listing.property_id);
      }
    }

    if (!property) {
      return Response.json({ error: 'Property not found' }, { status: 404 });
    }

    // Fetch comparable listings (same region, similar type)
    const allListings = await base44.entities.SalesListing.filter({ status: 'active' });
    const comparables = allListings.filter(l => {
      if (!l.property_id || l.id === listing_id) return false;
      // In real implementation, would fetch property details for each listing
      return true; // Simplified for demo
    }).slice(0, 5);

    // Fetch recent transactions in the area
    const transactions = await base44.entities.SalesTransaction.filter({});
    const recentSales = transactions
      .filter(t => t.status === 'completed')
      .slice(0, 5);

    // Prepare market data for AI analysis
    const marketData = {
      property: {
        name: property.name,
        address: `${property.address_line_1}, ${property.city}, ${property.postcode}`,
        region: property.region,
        property_type: property.property_type,
        ownership_type: property.ownership_type,
        total_units: property.total_units,
        year_built: property.year_built,
      },
      comparables: comparables.map(c => ({
        asking_price: c.asking_price,
        property_type: c.property_type,
        bedrooms: c.bedrooms,
        status: c.status,
        listed_date: c.listed_date,
      })),
      recent_sales: recentSales.map(s => ({
        sale_price: s.sale_price,
        sale_date: s.completion_date,
        days_on_market: s.days_on_market,
      })),
      market_metrics: {
        total_active_listings: allListings.filter(l => l.status === 'active').length,
        average_days_on_market: recentSales.length > 0 
          ? Math.round(recentSales.reduce((sum, s) => sum + (s.days_on_market || 0), 0) / recentSales.length)
          : null,
        median_sale_price: recentSales.length > 0
          ? Math.round(recentSales.map(s => s.sale_price).sort((a, b) => a - b)[Math.floor(recentSales.length / 2)])
          : null,
      }
    };

    // Call AI for valuation
    const aiResponse = await base44.functions.invoke('aiPropertyValuation', {
      property_data: marketData,
      listing_id: listing_id || null,
    });

    return Response.json({
      success: true,
      valuation: aiResponse.valuation,
      market_data: marketData,
    });
  } catch (error) {
    console.error('Error generating property valuation:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});