import React, { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { Plus, User, Mail, Phone, MapPin, Calendar, PoundSterling } from "lucide-react";

export default function SalesLeadFormDialog({ open, onOpenChange }) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    lead_type: "buyer",
    contact_name: "",
    contact_email: "",
    contact_phone: "",
    source: "phone",
    status: "new",
    property_type: "",
    location_preference: "",
    bedrooms_min: 1,
    budget_min: 0,
    budget_max: 0,
    timescale: "3_months",
    motivation: "",
    notes: "",
  });

  const createLeadMutation = useMutation({
    mutationFn: (data) => base44.entities.SalesLead.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales-leads'] });
      toast.success("Lead created successfully");
      onOpenChange(false);
      setFormData({
        lead_type: "buyer",
        contact_name: "",
        contact_email: "",
        contact_phone: "",
        source: "phone",
        status: "new",
        property_type: "",
        location_preference: "",
        bedrooms_min: 1,
        budget_min: 0,
        budget_max: 0,
        timescale: "3_months",
        motivation: "",
        notes: "",
      });
    },
    onError: (error) => {
      toast.error(`Failed to create lead: ${error.message}`);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createLeadMutation.mutate(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Sales Lead</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Lead Type & Source */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Lead Type *</Label>
              <Select 
                value={formData.lead_type} 
                onValueChange={(value) => setFormData({...formData, lead_type: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="buyer">Buyer</SelectItem>
                  <SelectItem value="seller">Seller</SelectItem>
                  <SelectItem value="landlord">Landlord</SelectItem>
                  <SelectItem value="tenant">Tenant</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Source</Label>
              <Select 
                value={formData.source} 
                onValueChange={(value) => setFormData({...formData, source: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="phone">Phone Call</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="website">Website</SelectItem>
                  <SelectItem value="portal">Property Portal</SelectItem>
                  <SelectItem value="referral">Referral</SelectItem>
                  <SelectItem value="walk_in">Walk-in</SelectItem>
                  <SelectItem value="social_media">Social Media</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <User className="w-4 h-4" />
              Contact Information
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Name *</Label>
                <Input
                  value={formData.contact_name}
                  onChange={(e) => setFormData({...formData, contact_name: e.target.value})}
                  placeholder="John Smith"
                  required
                />
              </div>
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={formData.contact_email}
                  onChange={(e) => setFormData({...formData, contact_email: e.target.value})}
                  placeholder="john@example.com"
                />
              </div>
              <div>
                <Label>Phone</Label>
                <Input
                  value={formData.contact_phone}
                  onChange={(e) => setFormData({...formData, contact_phone: e.target.value})}
                  placeholder="07123 456789"
                />
              </div>
            </div>
          </div>

          {/* Property Preferences */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Property Preferences
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Property Type</Label>
                <Select 
                  value={formData.property_type} 
                  onValueChange={(value) => setFormData({...formData, property_type: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="house">House</SelectItem>
                    <SelectItem value="flat">Flat</SelectItem>
                    <SelectItem value="apartment">Apartment</SelectItem>
                    <SelectItem value="penthouse">Penthouse</SelectItem>
                    <SelectItem value="studio">Studio</SelectItem>
                    <SelectItem value="maisonette">Maisonette</SelectItem>
                    <SelectItem value="commercial">Commercial</SelectItem>
                    <SelectItem value="land">Land</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Location</Label>
                <Input
                  value={formData.location_preference}
                  onChange={(e) => setFormData({...formData, location_preference: e.target.value})}
                  placeholder="e.g., London, Brighton"
                />
              </div>
              <div>
                <Label>Min Bedrooms</Label>
                <Input
                  type="number"
                  min="0"
                  value={formData.bedrooms_min}
                  onChange={(e) => setFormData({...formData, bedrooms_min: parseInt(e.target.value) || 0})}
                />
              </div>
            </div>
          </div>

          {/* Budget */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <PoundSterling className="w-4 h-4" />
              Budget
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Min Budget (£)</Label>
                <Input
                  type="number"
                  min="0"
                  value={formData.budget_min}
                  onChange={(e) => setFormData({...formData, budget_min: parseInt(e.target.value) || 0})}
                  placeholder="0"
                />
              </div>
              <div>
                <Label>Max Budget (£)</Label>
                <Input
                  type="number"
                  min="0"
                  value={formData.budget_max}
                  onChange={(e) => setFormData({...formData, budget_max: parseInt(e.target.value) || 0})}
                  placeholder="1000000"
                />
              </div>
            </div>
          </div>

          {/* Timescale & Motivation */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Timeline
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Timescale</Label>
                <Select 
                  value={formData.timescale} 
                  onValueChange={(value) => setFormData({...formData, timescale: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select timescale" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="immediate">Immediate</SelectItem>
                    <SelectItem value="1_month">1 Month</SelectItem>
                    <SelectItem value="3_months">3 Months</SelectItem>
                    <SelectItem value="6_months">6 Months</SelectItem>
                    <SelectItem value="12_months">12 Months</SelectItem>
                    <SelectItem value="unsure">Unsure</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Motivation</Label>
                <Input
                  value={formData.motivation}
                  onChange={(e) => setFormData({...formData, motivation: e.target.value})}
                  placeholder="e.g., Job relocation, upsizing"
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <Label>Notes</Label>
            <Textarea
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              placeholder="Additional notes about this lead..."
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createLeadMutation.isPending}>
              {createLeadMutation.isPending ? "Creating..." : "Create Lead"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}