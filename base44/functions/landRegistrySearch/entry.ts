import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const SPARQL_ENDPOINT = "https://landregistry.data.gov.uk/landregistry/query";

// Search Price Paid Data by postcode via free SPARQL endpoint
async function queryPricePaid(postcode) {
  const cleanPostcode = postcode.trim().toUpperCase();
  const sparql = `
    prefix lrppi: <http://landregistry.data.gov.uk/def/ppi/>
    prefix lrcommon: <http://landregistry.data.gov.uk/def/common/>

    SELECT ?address ?amount ?date ?tenure ?propertyType WHERE {
      ?transaction lrppi:pricePaid ?amount ;
                   lrppi:transactionDate ?date ;
                   lrppi:propertyAddress ?addr .
      ?addr lrcommon:postcode "${cleanPostcode}" ;
            lrcommon:paon ?paon .
      OPTIONAL { ?addr lrcommon:saon ?saon }
      OPTIONAL { ?addr lrcommon:street ?street }
      OPTIONAL { ?addr lrcommon:town ?town }
      BIND(CONCAT(IF(BOUND(?saon), CONCAT(STR(?saon), ", "), ""), STR(?paon), IF(BOUND(?street), CONCAT(" ", STR(?street)), ""), IF(BOUND(?town), CONCAT(", ", STR(?town)), "")) AS ?address)
      OPTIONAL { ?transaction lrppi:recordStatus ?tenure }
      OPTIONAL { ?transaction lrppi:propertyType ?propertyType }
    }
    ORDER BY DESC(?date)
    LIMIT 50
  `;

  const url = `${SPARQL_ENDPOINT}?query=${encodeURIComponent(sparql)}&output=json`;
  const res = await fetch(url, { headers: { Accept: "application/sparql-results+json" } });
  if (!res.ok) throw new Error(`SPARQL error: ${res.status}`);
  const data = await res.json();
  return data.results.bindings.map(b => ({
    address: b.address?.value || "",
    amount: b.amount?.value ? parseInt(b.amount.value) : null,
    date: b.date?.value || "",
    tenure: b.tenure?.value?.split("/").pop() || "",
    propertyType: b.propertyType?.value?.split("/").pop() || "",
  }));
}

// Search CCOD dataset (UK companies owning property) by company name
async function queryCCOD(searchTerm) {
  const apiKey = Deno.env.get("HMLR_CCOD_API_KEY");
  if (!apiKey) {
    return { error: "HMLR_CCOD_API_KEY not set. Register free at https://use-land-property-data.service.gov.uk/registration" };
  }

  // Download the latest CCOD file link via API
  const listRes = await fetch("https://use-land-property-data.service.gov.uk/api/v1/datasets/ccod", {
    headers: { Authorization: apiKey }
  });
  if (!listRes.ok) throw new Error(`CCOD API error: ${listRes.status}`);
  const listData = await listRes.json();

  // Get the latest full file download URL
  const resources = listData.result?.resources || [];
  const latestFull = resources.find(r => r.name?.toLowerCase().includes("complete") || r.file?.toLowerCase().includes("complete"));
  if (!latestFull) return { error: "Could not find CCOD complete file", resources };

  const downloadRes = await fetch(latestFull.url || latestFull.file, {
    headers: { Authorization: apiKey }
  });
  if (!downloadRes.ok) throw new Error(`CCOD download error: ${downloadRes.status}`);

  // Stream and search the CSV for matching proprietor names
  const text = await downloadRes.text();
  const lines = text.split("\n");
  const header = lines[0].split(",").map(h => h.replace(/"/g, "").trim());

  const term = searchTerm.toLowerCase();
  const matches = [];

  for (let i = 1; i < lines.length && matches.length < 200; i++) {
    const line = lines[i];
    if (!line) continue;
    // Simple check before full parse
    if (!line.toLowerCase().includes(term)) continue;

    const cols = line.match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g) || [];
    const row = {};
    header.forEach((h, idx) => {
      row[h] = (cols[idx] || "").replace(/^"|"$/g, "").trim();
    });
    if (row["Proprietor Name (1)"]?.toLowerCase().includes(term) ||
        row["Proprietor Name (2)"]?.toLowerCase().includes(term) ||
        row["Proprietor Name (3)"]?.toLowerCase().includes(term) ||
        row["Proprietor Name (4)"]?.toLowerCase().includes(term)) {
      matches.push({
        titleNumber: row["Title Number"],
        tenure: row["Tenure"],
        propertyAddress: row["Property Address"],
        district: row["District"],
        county: row["County"],
        region: row["Region"],
        postcode: row["Postcode"],
        pricePaid: row["Price Paid"],
        proprietorName: row["Proprietor Name (1)"],
        companyRegNo: row["Company Registration No. (1)"],
        proprietorAddress: row["Proprietor Address (1)"],
        dateAdded: row["Date Proprietor Added"],
        additionalProprietor: row["Additional Proprietor Indicator"],
      });
    }
  }

  return { matches, total: matches.length };
}

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { mode, postcode, searchTerm } = body;

  if (mode === "price_paid") {
    if (!postcode) return Response.json({ error: "postcode required" }, { status: 400 });
    const results = await queryPricePaid(postcode);
    return Response.json({ results });
  }

  if (mode === "ccod") {
    if (!searchTerm) return Response.json({ error: "searchTerm required" }, { status: 400 });
    const result = await queryCCOD(searchTerm);
    return Response.json(result);
  }

  return Response.json({ error: "mode must be price_paid or ccod" }, { status: 400 });
});