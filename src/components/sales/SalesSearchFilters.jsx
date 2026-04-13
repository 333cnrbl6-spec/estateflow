import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Search, 
  Filter, 
  X, 
  Home, 
  Bed, 
  Bath, 
  PoundSterling,
  MapPin
} from "lucide-react";

export default function SalesSearchFilters({ 
  searchQuery, 
  onSearchChange,
  filters,
  onFilterChange,
  onClearFilters
}) {
  return (
    <Card className="mb-6">
      <CardContent className="p-4 space-y-4">
        {/* Search Bar */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by postcode, property type, or price..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline" onClick={onClearFilters}>
            <X className="w-4 h-4 mr-2" />
            Clear
          </Button>
        </div>

        {/* Filter Row */}
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">Filters:</span>
          </div>

          {/* Status Filter */}
          <Select 
            value={filters.status || "all"} 
            onValueChange={(value) => onFilterChange({ ...filters, status: value === "all" ? undefined : value })}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="under_offer">Under Offer</SelectItem>
              <SelectItem value="sold_subject_to_contract">STC</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="withdrawn">Withdrawn</SelectItem>
            </SelectContent>
          </Select>

          {/* Property Type Filter */}
          <Select 
            value={filters.propertyType || "all"} 
            onValueChange={(value) => onFilterChange({ ...filters, propertyType: value === "all" ? undefined : value })}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Property Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="detached">Detached</SelectItem>
              <SelectItem value="semi_detached">Semi-Detached</SelectItem>
              <SelectItem value="terraced">Terraced</SelectItem>
              <SelectItem value="flat">Flat</SelectItem>
              <SelectItem value="apartment">Apartment</SelectItem>
              <SelectItem value="penthouse">Penthouse</SelectItem>
              <SelectItem value="studio">Studio</SelectItem>
              <SelectItem value="bungalow">Bungalow</SelectItem>
            </SelectContent>
          </Select>

          {/* Bedrooms Filter */}
          <Select 
            value={filters.bedrooms || "all"} 
            onValueChange={(value) => onFilterChange({ ...filters, bedrooms: value === "all" ? undefined : value })}
          >
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Beds" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any Beds</SelectItem>
              <SelectItem value="1">1+ Bed</SelectItem>
              <SelectItem value="2">2+ Beds</SelectItem>
              <SelectItem value="3">3+ Beds</SelectItem>
              <SelectItem value="4">4+ Beds</SelectItem>
              <SelectItem value="5">5+ Beds</SelectItem>
            </SelectContent>
          </Select>

          {/* Bathrooms Filter */}
          <Select 
            value={filters.bathrooms || "all"} 
            onValueChange={(value) => onFilterChange({ ...filters, bathrooms: value === "all" ? undefined : value })}
          >
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Baths" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any Baths</SelectItem>
              <SelectItem value="1">1+ Bath</SelectItem>
              <SelectItem value="2">2+ Baths</SelectItem>
              <SelectItem value="3">3+ Baths</SelectItem>
            </SelectContent>
          </Select>

          {/* Price Range Filter */}
          <Select 
            value={filters.priceRange || "all"} 
            onValueChange={(value) => onFilterChange({ ...filters, priceRange: value === "all" ? undefined : value })}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Price Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any Price</SelectItem>
              <SelectItem value="0-250000">Up to £250K</SelectItem>
              <SelectItem value="250000-500000">£250K - £500K</SelectItem>
              <SelectItem value="500000-750000">£500K - £750K</SelectItem>
              <SelectItem value="750000-1000000">£750K - £1M</SelectItem>
              <SelectItem value="1000000-2000000">£1M - £2M</SelectItem>
              <SelectItem value="2000000+">£2M+</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Active Filters Display */}
        {(searchQuery || Object.keys(filters).length > 0) && (
          <div className="flex flex-wrap gap-2 pt-2 border-t">
            {searchQuery && (
              <Badge variant="secondary" className="gap-1">
                <Search className="w-3 h-3" />
                "{searchQuery}"
                <X 
                  className="w-3 h-3 cursor-pointer hover:text-destructive" 
                  onClick={() => onSearchChange("")}
                />
              </Badge>
            )}
            {filters.status && (
              <Badge variant="secondary" className="gap-1">
                Status: {filters.status.replace(/_/g, ' ')}
                <X 
                  className="w-3 h-3 cursor-pointer hover:text-destructive" 
                  onClick={() => onFilterChange({ ...filters, status: undefined })}
                />
              </Badge>
            )}
            {filters.propertyType && (
              <Badge variant="secondary" className="gap-1">
                <Home className="w-3 h-3" />
                {filters.propertyType.replace(/_/g, ' ')}
                <X 
                  className="w-3 h-3 cursor-pointer hover:text-destructive" 
                  onClick={() => onFilterChange({ ...filters, propertyType: undefined })}
                />
              </Badge>
            )}
            {filters.bedrooms && (
              <Badge variant="secondary" className="gap-1">
                <Bed className="w-3 h-3" />
                {filters.bedrooms}+ beds
                <X 
                  className="w-3 h-3 cursor-pointer hover:text-destructive" 
                  onClick={() => onFilterChange({ ...filters, bedrooms: undefined })}
                />
              </Badge>
            )}
            {filters.bathrooms && (
              <Badge variant="secondary" className="gap-1">
                <Bath className="w-3 h-3" />
                {filters.bathrooms}+ baths
                <X 
                  className="w-3 h-3 cursor-pointer hover:text-destructive" 
                  onClick={() => onFilterChange({ ...filters, bathrooms: undefined })}
                />
              </Badge>
            )}
            {filters.priceRange && (
              <Badge variant="secondary" className="gap-1">
                <PoundSterling className="w-3 h-3" />
                {filters.priceRange === "2000000+" ? "£2M+" : filters.priceRange.replace("-", " - £")}
                <X 
                  className="w-3 h-3 cursor-pointer hover:text-destructive" 
                  onClick={() => onFilterChange({ ...filters, priceRange: undefined })}
                />
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}