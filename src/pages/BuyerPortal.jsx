import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Home, 
  Mail, 
  Phone, 
  PoundSterling, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  FileText,
  Download,
  Eye,
  Send,
  Key,
  ArrowLeft
} from 'lucide-react';
import { toast } from 'sonner';
import { Link, useSearchParams } from 'react-router-dom';

export default function BuyerPortal() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [showOfferForm, setShowOfferForm] = useState(false);
  const [selectedListing, setSelectedListing] = useState(null);

  // If no token, show listings for offer submission
  const { data: listings = [] } = useQuery({
    queryKey: ['active-listings'],
    queryFn: async () => {
      return await base44.entities.SalesListing.filter({ status: 'active' });
    },
    enabled: !token
  });

  // If token provided, fetch offer details
  const { data: offer, isLoading: offerLoading } = useQuery({
    queryKey: ['buyer-offer', token],
    queryFn: async () => {
      const offers = await base44.entities.BuyerPortalOffer.filter({ access_token: token });
      return offers[0] || null;
    },
    enabled: !!token
  });

  // Fetch listing details if offer exists
  const { data: listing } = useQuery({
    queryKey: ['listing', offer?.sales_listing_id],
    queryFn: async () => {
      if (!offer?.sales_listing_id) return null;
      return await base44.entities.SalesListing.get(offer.sales_listing_id);
    },
    enabled: !!offer?.sales_listing_id
  });

  // Submit offer mutation
  const queryClient = useQueryClient();
  const submitOfferMutation = useMutation({
    mutationFn: async (offerData) => {
      return await base44.functions.invoke('createBuyerOffer', offerData);
    },
    onSuccess: (data) => {
      if (data.success) {
        toast.success('Offer submitted successfully! Check your email for portal access.');
        setShowOfferForm(false);
        setSelectedListing(null);
      } else {
        toast.error(data.error || 'Failed to submit offer');
      }
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    }
  });

  const handleOfferSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    submitOfferMutation.mutate({
      sales_listing_id: selectedListing.id,
      buyer_name: formData.get('buyer_name'),
      buyer_email: formData.get('buyer_email'),
      buyer_phone: formData.get('buyer_phone'),
      offer_amount: parseFloat(formData.get('offer_amount')),
      mortgage_status: formData.get('mortgage_status'),
      is_chain_free: formData.get('is_chain_free') === 'on',
      solicitor_name: formData.get('solicitor_name'),
      solicitor_contact: formData.get('solicitor_contact'),
      target_completion_date: formData.get('target_completion_date'),
      conditions: []
    });
  };

  const getStatusBadge = (status) => {
    const styles = {
      submitted: 'bg-blue-100 text-blue-800 border-blue-300',
      under_review: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      accepted: 'bg-green-100 text-green-800 border-green-300',
      rejected: 'bg-red-100 text-red-800 border-red-300',
      counter_offered: 'bg-purple-100 text-purple-800 border-purple-300',
      withdrawn: 'bg-gray-100 text-gray-800 border-gray-300'
    };
    
    const icons = {
      submitted: Clock,
      under_review: Eye,
      accepted: CheckCircle2,
      rejected: AlertCircle,
      counter_offered: PoundSterling,
      withdrawn: Key
    };

    const Icon = icons[status] || Clock;
    
    return (
      <Badge className={`${styles[status]} border flex items-center gap-1.5`}>
        <Icon className="w-3 h-3" />
        {status.replace('_', ' ').toUpperCase()}
      </Badge>
    );
  };

  // No token - show listings
  if (!token) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm mb-4">
              <Home className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-semibold text-blue-900">Premiso Buyer Portal</span>
            </div>
            <h1 className="text-4xl font-bold text-slate-900 mb-2">Find Your Dream Home</h1>
            <p className="text-lg text-slate-600">Browse properties and submit offers directly online</p>
          </div>

          {/* Listings Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {listings.map((listing) => (
              <Card key={listing.id} className="hover:shadow-lg transition-shadow cursor-pointer overflow-hidden">
                <div 
                  className="h-48 bg-gradient-to-br from-blue-100 to-indigo-200 flex items-center justify-center"
                  onClick={() => {
                    setSelectedListing(listing);
                    setShowOfferForm(true);
                  }}
                >
                  <Home className="w-20 h-20 text-blue-300" />
                </div>
                <CardHeader>
                  <CardTitle className="text-xl">£{listing.asking_price?.toLocaleString()}</CardTitle>
                  <CardDescription className="flex items-center gap-4 text-sm">
                    <span>{listing.bedrooms} bed</span>
                    <span>•</span>
                    <span>{listing.bathrooms} bath</span>
                    <span>•</span>
                    <span className="capitalize">{listing.property_type}</span>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-600 mb-4 line-clamp-2">
                    {listing.marketing_text || 'No description available'}
                  </p>
                  <Button 
                    className="w-full gap-2"
                    onClick={() => {
                      setSelectedListing(listing);
                      setShowOfferForm(true);
                    }}
                  >
                    <Send className="w-4 h-4" />
                    Submit Offer
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {listings.length === 0 && (
            <Card className="p-12 text-center">
              <Home className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">No Properties Available</h3>
              <p className="text-slate-600">Check back later for new listings</p>
            </Card>
          )}
        </div>

        {/* Offer Form Dialog */}
        {showOfferForm && selectedListing && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Submit Offer</CardTitle>
                    <CardDescription>
                      £{selectedListing.asking_price?.toLocaleString()} - {selectedListing.bedrooms} bed {selectedListing.property_type}
                    </CardDescription>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setShowOfferForm(false)}>
                    <ArrowLeft className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleOfferSubmit} className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label htmlFor="buyer_name">Full Name *</Label>
                      <Input id="buyer_name" name="buyer_name" required />
                    </div>
                    <div>
                      <Label htmlFor="buyer_email">Email *</Label>
                      <Input id="buyer_email" name="buyer_email" type="email" required />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="buyer_phone">Phone Number</Label>
                    <Input id="buyer_phone" name="buyer_phone" type="tel" />
                  </div>

                  <div>
                    <Label htmlFor="offer_amount">Offer Amount (£) *</Label>
                    <Input 
                      id="offer_amount" 
                      name="offer_amount" 
                      type="number" 
                      required 
                      defaultValue={selectedListing.asking_price}
                    />
                  </div>

                  <div>
                    <Label htmlFor="mortgage_status">Mortgage Status</Label>
                    <select 
                      id="mortgage_status" 
                      name="mortgage_status"
                      className="w-full rounded-md border border-input bg-background px-3 py-2"
                    >
                      <option value="unknown">Not specified</option>
                      <option value="not_required">Cash buyer (no mortgage needed)</option>
                      <option value="agreed_in_principle">Agreement in principle</option>
                      <option value="full_offer">Full mortgage offer</option>
                      <option value="pending">Application pending</option>
                    </select>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox id="is_chain_free" name="is_chain_free" />
                    <Label htmlFor="is_chain_free">I am a chain-free buyer</Label>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label htmlFor="solicitor_name">Solicitor Name</Label>
                      <Input id="solicitor_name" name="solicitor_name" />
                    </div>
                    <div>
                      <Label htmlFor="solicitor_contact">Solicitor Contact</Label>
                      <Input id="solicitor_contact" name="solicitor_contact" />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="target_completion_date">Target Completion Date</Label>
                    <Input 
                      id="target_completion_date" 
                      name="target_completion_date" 
                      type="date" 
                    />
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-800">
                      <strong>What happens next?</strong>
                    </p>
                    <ul className="text-sm text-blue-700 mt-2 space-y-1 list-disc list-inside">
                      <li>You'll receive a confirmation email immediately</li>
                      <li>Your personal portal link will be sent to your email</li>
                      <li>Track your offer status in real-time</li>
                      <li>Get notified when the agent reviews your offer</li>
                    </ul>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => setShowOfferForm(false)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      className="flex-1 gap-2"
                      disabled={submitOfferMutation.isPending}
                    >
                      {submitOfferMutation.isPending ? (
                        <>Submitting...</>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          Submit Offer
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    );
  }

  // Token provided - show offer tracking
  if (offerLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading your offer details...</p>
        </div>
      </div>
    );
  }

  if (!offer) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-6">
        <Card className="max-w-md w-full p-8 text-center">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Invalid Access Token</h2>
          <p className="text-slate-600 mb-6">
            The link you're using is invalid or has expired. Please check your email for the correct portal link.
          </p>
          <Link to="/buyer-portal">
            <Button>Browse Properties</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm mb-4">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            <span className="text-sm font-semibold text-blue-900">Buyer Portal</span>
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Track Your Offer</h1>
          <p className="text-lg text-slate-600">Real-time updates on your property offer</p>
        </div>

        {/* Offer Status Card */}
        <Card className="mb-6 border-2 border-blue-200">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl mb-2">Offer Status</CardTitle>
                <p className="text-slate-600">
                  Property: {listing?.property_id || 'Loading...'}
                </p>
              </div>
              {getStatusBadge(offer.status)}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                <p className="text-sm text-blue-600 mb-1">Offer Amount</p>
                <p className="text-2xl font-bold text-blue-900">£{offer.offer_amount?.toLocaleString()}</p>
              </div>
              <div className="bg-green-50 rounded-lg p-4 border border-green-100">
                <p className="text-sm text-green-600 mb-1">Submitted</p>
                <p className="text-lg font-semibold text-green-900">
                  {new Date(offer.offer_date).toLocaleDateString()}
                </p>
              </div>
              <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
                <p className="text-sm text-purple-600 mb-1">Buyer</p>
                <p className="text-lg font-semibold text-purple-900">{offer.buyer_name}</p>
              </div>
            </div>

            {/* Timeline */}
            <div className="mt-6">
              <h3 className="text-sm font-semibold text-slate-700 mb-4">Offer Timeline</h3>
              <div className="relative">
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-200"></div>
                <div className="space-y-4">
                  <div className="relative pl-10">
                    <div className="absolute left-2 w-4 h-4 rounded-full bg-blue-600 border-2 border-white"></div>
                    <p className="text-sm font-medium text-slate-900">Offer Submitted</p>
                    <p className="text-xs text-slate-600">{new Date(offer.offer_date).toLocaleString()}</p>
                  </div>
                  {offer.status !== 'submitted' && (
                    <div className="relative pl-10">
                      <div className={`absolute left-2 w-4 h-4 rounded-full border-2 border-white ${
                        offer.status === 'under_review' ? 'bg-yellow-500 animate-pulse' : 'bg-green-600'
                      }`}></div>
                      <p className="text-sm font-medium text-slate-900">
                        {offer.status === 'under_review' ? 'Under Review' : 'Status Updated'}
                      </p>
                      <p className="text-xs text-slate-600">{offer.status.replace('_', ' ')}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Buyer Details */}
            <div className="mt-6 pt-6 border-t border-slate-200">
              <h3 className="text-sm font-semibold text-slate-700 mb-3">Your Details</h3>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="w-4 h-4 text-slate-400" />
                  <span>{offer.buyer_email}</span>
                </div>
                {offer.buyer_phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="w-4 h-4 text-slate-400" />
                    <span>{offer.buyer_phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className={`w-4 h-4 ${offer.is_chain_free ? 'text-green-600' : 'text-slate-400'}`} />
                  <span>Chain-free: {offer.is_chain_free ? 'Yes' : 'No'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <PoundSterling className="w-4 h-4 text-slate-400" />
                  <span>Mortgage: {offer.mortgage_status?.replace('_', ' ') || 'Not specified'}</span>
                </div>
              </div>
            </div>

            {/* Documents Section */}
            {listing && (
              <div className="mt-6 pt-6 border-t border-slate-200">
                <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Property Documents
                </h3>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <Download className="w-4 h-4" />
                    Home Report (PDF)
                  </Button>
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <Download className="w-4 h-4" />
                    Floor Plan
                  </Button>
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <Eye className="w-4 h-4" />
                    View Property Details
                  </Button>
                </div>
              </div>
            )}

            {/* Contact Agent */}
            <div className="mt-6 pt-6 border-t border-slate-200">
              <h3 className="text-sm font-semibold text-slate-700 mb-3">Need Help?</h3>
              <p className="text-sm text-slate-600 mb-3">
                Contact the listing agent for any questions about your offer or the property.
              </p>
              <div className="flex gap-3">
                <Button variant="outline" className="gap-2">
                  <Mail className="w-4 h-4" />
                  Email Agent
                </Button>
                <Button variant="outline" className="gap-2">
                  <Phone className="w-4 h-4" />
                  Call Agent
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* What Happens Next */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">What Happens Next?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold flex-shrink-0">1</div>
                <div>
                  <p className="font-medium text-slate-900">Agent Review</p>
                  <p className="text-slate-600">The agent will review your offer and present it to the seller</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold flex-shrink-0">2</div>
                <div>
                  <p className="font-medium text-slate-900">Decision</p>
                  <p className="text-slate-600">You'll be notified immediately when a decision is made</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold flex-shrink-0">3</div>
                <div>
                  <p className="font-medium text-slate-900">Next Steps</p>
                  <p className="text-slate-600">If accepted, you'll proceed to solicitor instruction and surveys</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}