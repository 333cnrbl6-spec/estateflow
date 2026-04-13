import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

/**
 * Glean property listings from public domains (Rightmove, Zoopla, OpenRent)
 * Used for: Demo data generation, Sales intelligence, Market research
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { search_query, location, property_type, listing_type, max_results = 20 } = await req.json();

    if (!search_query && !location) {
      return Response.json(
        { error: 'search_query or location required' },
        { status: 400 }
      );
    }

    // Use AI to glean public property listings
    const gleaningPrompt = `You are a property data analyst. Search public property listing websites for:
- Location: ${location || 'UK'}
- Search: ${search_query || ''}
- Type: ${property_type || 'residential'}
- Listing type: ${listing_type || 'both sales and lettings'}

From Rightmove, Zoopla, OpenRent and similar public sources, extract the top ${max_results} properties with:
- Full address
- Property type (flat, house, bungalow, etc.)
- Number of bedrooms
- Number of bathrooms
- Square footage (if available)
- Sale price (if for sale) or monthly rent (if to let)
- Description
- Agent/landlord name
- Council tax band (if available)
- Energy rating
- Key features
- Property condition (new build, period, etc.)

Return as JSON array with fields: address, property_type, bedrooms, bathrooms, sqft, price, monthly_rent, description, agent_name, council_tax_band, energy_rating, features, property_age, listing_url_reference.

For lettings, also include: furnished_type, minimum_lease_term, deposit_amount, available_date.`;

    const res = await base44.integrations.Core.InvokeLLM({
      prompt: gleaningPrompt,
      add_context_from_internet: true,
      response_json_schema: {
        type: 'object',
        properties: {
          properties: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                address: { type: 'string' },
                property_type: { type: 'string' },
                bedrooms: { type: 'number' },
                bathrooms: { type: 'number' },
                sqft: { type: 'number' },
                price: { type: 'number' },
                monthly_rent: { type: 'number' },
                description: { type: 'string' },
                agent_name: { type: 'string' },
                council_tax_band: { type: 'string' },
                energy_rating: { type: 'string' },
                features: { type: 'array', items: { type: 'string' } },
                property_age: { type: 'string' },
                listing_url_reference: { type: 'string' },
                furnished_type: { type: 'string' },
                minimum_lease_term: { type: 'string' },
                deposit_amount: { type: 'number' },
                available_date: { type: 'string' },
              },
            },
          },
          search_summary: {
            type: 'object',
            properties: {
              total_found: { type: 'number' },
              average_price: { type: 'number' },
              average_rent: { type: 'number' },
              most_common_type: { type: 'string' },
              market_insights: { type: 'string' },
            },
          },
        },
      },
    });

    return Response.json({
      success: true,
      data: res.properties || [],
      summary: res.search_summary,
      count: res.properties?.length || 0,
    });
  } catch (error) {
    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }
});