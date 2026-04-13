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

    // Fetch property data with error handling
    let property;
    let listing = null;
    let unit = null;

    try {
      if (property_id) {
        property = await base44.entities.Property.get(property_id);
      } else if (listing_id) {
        listing = await base44.entities.SalesListing.get(listing_id);
        if (listing?.property_id) {
          property = await base44.entities.Property.get(listing.property_id);
        }
        if (listing?.unit_id) {
          unit = await base44.entities.Unit.get(listing.unit_id);
        }
      }
    } catch (fetchError) {
      console.error('Error fetching property data:', fetchError);
      return Response.json({ error: 'Failed to fetch property data', details: fetchError.message }, { status: 500 });
    }

    if (!property) {
      return Response.json({ error: 'Property not found' }, { status: 404 });
    }

    // Fetch comparable sales listings
    const allSalesListings = await base44.entities.SalesListing.filter({ status: 'active' });
    const comparableSales = allSalesListings
      .filter(l => l.property_id !== property_id && l.asking_price)
      .slice(0, 10)
      .map(l => ({
        asking_price: l.asking_price,
        property_type: l.property_type,
        bedrooms: l.bedrooms,
        bathrooms: l.bathrooms,
        status: l.status,
        listed_date: l.listed_date,
        epc_rating: l.epc_rating,
        tenure: l.tenure,
        floor_area_sqft: l.floor_area_sqft
      }));

    // Fetch rental units for comparison
    const allUnits = await base44.entities.Unit.filter({});
    const comparableRentals = allUnits
      .filter(u => u.monthly_rent && u.status === 'occupied')
      .slice(0, 10)
      .map(u => ({
        monthly_rent: u.monthly_rent,
        unit_type: u.unit_type,
        bedrooms: u.bedrooms,
        floor: u.floor,
        tenure: u.tenure
      }));

    // Fetch recent transactions
    const transactions = await base44.entities.SalesTransaction.filter({});
    const recentSales = transactions
      .filter(t => t.status === 'completed' && t.sale_price)
      .slice(0, 10)
      .map(s => ({
        sale_price: s.sale_price,
        sale_date: s.completion_date,
        days_on_market: s.days_on_market,
        sale_price_per_sqft: s.sale_price / (s.days_on_market || 1)
      }));

    // Fetch compliance certificates
    const certificates = await base44.entities.SafetyCertificate.filter({
      property_id: property_id
    });
    
    const complianceCertificates = certificates.map(cert => ({
      type: cert.certificate_type,
      status: cert.status,
      issued_date: cert.issued_date,
      expiry_date: cert.expiry_date,
      inspector_name: cert.inspector_name
    }));

    // Prepare comprehensive market data
    const marketData = {
      property: {
        name: property.name,
        address: `${property.address_line_1}, ${property.city}, ${property.postcode}`,
        region: property.region,
        property_type: property.property_type,
        ownership_type: property.ownership_type,
        total_units: property.total_units,
        year_built: property.year_built,
        epc_rating: listing?.epc_rating || 'unknown',
        current_price: listing?.asking_price || null,
        current_rent: unit?.monthly_rent || null,
      },
      comparable_sales: comparableSales,
      comparable_rentals: comparableRentals,
      recent_sales: recentSales,
      compliance_data: {
        certificates: complianceCertificates,
        hmo_status: property.total_units && property.total_units >= 5 ? 'check_required' : 'not_applicable',
        epc_current: listing?.epc_rating || 'unknown',
      },
      market_metrics: {
        total_active_listings: allSalesListings.length,
        total_rental_units: allUnits.filter(u => u.monthly_rent).length,
        average_days_on_market: recentSales.length > 0 
          ? Math.round(recentSales.reduce((sum, s) => sum + (s.days_on_market || 0), 0) / recentSales.length)
          : null,
        median_sale_price: recentSales.length > 0
          ? Math.round(recentSales.map(s => s.sale_price).sort((a, b) => a - b)[Math.floor(recentSales.length / 2)])
          : null,
        average_rental_price: comparableRentals.length > 0
          ? Math.round(comparableRentals.reduce((sum, r) => sum + r.monthly_rent, 0) / comparableRentals.length)
          : null,
        market_velocity: recentSales.length > 0 ? 'active' : 'slow',
      }
    };

    // Call AI for comprehensive valuation with timeout
    let aiResponse;
    try {
      aiResponse = await base44.functions.invoke('aiPropertyValuation', {
        property_data: marketData,
        listing_id: listing_id || null,
      });
    } catch (aiError) {
      console.error('AI valuation failed:', aiError);
      // Return market data without AI valuation
      return Response.json({
        success: true,
        valuation: null,
        market_data: marketData,
        ai_error: 'Valuation service temporarily unavailable',
      });
    }

    return Response.json({
      success: true,
      valuation: aiResponse.valuation,
      market_data: marketData,
    });
  } catch (error) {
    console.error('Error generating comprehensive property valuation:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});