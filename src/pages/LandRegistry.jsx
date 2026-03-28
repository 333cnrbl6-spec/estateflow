import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Building2, PoundSterling, MapPin, Calendar, AlertCircle, ExternalLink, Loader2 } from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";

const POWELL_SEARCHES = [
  "POWELL",
  "BRIGHTON PROPERTY TRADING",
  "4 QUARRY TERRACE",
  "POWELLANDCO",
  "POWELL & CO",
  "WILLICOMBE",
];

const formatCurrency = (val) => val ? `£${parseInt(val).toLocaleString()}` : "—";
const formatDate = (val) => val ? val.split("T")[0] : "—";

export default function LandRegistry() {
  const [postcodeInput, setPostcodeInput] = useState("");
  const [ccodInput, setCcodInput] = useState("");
  const [pricePaidResults, setPricePaidResults] = useState(null);
  const [ccodResults, setCcodResults] = useState(null);
  const [loadingPP, setLoadingPP] = useState(false);
  const [loadingCCOD, setLoadingCCOD] = useState(false);
  const [errorPP, setErrorPP] = useState(null);
  const [errorCCOD, setErrorCCOD] = useState(null);

  const searchPricePaid = async () => {
    if (!postcodeInput.trim()) return;
    setLoadingPP(true);
    setErrorPP(null);
    setPricePaidResults(null);
    try {
      const res = await base44.functions.invoke("landRegistrySearch", { mode: "price_paid", postcode: postcodeInput.trim() });
      setPricePaidResults(res.data.results || []);
    } catch (e) {
      setErrorPP(e.message);
    }
    setLoadingPP(false);
  };

  const searchCCOD = async (term) => {
    const t = (term || ccodInput).trim();
    if (!t) return;
    setCcodInput(t);
    setLoadingCCOD(true);
    setErrorCCOD(null);
    setCcodResults(null);
    try {
      const res = await base44.functions.invoke("landRegistrySearch", { mode: "ccod", searchTerm: t });
      if (res.data.error) {
        setErrorCCOD(res.data.error);
      } else {
        setCcodResults(res.data.matches || []);
      }
    } catch (e) {
      setErrorCCOD(e.message);
    }
    setLoadingCCOD(false);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <PageHeader
        title="Land Registry Research"
        subtitle="Search HMLR open data — price paid history & company property ownership"
      />

      <Tabs defaultValue="ccod">
        <TabsList className="mb-6">
          <TabsTrigger value="ccod">Company Ownership (CCOD)</TabsTrigger>
          <TabsTrigger value="pricepaid">Price Paid by Postcode</TabsTrigger>
        </TabsList>

        {/* CCOD TAB */}
        <TabsContent value="ccod">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                UK Companies Owning Property — HMLR CCOD Dataset
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Search all land and property in England & Wales registered to a UK company.
                Requires a free HMLR API key — register at{" "}
                <a href="https://use-land-property-data.service.gov.uk/registration" target="_blank" className="text-primary underline">
                  use-land-property-data.service.gov.uk
                </a>
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="e.g. POWELL, WILLICOMBE, BRIGHTON PROPERTY TRADING..."
                  value={ccodInput}
                  onChange={e => setCcodInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && searchCCOD()}
                  className="max-w-lg"
                />
                <Button onClick={() => searchCCOD()} disabled={loadingCCOD}>
                  {loadingCCOD ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                  Search
                </Button>
              </div>

              <div>
                <p className="text-xs text-muted-foreground mb-2">Quick search Powell & Co entities:</p>
                <div className="flex flex-wrap gap-2">
                  {POWELL_SEARCHES.map(s => (
                    <Button key={s} variant="outline" size="sm" onClick={() => searchCCOD(s)}>
                      {s}
                    </Button>
                  ))}
                </div>
              </div>

              {errorCCOD && (
                <div className="flex items-start gap-2 p-3 bg-destructive/10 rounded-md text-destructive text-sm">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  <div>
                    <strong>Error: </strong>{errorCCOD}
                    {errorCCOD.includes("API_KEY") && (
                      <div className="mt-1">
                        <a href="https://use-land-property-data.service.gov.uk/registration" target="_blank" className="underline">
                          Register for a free API key →
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {ccodResults && (
                <div>
                  <p className="text-sm font-medium mb-3">
                    Found <strong>{ccodResults.length}</strong> registered titles for "<strong>{ccodInput}</strong>"
                  </p>
                  {ccodResults.length === 0 ? (
                    <p className="text-muted-foreground text-sm">No titles found.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b text-muted-foreground text-xs">
                            <th className="text-left py-2 pr-4">Title No.</th>
                            <th className="text-left py-2 pr-4">Tenure</th>
                            <th className="text-left py-2 pr-4">Property Address</th>
                            <th className="text-left py-2 pr-4">District / County</th>
                            <th className="text-left py-2 pr-4">Postcode</th>
                            <th className="text-left py-2 pr-4">Proprietor</th>
                            <th className="text-left py-2 pr-4">Co. Reg No.</th>
                            <th className="text-left py-2 pr-4">Price Paid</th>
                            <th className="text-left py-2">Date Added</th>
                          </tr>
                        </thead>
                        <tbody>
                          {ccodResults.map((r, i) => (
                            <tr key={i} className="border-b hover:bg-muted/40">
                              <td className="py-2 pr-4 font-mono text-xs">
                                <a
                                  href={`https://www.gov.uk/search-property-information-land-registry?term=${r.titleNumber}`}
                                  target="_blank"
                                  className="text-primary hover:underline flex items-center gap-1"
                                >
                                  {r.titleNumber}
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              </td>
                              <td className="py-2 pr-4">
                                <Badge variant={r.tenure === "Freehold" ? "default" : "outline"} className="text-xs">
                                  {r.tenure}
                                </Badge>
                              </td>
                              <td className="py-2 pr-4 max-w-[200px] text-xs">{r.propertyAddress}</td>
                              <td className="py-2 pr-4 text-xs text-muted-foreground">{r.district}{r.county ? `, ${r.county}` : ""}</td>
                              <td className="py-2 pr-4 font-mono text-xs">{r.postcode}</td>
                              <td className="py-2 pr-4 text-xs font-medium">{r.proprietorName}</td>
                              <td className="py-2 pr-4 font-mono text-xs">
                                {r.companyRegNo ? (
                                  <a href={`https://find-and-update.company-information.service.gov.uk/company/${r.companyRegNo}`} target="_blank" className="text-primary hover:underline">
                                    {r.companyRegNo}
                                  </a>
                                ) : "—"}
                              </td>
                              <td className="py-2 pr-4 text-xs">{r.pricePaid ? formatCurrency(r.pricePaid) : "—"}</td>
                              <td className="py-2 text-xs text-muted-foreground">{r.dateAdded || "—"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* PRICE PAID TAB */}
        <TabsContent value="pricepaid">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <PoundSterling className="w-4 h-4" />
                Price Paid History by Postcode
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Free SPARQL query of HMLR Price Paid Data — no API key required. Shows all registered sales at a postcode since 1995.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="e.g. BL4 7EF, BN1 3AR, NW1 7SS..."
                  value={postcodeInput}
                  onChange={e => setPostcodeInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && searchPricePaid()}
                  className="max-w-xs"
                />
                <Button onClick={searchPricePaid} disabled={loadingPP}>
                  {loadingPP ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                  Search
                </Button>
              </div>

              <div>
                <p className="text-xs text-muted-foreground mb-2">Portfolio postcodes:</p>
                <div className="flex flex-wrap gap-2">
                  {["BL4 7EF", "BN1 3AR", "BN2 9YB", "BN1 3BJ", "NW1 7SS", "LA4 5PD", "BB8 9AB", "LL29 7DP", "LL30 2EB"].map(pc => (
                    <Button key={pc} variant="outline" size="sm" onClick={() => { setPostcodeInput(pc); }}>
                      {pc}
                    </Button>
                  ))}
                </div>
              </div>

              {errorPP && (
                <div className="flex items-center gap-2 p-3 bg-destructive/10 rounded-md text-destructive text-sm">
                  <AlertCircle className="w-4 h-4" />
                  {errorPP}
                </div>
              )}

              {pricePaidResults && (
                <div>
                  <p className="text-sm font-medium mb-3">
                    <strong>{pricePaidResults.length}</strong> registered sales at <strong>{postcodeInput.toUpperCase()}</strong>
                  </p>
                  {pricePaidResults.length === 0 ? (
                    <p className="text-muted-foreground text-sm">No sales found for this postcode.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b text-muted-foreground text-xs">
                            <th className="text-left py-2 pr-4">Address</th>
                            <th className="text-left py-2 pr-4">Price Paid</th>
                            <th className="text-left py-2 pr-4">Date</th>
                            <th className="text-left py-2">Property Type</th>
                          </tr>
                        </thead>
                        <tbody>
                          {pricePaidResults.map((r, i) => (
                            <tr key={i} className="border-b hover:bg-muted/40">
                              <td className="py-2 pr-4 flex items-center gap-1 text-xs">
                                <MapPin className="w-3 h-3 text-muted-foreground shrink-0" />
                                {r.address || "—"}
                              </td>
                              <td className="py-2 pr-4 font-semibold text-primary">
                                {r.amount ? formatCurrency(r.amount) : "—"}
                              </td>
                              <td className="py-2 pr-4 text-xs text-muted-foreground flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {formatDate(r.date)}
                              </td>
                              <td className="py-2 text-xs">
                                <Badge variant="outline">{r.propertyType || "—"}</Badge>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}