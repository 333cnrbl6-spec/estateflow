import React, { useEffect, useState } from 'react';
import { rbmBrand } from '@/lib/brandConfig';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Award } from 'lucide-react';

export default function RBMTeamCard() {
  const [showBrand, setShowBrand] = React.useState(false);

  React.useEffect(() => {
    const isRBM = document.body.classList.contains('rbm-branded');
    setShowBrand(isRBM);
  }, []);

  if (!showBrand) return null;

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-900">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-blue-900" />
          <CardTitle className="text-blue-900">RBM Professional Team</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="text-sm text-gray-700 mb-4">
          <p>A dedicated team of qualified professionals with extensive experience in block management.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {rbmBrand.team.map((member, idx) => (
            <div key={idx} className="bg-white rounded-lg p-3 border-l-4 border-amber-400">
              <p className="font-semibold text-blue-900 text-sm">{member.name}</p>
              <p className="text-xs text-gray-600">{member.role}</p>
              <p className="text-xs text-gray-500 italic flex items-center gap-1 mt-1">
                <Award className="w-3 h-3" />
                {member.qualifications}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-4 p-3 bg-white border border-blue-200 rounded-lg">
          <p className="text-xs text-gray-700">
            <strong>Our Philosophy:</strong> Unlike large corporate agencies, we offer a truly personal and bespoke approach, tailoring every aspect of our service to meet the unique needs of each development we manage.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}