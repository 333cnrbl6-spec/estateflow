import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Loader } from 'lucide-react';
import { toast } from 'sonner';

export default function VendorRegistrationForm({ onComplete }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'general_contractor',
    contact_name: '',
    email: '',
    phone: '',
    address: '',
    postcode: '',
    registration_number: '',
    tax_id: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const vendor = await base44.entities.Vendor.create({
        ...formData,
        status: 'active'
      });

      // Send notification to admins
      await base44.functions.invoke('notifyVendorRegistration', {
        vendorId: vendor.id,
        vendorData: formData
      });

      toast.success('Business registration submitted successfully!');
      onComplete(vendor);
    } catch (error) {
      toast.error('Failed to register: ' + error.message);
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Company Name *</label>
          <Input
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Your company name"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Service Type *</label>
          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
            required
          >
            <option value="plumber">Plumber</option>
            <option value="electrician">Electrician</option>
            <option value="gas_engineer">Gas Engineer</option>
            <option value="general_contractor">General Contractor</option>
            <option value="cleaning">Cleaning</option>
            <option value="gardening">Gardening</option>
            <option value="pest_control">Pest Control</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Contact Name *</label>
          <Input
            name="contact_name"
            value={formData.contact_name}
            onChange={handleChange}
            placeholder="Primary contact person"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Email *</label>
          <Input
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="your@email.com"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Phone *</label>
          <Input
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleChange}
            placeholder="+44 (0)20 xxxx xxxx"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Address *</label>
          <Input
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="Business address"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Postcode *</label>
          <Input
            name="postcode"
            value={formData.postcode}
            onChange={handleChange}
            placeholder="e.g., SW1A 2AA"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Company Registration Number</label>
          <Input
            name="registration_number"
            value={formData.registration_number}
            onChange={handleChange}
            placeholder="Optional"
          />
        </div>

        <div className="col-span-2">
          <label className="block text-sm font-medium text-foreground mb-2">Tax ID / VAT Number</label>
          <Input
            name="tax_id"
            value={formData.tax_id}
            onChange={handleChange}
            placeholder="Optional"
          />
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-xs text-blue-800">
          ✓ Your information will be securely stored<br/>
          ✓ We'll contact you to verify details<br/>
          ✓ You'll receive confirmation once approved
        </p>
      </div>

      <Button
        type="submit"
        disabled={loading}
        className="w-full"
      >
        {loading ? (
          <>
            <Loader className="w-4 h-4 animate-spin mr-2" />
            Registering...
          </>
        ) : (
          'Continue to Insurance Upload'
        )}
      </Button>
    </form>
  );
}