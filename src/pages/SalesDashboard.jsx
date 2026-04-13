import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Plus, 
  TrendingUp, 
  Users, 
  Home, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Phone,
  Mail,
  MapPin,
  Database,
  Download
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import StatCard from "@/components/shared/StatCard";
import SalesLeadFormDialog from "@/components/sales/SalesLeadFormDialog";
import SalesListingCard from "@/components/sales/SalesListingCard";
import LeadCard from "@/components/sales/LeadCard";
import TransactionPipeline from "@/components/sales/TransactionPipeline";
import SalesSearchFilters from "@/components/sales/SalesSearchFilters";
import LeadScoringPanel from "@/components/sales/LeadScoringPanel";

export default function SalesDashboard() {
  const [leadFormOpen, setLeadFormOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({});
  const [loadingDemo, setLoadingDemo] = useState(false);

  // Fetch leads
  const { data: leads = [], isLoading: leadsLoading } = useQuery({
    queryKey: ['sales-leads'],
    queryFn: () => base44.entities.SalesLead.list('-created_date', 50),
  });

  // Fetch listings
  const { data: listings = [], isLoading: listingsLoading } = useQuery({
    queryKey: ['sales-listings'],
    queryFn: () => base44.entities.SalesListing.list('-listed_date', 50),
  });

  // Fetch transactions
  const { data: transactions = [], isLoading: transactionsLoading } = useQuery({
    queryKey: ['sales-transactions'],
    queryFn: () => base44.entities.SalesTransaction.list('-created_date', 50),
  });

  // Calculate stats
  const stats = {
    totalLeads: leads.length,
    newLeads: leads.filter(l => l.status === 'new').length,
    activeListings: listings.filter(l => l.status === 'active').length,
    underOffer: listings.filter(l => l.status === 'under_offer' || l.status === 'sold_subject_to_contract').length,
    completedSales: transactions.filter(t => t.status === 'completed').length,
    pendingTransactions: transactions.filter(t => !['completed', 'fallen_through'].includes(t.status)).length,
  };

  // Lead scoring stats
  const hotLeads = leads.filter(l => l.priority_tier === 'hot' || (l.lead_score && l.lead_score >= 75));
  const warmLeads = leads.filter(l => l.priority_tier === 'warm' || (l.lead_score && l.lead_score >= 50 && l.lead_score < 75));
  const coldLeads = leads.filter(l => l.priority_tier === 'cold' || (l.lead_score && l.lead_score < 50));
  const avgScore = leads.length > 0 ? Math.round(leads.reduce((sum, l) => sum + (l.lead_score || 0), 0) / leads.length) : 0;

  const totalValue = listings
    .filter(l => ['active', 'under_offer', 'sold_subject_to_contract'].includes(l.status))
    .reduce((sum, l) => sum + (l.asking_price || 0), 0);

  // Filter listings based on search and filters
  const filteredListings = listings.filter(listing => {
    // Search query filter (postcode, property type, price)
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const propertyId = listing.property_id?.toLowerCase() || "";
      const propertyType = listing.property_type?.toLowerCase() || "";
      const price = listing.asking_price?.toString() || "";
      
      const matchesSearch = 
        propertyId.includes(query) ||
        propertyType.includes(query) ||
        price.includes(query.replace(/[^0-9]/g, ''));
      
      if (!matchesSearch) return false;
    }

    // Status filter
    if (filters.status && listing.status !== filters.status) {
      return false;
    }

    // Property type filter
    if (filters.propertyType && listing.property_type !== filters.propertyType) {
      return false;
    }

    // Bedrooms filter
    if (filters.bedrooms && (listing.bedrooms || 0) < parseInt(filters.bedrooms)) {
      return false;
    }

    // Bathrooms filter
    if (filters.bathrooms && (listing.bathrooms || 0) < parseInt(filters.bathrooms)) {
      return false;
    }

    // Price range filter
    if (filters.priceRange) {
      const price = listing.asking_price || 0;
      if (filters.priceRange === "2000000+") {
        if (price < 2000000) return false;
      } else {
        const [min, max] = filters.priceRange.split("-").map(Number);
        if (price < min || price > max) return false;
      }
    }

    return true;
  });

  const clearFilters = () => {
    setSearchQuery("");
    setFilters({});
  };

  const loadDemoData = async () => {
    try {
      setLoadingDemo(true);
      const response = await base44.functions.invoke('generateSalesDemoData', {});
      if (response.data.success) {
        toast.success(`Demo data loaded: ${response.data.properties} properties, ${response.data.listings} listings, ${response.data.leads} leads`);
        queryClient.invalidateQueries({ queryKey: ['sales-leads'] });
        queryClient.invalidateQueries({ queryKey: ['sales-listings'] });
        queryClient.invalidateQueries({ queryKey: ['sales-transactions'] });
      }
    } catch (error) {
      toast.error(`Failed to load demo data: ${error.message}`);
    } finally {
      setLoadingDemo(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">Residential Sales</h1>
          <p className="text-muted-foreground">Manage leads, listings, and sales progression</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadDemoData} disabled={loadingDemo}>
            <Database className="w-4 h-4 mr-2" />
            {loadingDemo ? "Loading..." : "Load Demo Data"}
          </Button>
          <Button variant="outline" onClick={() => setActiveTab("leads")}>
            <Phone className="w-4 h-4 mr-2" />
            New Lead
          </Button>
          <Button onClick={() => setLeadFormOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Listing
          </Button>
        </div>
      </div>

      {/* Lead Scoring Panel */}
      <div className="mb-6">
        <LeadScoringPanel />
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Leads"
          value={stats.totalLeads}
          icon={Users}
          trend={stats.newLeads > 0 ? `+${stats.newLeads} new` : undefined}
        />
        <StatCard
          title="Hot Leads"
          value={hotLeads.length}
          icon={TrendingUp}
          trend="Priority outreach"
          colorIndex={2}
        />
        <StatCard
          title="Active Listings"
          value={stats.activeListings}
          icon={Home}
          trend={stats.underOffer > 0 ? `${stats.underOffer} under offer` : undefined}
        />
        <StatCard
          title="Avg Lead Score"
          value={avgScore}
          icon={BarChart3}
          trend="/100"
          colorIndex={1}
        />
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="leads">Leads ({leads.length})</TabsTrigger>
          <TabsTrigger value="listings">Listings ({listings.length})</TabsTrigger>
          <TabsTrigger value="pipeline">Pipeline ({transactions.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Recent Leads */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Recent Leads
                </CardTitle>
              </CardHeader>
              <CardContent>
                {leadsLoading ? (
                  <p className="text-muted-foreground">Loading...</p>
                ) : leads.length === 0 ? (
                  <p className="text-muted-foreground text-sm">No leads yet</p>
                ) : (
                  <div className="space-y-2">
                    {leads.slice(0, 5).map((lead) => (
                      <div key={lead.id} className="flex items-center justify-between p-2 border rounded-md">
                        <div>
                          <p className="font-medium">{lead.contact_name}</p>
                          <p className="text-sm text-muted-foreground">{lead.lead_type} • {lead.location_preference}</p>
                        </div>
                        <Badge variant={lead.status === 'new' ? 'default' : 'secondary'}>
                          {lead.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Active Listings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Home className="w-5 h-5" />
                  Active Listings
                </CardTitle>
              </CardHeader>
              <CardContent>
                {listingsLoading ? (
                  <p className="text-muted-foreground">Loading...</p>
                ) : listings.length === 0 ? (
                  <p className="text-muted-foreground text-sm">No listings yet</p>
                ) : (
                  <div className="space-y-2">
                    {listings.filter(l => l.status === 'active').slice(0, 5).map((listing) => (
                      <div key={listing.id} className="flex items-center justify-between p-2 border rounded-md">
                        <div>
                          <p className="font-medium">£{listing.asking_price?.toLocaleString()}</p>
                          <p className="text-sm text-muted-foreground">{listing.bedrooms} bed {listing.property_type}</p>
                        </div>
                        <Badge>Active</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sales Pipeline Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Sales Pipeline Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              {transactionsLoading ? (
                <p className="text-muted-foreground">Loading...</p>
              ) : transactions.length === 0 ? (
                <p className="text-muted-foreground text-sm">No active transactions</p>
              ) : (
                <div className="grid gap-3 md:grid-cols-3">
                  <div className="p-3 border rounded-lg">
                    <p className="text-sm text-muted-foreground">In Progress</p>
                    <p className="text-2xl font-bold">{transactions.filter(t => !['completed', 'fallen_through'].includes(t.status)).length}</p>
                  </div>
                  <div className="p-3 border rounded-lg bg-green-50">
                    <p className="text-sm text-muted-foreground">Completed</p>
                    <p className="text-2xl font-bold text-green-700">{stats.completedSales}</p>
                  </div>
                  <div className="p-3 border rounded-lg bg-red-50">
                    <p className="text-sm text-muted-foreground">Fallen Through</p>
                    <p className="text-2xl font-bold text-red-700">{transactions.filter(t => t.status === 'fallen_through').length}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="leads">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {leadsLoading ? (
              <p className="text-muted-foreground">Loading...</p>
            ) : leads.length === 0 ? (
              <Card className="col-span-full">
                <CardContent className="py-12 text-center text-muted-foreground">
                  No leads yet. Click "New Lead" to add one.
                </CardContent>
              </Card>
            ) : (
              leads.map((lead) => (
                <LeadCard key={lead.id} lead={lead} />
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="listings">
          <SalesSearchFilters 
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            filters={filters}
            onFilterChange={setFilters}
            onClearFilters={clearFilters}
          />
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {listingsLoading ? (
              <p className="text-muted-foreground">Loading...</p>
            ) : filteredListings.length === 0 ? (
              <Card className="col-span-full">
                <CardContent className="py-12 text-center text-muted-foreground">
                  {listings.length === 0 
                    ? 'No listings yet. Click "Add Listing" to create one.' 
                    : 'No listings match your search criteria.'}
                </CardContent>
              </Card>
            ) : (
              filteredListings.map((listing) => (
                <SalesListingCard key={listing.id} listing={listing} />
              ))
            )}
          </div>
          {filteredListings.length > 0 && (
            <p className="text-sm text-muted-foreground text-center mt-4">
              Showing {filteredListings.length} of {listings.length} listings
            </p>
          )}
        </TabsContent>

        <TabsContent value="pipeline">
          <TransactionPipeline transactions={transactions} isLoading={transactionsLoading} />
        </TabsContent>
      </Tabs>

      <SalesLeadFormDialog 
        open={leadFormOpen} 
        onOpenChange={setLeadFormOpen}
      />
    </div>
  );
}