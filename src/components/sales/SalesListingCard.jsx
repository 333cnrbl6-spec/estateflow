import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Home, 
  MapPin, 
  Bed, 
  Bath, 
  PoundSterling,
  Calendar,
  Eye,
  FileText,
  ExternalLink
} from "lucide-react";
import { Link } from 'react-router-dom';

const statusColors = {
  draft: "bg-gray-500",
  active: "bg-green-500",
  under_offer: "bg-yellow-500",
  sold_subject_to_contract: "bg-orange-500",
  completed: "bg-blue-500",
  withdrawn: "bg-red-500",
  expired: "bg-red-800",
};

export default function SalesListingCard({ listing }) {
  const formatPrice = (price) => {
    if (!price) return 'POA';
    return price >= 1000000 
      ? `£${(price / 1000000).toFixed(2)}M`
      : price >= 1000 
      ? `£${(price / 1000).toFixed(0)}K`
      : `£${price}`;
  };

  return (
    <Card className="overflow-hidden hover:shadow-xl transition-shadow">
      {/* Image */}
      <div className="relative h-48 bg-gradient-to-br from-blue-50 to-blue-100">
        {listing.images && listing.images.length > 0 ? (
          <img 
            src={listing.images.find(img => img.is_primary)?.file_url || listing.images[0]?.file_url}
            alt={listing.featured_text || 'Property'}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <Home className="w-16 h-16 text-blue-200" />
          </div>
        )}
        <Badge 
          className={`absolute top-3 right-3 ${statusColors[listing.status] || 'bg-gray-500'} text-white border-0`}
        >
          {listing.status.replace(/_/g, ' ').toUpperCase()}
        </Badge>
      </div>

      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl font-bold">
              {formatPrice(listing.asking_price)}
            </CardTitle>
            <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
              <MapPin className="w-3 h-3" />
              {listing.property_id || 'Property ID: ' + listing.property_id}
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Property Details */}
        <div className="flex gap-4 text-sm">
          {listing.bedrooms && (
            <div className="flex items-center gap-1">
              <Bed className="w-4 h-4 text-muted-foreground" />
              <span>{listing.bedrooms} bed</span>
            </div>
          )}
          {listing.bathrooms && (
            <div className="flex items-center gap-1">
              <Bath className="w-4 h-4 text-muted-foreground" />
              <span>{listing.bathrooms} bath</span>
            </div>
          )}
          {listing.property_type && (
            <span className="capitalize text-muted-foreground">
              {listing.property_type.replace('_', ' ')}
            </span>
          )}
        </div>

        {/* Key Features */}
        {listing.features && listing.features.length > 0 && (
          <div className="border-t pt-3">
            <p className="text-xs font-semibold text-muted-foreground mb-2">KEY FEATURES</p>
            <div className="flex flex-wrap gap-1">
              {listing.features.slice(0, 4).map((feature, idx) => (
                <Badge key={idx} variant="outline" className="text-xs">
                  {feature}
                </Badge>
              ))}
              {listing.features.length > 4 && (
                <Badge variant="outline" className="text-xs">
                  +{listing.features.length - 4} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="border-t pt-3 grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center gap-1 text-muted-foreground">
            <Eye className="w-3 h-3" />
            <span>{listing.viewing_count || 0} viewings</span>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <FileText className="w-3 h-3" />
            <span>{listing.offer_count || 0} offers</span>
          </div>
        </div>

        {/* EPC & Council Tax */}
        <div className="flex gap-2">
          {listing.epc_rating && (
            <Badge variant="outline" className="text-xs">
              EPC: {listing.epc_rating}
            </Badge>
          )}
          {listing.council_tax_band && (
            <Badge variant="outline" className="text-xs">
              Council Tax: {listing.council_tax_band}
            </Badge>
          )}
        </div>

        {/* Actions */}
        <div className="border-t pt-3 space-y-2">
          <Link to={`/buyer-portal?listing=${listing.id}`} target="_blank">
            <Button variant="outline" size="sm" className="w-full gap-2">
              <ExternalLink className="w-3 h-3" />
              Buyer Portal Link
            </Button>
          </Link>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="flex-1">
              View Details
            </Button>
            <Button size="sm" className="flex-1">
              Edit
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}