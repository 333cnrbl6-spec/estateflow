import React, { useEffect, useState } from 'react';
import { rbmBrand } from '@/lib/brandConfig';
import { Building2, Phone, Mail, MapPin, Clock } from 'lucide-react';

export default function RBMBrandedHeader() {
  const [showBrand, setShowBrand] = useState(false);

  useEffect(() => {
    // Check if RBM branding is active
    const isRBM = document.body.classList.contains('rbm-branded');
    setShowBrand(isRBM);
  }, []);

  if (!showBrand) return null;

  return (
    <div className="bg-gradient-to-r from-blue-900 to-blue-800 text-white border-b-4 border-amber-400">
      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Building2 className="w-8 h-8" />
              <div>
                <h1 className="text-3xl font-serif font-bold">{rbmBrand.name}</h1>
                <p className="text-blue-100 italic">{rbmBrand.tagline}</p>
              </div>
            </div>
          </div>
          <div className="text-right text-sm text-blue-100">
            <p className="font-semibold">Professional Block Management</p>
            <p>The Property Institute Member | The Property Ombudsman</p>
          </div>
        </div>

        {/* Contact Info Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-amber-400" />
            <div>
              <p className="text-blue-100 text-xs">Office</p>
              <p className="font-semibold">{rbmBrand.contact.office.split(',')[0]}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-amber-400" />
            <div>
              <p className="text-blue-100 text-xs">Phone</p>
              <p className="font-semibold">{rbmBrand.contact.phone}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-amber-400" />
            <div>
              <p className="text-blue-100 text-xs">Email</p>
              <p className="font-semibold text-xs">{rbmBrand.contact.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-400" />
            <div>
              <p className="text-blue-100 text-xs">Emergency</p>
              <p className="font-semibold">{rbmBrand.contact.emergencyLine}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}