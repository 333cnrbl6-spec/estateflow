import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const limits = new Map();

function checkRateLimit(key, maxRequests, windowMs) {
  const now = Date.now();
  let record = limits.get(key);
  if (!record || now - record.resetTime > windowMs) {
    record = { count: 0, resetTime: now };
    limits.set(key, record);
  }
  if (record.count >= maxRequests) {
    const retryAfter = Math.ceil((record.resetTime + windowMs - now) / 1000);
    const err = new Error(`Rate limit exceeded. Max ${maxRequests} per ${Math.floor(windowMs/1000)}s. Retry after ${retryAfter}s.`);
    err.status = 429;
    throw err;
  }
  record.count++;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Rate limit: 2 demo generations per minute per user
    checkRateLimit(user.email, 2, 60000);

    // Fetch real property listings for the agent's area
    const listingsPrompt = `
Search for current residential property listings (for sale) in the UK. Focus on properties that would typically be listed by estate agents.

Find real examples across different price ranges and property types. For each property, provide:
- Full address with realistic UK postcode
- Property type
- Bedrooms, bathrooms, reception rooms
- Asking price
- Brief description
- Key features
- EPC rating and council tax band if available

Return 12 diverse properties across different UK regions (Brighton, Blackpool, Leeds, Ipswich, Lancashire, North Wales, etc.) with realistic prices and details.

Format as JSON array:
[
  {
    "address": "full address",
    "postcode": "UK postcode",
    "price": number,
    "type": "property type",
    "bedrooms": number,
    "bathrooms": number,
    "tenure": "freehold|leasehold",
    "epc": "A-G",
    "council_tax": "A-H",
    "features": ["feature1", "feature2"],
    "description": "property description"
  }
]
`;

    const realListingsResult = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: listingsPrompt,
      add_context_from_internet: true,
      model: 'gemini_3_flash',
      response_json_schema: {
        type: 'object',
        properties: {
          listings: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                address: { type: 'string' },
                postcode: { type: 'string' },
                price: { type: 'number' },
                type: { type: 'string' },
                bedrooms: { type: 'number' },
                bathrooms: { type: 'number' },
                tenure: { type: 'string' },
                epc: { type: 'string' },
                council_tax: { type: 'string' },
                features: { type: 'array', items: { type: 'string' } },
                description: { type: 'string' }
              }
            }
          }
        }
      }
    });

    const properties = realListingsResult?.listings || [
      {
        address: "Admiral Point, Blackpool",
        postcode: "FY1 5DU",
        price: 285000,
        type: "flat",
        bedrooms: 2,
        bathrooms: 2,
        tenure: "leasehold",
        epc: "B",
        council_tax: "C",
        features: ["Sea views", "Balcony", "Parking", "Lift access"],
        description: "A stunning two-bedroom apartment with panoramic sea views..."
      },
      {
        address: "Reed Close, Brighton",
        postcode: "BN1 4GH",
        price: 525000,
        type: "terraced",
        bedrooms: 3,
        bathrooms: 2,
        tenure: "freehold",
        epc: "C",
        council_tax: "D",
        features: ["Garden", "Recently renovated", "Close to station"],
        description: "Beautifully presented Victorian terraced house..."
      },
      {
        address: "Kettering Road, Ipswich",
        postcode: "IP1 3BE",
        price: 195000,
        type: "semi_detached",
        bedrooms: 3,
        bathrooms: 1,
        tenure: "freehold",
        epc: "D",
        council_tax: "C",
        features: ["Driveway", "Large garden", "Garage"],
        description: "Well-maintained family home in popular location..."
      },
      {
        address: "The Calls, Leeds",
        postcode: "LS2 7EY",
        price: 375000,
        type: "apartment",
        bedrooms: 2,
        bathrooms: 2,
        tenure: "leasehold",
        epc: "B",
        council_tax: "D",
        features: ["City centre", "Concierge", "Gym", "Balcony"],
        description: "Luxury apartment in the heart of Leeds..."
      },
      {
        address: "Marine Parade, Brighton",
        postcode: "BN2 1TL",
        price: 895000,
        type: "penthouse",
        bedrooms: 3,
        bathrooms: 3,
        tenure: "leasehold",
        epc: "C",
        council_tax: "F",
        features: ["Sea views", "Roof terrace", "Parking", "Porter"],
        description: "Exceptional penthouse with breathtaking coastal views..."
      },
      {
        address: "Victoria Street, Blackpool",
        postcode: "FY1 1HU",
        price: 145000,
        type: "flat",
        bedrooms: 1,
        bathrooms: 1,
        tenure: "leasehold",
        epc: "C",
        council_tax: "A",
        features: ["Town centre", "Recently refurbished"],
        description: "Modern one-bedroom apartment ideal for first-time buyers..."
      },
      {
        address: "Headingley Lane, Leeds",
        postcode: "LS6 2AS",
        price: 425000,
        type: "detached",
        bedrooms: 4,
        bathrooms: 3,
        tenure: "freehold",
        epc: "C",
        council_tax: "E",
        features: ["Double garage", "Large plot", "Period features"],
        description: "Impressive detached family home in sought-after area..."
      },
      {
        address: "Colne Road, Burnley",
        postcode: "BB10 1DX",
        price: 165000,
        type: "terraced",
        bedrooms: 2,
        bathrooms: 1,
        tenure: "freehold",
        epc: "D",
        council_tax: "B",
        features: ["Stone built", "Character property", "Courtyard"],
        description: "Charming traditional stone cottage..."
      },
      {
        address: "Promenade, Morecambe",
        postcode: "LA4 4AF",
        price: 210000,
        type: "flat",
        bedrooms: 2,
        bathrooms: 1,
        tenure: "leasehold",
        epc: "C",
        council_tax: "B",
        features: ["Sea views", "Balcony", "Communal gardens"],
        description: "Bay-fronted apartment with stunning views..."
      },
      {
        address: "Bolton Road, Blackburn",
        postcode: "BB1 3HF",
        price: 185000,
        type: "semi_detached",
        bedrooms: 3,
        bathrooms: 1,
        tenure: "freehold",
        epc: "D",
        council_tax: "C",
        features: ["Off-road parking", "Garden", "Close to amenities"],
        description: "Spacious family home with great potential..."
      },
      {
        address: "North Wales Coast",
        postcode: "LL30 2DF",
        price: 325000,
        type: "detached",
        bedrooms: 3,
        bathrooms: 2,
        tenure: "freehold",
        epc: "C",
        council_tax: "D",
        features: ["Sea views", "Garden", "Garage", "Quiet location"],
        description: "Detached bungalow with coastal views..."
      },
      {
        address: "Lancashire Village",
        postcode: "BB12 8JX",
        price: 275000,
        type: "detached",
        bedrooms: 3,
        bathrooms: 2,
        tenure: "freehold",
        epc: "C",
        council_tax: "D",
        features: ["Village location", "Garden", "Parking", "Character"],
        description: "Charming detached cottage in picturesque village..."
      }
    ];

    // Sample leads from various sources
    const leads = [
      {
        lead_type: "buyer",
        contact_name: "James Thompson",
        contact_email: "james.thompson@email.com",
        contact_phone: "07700 900123",
        source: "website",
        property_type: "house",
        location_preference: "Brighton",
        bedrooms_min: 3,
        budget_min: 400000,
        budget_max: 600000,
        timescale: "3_months",
        motivation: "Growing family needs more space",
        status: "qualified",
        lead_score: 75
      },
      {
        lead_type: "buyer",
        contact_name: "Sarah Mitchell",
        contact_email: "s.mitchell@email.com",
        contact_phone: "07700 900456",
        source: "portal",
        property_type: "flat",
        location_preference: "Leeds city centre",
        bedrooms_min: 2,
        budget_min: 250000,
        budget_max: 400000,
        timescale: "1_month",
        motivation: "Investment property",
        status: "new",
        lead_score: 60
      },
      {
        lead_type: "seller",
        contact_name: "Michael Roberts",
        contact_email: "m.roberts@email.com",
        contact_phone: "07700 900789",
        source: "phone",
        property_type: "detached",
        location_preference: "Blackpool",
        timescale: "6_months",
        motivation: "Downsizing after retirement",
        status: "contacted",
        lead_score: 85
      },
      {
        lead_type: "buyer",
        contact_name: "Emma Davies",
        contact_email: "emma.davies@email.com",
        contact_phone: "07700 901234",
        source: "referral",
        property_type: "terraced",
        location_preference: "Ipswich",
        bedrooms_min: 2,
        budget_min: 180000,
        budget_max: 250000,
        timescale: "immediate",
        motivation: "First time buyer",
        status: "qualified",
        lead_score: 90
      },
      {
        lead_type: "landlord",
        contact_name: "Property Invest Ltd",
        contact_email: "info@propertyinvest.co.uk",
        contact_phone: "07700 905678",
        source: "email",
        property_type: "flat",
        location_preference: "Brighton",
        timescale: "3_months",
        motivation: "Portfolio expansion",
        status: "nurturing",
        lead_score: 70
      }
    ];

    // Sample transactions
    const transactions = [
      {
        sale_price: 285000,
        status: "exchange_of_contracts",
        target_completion_date: "2026-05-01",
        chain_position: "in_chain"
      },
      {
        sale_price: 525000,
        status: "searches_underway",
        target_completion_date: "2026-06-15",
        chain_position: "no_chain"
      },
      {
        sale_price: 375000,
        status: "mortgage_offer_received",
        target_completion_date: "2026-05-20",
        chain_position: "in_chain"
      },
      {
        sale_price: 195000,
        status: "offer_accepted",
        target_completion_date: "2026-07-01",
        chain_position: "first_time_buyer"
      }
    ];

    // Helper to map postcode to region
    const getRegion = (postcode) => {
      if (postcode.startsWith('BN')) return 'brighton';
      if (postcode.startsWith('FY')) return 'blackpool';
      if (postcode.startsWith('LS')) return 'leeds';
      if (postcode.startsWith('IP')) return 'ipswich';
      if (postcode.startsWith('BB')) return 'lancashire';
      if (postcode.startsWith('LL')) return 'north_wales';
      return 'other';
    };

    // Bulk create Properties
    const propertyData = properties.map(prop => ({
      name: prop.address.split(',')[0],
      address_line_1: prop.address,
      postcode: prop.postcode,
      region: getRegion(prop.postcode),
      property_type: 'freehold_block',
      ownership_type: prop.tenure,
      total_units: 1
    }));

    const createdProperties = await Promise.all(
      propertyData.map(data => base44.entities.Property.create(data))
    ).then(entities => entities.map((entity, i) => ({ ...properties[i], entity })));

    // Bulk create SalesListings in parallel
    const listingStatuses = ["active", "active", "active", "under_offer", "sold_subject_to_contract", "active", "active", "active", "active", "draft", "active", "active"];
    const createdListings = await Promise.all(
      createdProperties.map((prop, i) => 
        base44.entities.SalesListing.create({
          property_id: prop.entity.id,
          listing_type: "sale",
          status: listingStatuses[i % 12],
          asking_price: prop.price,
          marketing_text: prop.description,
          featured_text: `${prop.bedrooms} bed ${prop.type} - £${(prop.price/1000).toFixed(0)}K`,
          bedrooms: prop.bedrooms,
          bathrooms: prop.bathrooms,
          reception_rooms: Math.max(1, prop.bedrooms - 1),
          property_type: prop.type,
          tenure: prop.tenure,
          council_tax_band: prop.council_tax,
          epc_rating: prop.epc,
          features: prop.features,
          listing_agent_id: user.id,
          listing_agent_name: user.full_name,
          listed_date: new Date().toISOString().split('T')[0],
          viewing_count: Math.floor(Math.random() * 20),
          offer_count: Math.floor(Math.random() * 5)
        })
      )
    ).then(entities => entities.map((listing, i) => ({ ...createdProperties[i], listing })));

    // Bulk create Leads in parallel
    const createdLeads = await Promise.all(
      leads.map(lead =>
        base44.entities.SalesLead.create({
          ...lead,
          assigned_agent_id: user.id,
          assigned_agent_name: user.full_name,
          last_contact_date: new Date().toISOString().split('T')[0]
        })
      )
    );

    // Bulk create Offers in parallel (first 3)
    const offerStatuses = ["accepted", "pending", "counter_offered"];
    const createdOffers = await Promise.all(
      createdListings.slice(0, 3).map((item, i) => {
        const listing = item.listing;
        return base44.entities.Offer.create({
          sales_listing_id: listing.id,
          buyer_contact_id: createdLeads[i]?.id || createdLeads[0]?.id,
          buyer_name: leads[i]?.contact_name || "Anonymous Buyer",
          buyer_email: leads[i]?.contact_email || "buyer@email.com",
          offer_amount: listing.asking_price * (0.95 + Math.random() * 0.1),
          offer_date: new Date().toISOString(),
          status: offerStatuses[i],
          is_chain_free: i % 2 === 0,
          mortgage_status: ["agreed_in_principle", "full_offer", "pending"][i]
        });
      })
    );

    // Bulk create Transactions in parallel
    const createdTransactions = await Promise.all(
      transactions.slice(0, createdOffers.length).map((txn, i) => {
        const listing = createdListings[i]?.listing;
        const offer = createdOffers[i];
        return base44.entities.SalesTransaction.create({
          sales_listing_id: listing.id,
          accepted_offer_id: offer.id,
          buyer_contact_id: offer.buyer_contact_id,
          sale_price: txn.sale_price,
          status: txn.status,
          target_completion_date: txn.target_completion_date,
          chain_position: txn.chain_position,
          assigned_agent_id: user.id,
          assigned_agent_name: user.full_name,
          days_on_market: Math.floor(Math.random() * 90) + 30
        });
      })
    );

    return Response.json({
      success: true,
      properties: createdProperties.length,
      listings: createdListings.length,
      leads: createdLeads.length,
      offers: createdOffers.length,
      transactions: createdTransactions.length
    });

  } catch (error) {
    console.error('Error in generateSalesDemoData:', error);
    const statusCode = error.status || 500;
    return Response.json(
      { error: error.message || 'Failed to generate demo data', ...(statusCode === 429 && { retryAfter: error.retryAfter }) },
      { status: statusCode }
    );
  }
});