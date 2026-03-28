import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { AlertCircle, CheckCircle, Phone } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function PhoneNumberMatcher({ phone, onMatchFound, onCancel }) {
  const [isMatching, setIsMatching] = useState(false);
  const [matchResult, setMatchResult] = useState(null);

  // Search all entities that might have this phone number
  const { data: tenants = [] } = useQuery({
    queryKey: ['tenants-by-phone', phone],
    queryFn: async () => {
      if (!phone || phone.length < 5) return [];
      const all = await base44.entities.Tenant.list();
      return all.filter(t => t.phone?.replace(/\D/g, '').includes(phone.replace(/\D/g, '')));
    },
    enabled: phone.length > 4
  });

  const { data: contacts = [] } = useQuery({
    queryKey: ['contacts-by-phone', phone],
    queryFn: async () => {
      if (!phone || phone.length < 5) return [];
      const all = await base44.entities.Contact.list();
      return all.filter(c => c.phone?.replace(/\D/g, '').includes(phone.replace(/\D/g, '')));
    },
    enabled: phone.length > 4
  });

  const { data: properties = [] } = useQuery({
    queryKey: ['properties-by-contact', tenants.length > 0 ? tenants[0].id : null],
    queryFn: async () => {
      if (tenants.length === 0) return [];
      const props = await base44.entities.Property.list();
      return props.filter(p => p.id === tenants[0]?.property_id);
    },
    enabled: tenants.length > 0
  });

  useEffect(() => {
    if (phone.length > 4) {
      performMatch();
    }
  }, [phone]);

  const performMatch = async () => {
    setIsMatching(true);
    
    // Combine all matches
    const allMatches = [];
    
    // Add tenant matches with property info
    for (const tenant of tenants) {
      const prop = properties.find(p => p.id === tenant.property_id);
      allMatches.push({
        type: 'tenant',
        data: tenant,
        property: prop,
        priority: 1
      });
    }
    
    // Add contact matches
    for (const contact of contacts) {
      allMatches.push({
        type: 'contact',
        data: contact,
        priority: 2
      });
    }

    setMatchResult(allMatches.length > 0 ? allMatches : { noMatch: true });
    setIsMatching(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Phone className="w-4 h-4" />
          Phone Number Lookup
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label className="text-sm font-medium mb-2 block">Enter Phone Number</Label>
          <Input 
            placeholder="07xxx xxxxxx or +44..."
            value={phone}
            readOnly
            className="bg-muted"
          />
          <p className="text-xs text-muted-foreground mt-1">Auto-matching known numbers</p>
        </div>

        {isMatching ? (
          <div className="flex items-center justify-center py-6">
            <div className="text-center space-y-2">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-sm text-muted-foreground">Searching database...</p>
            </div>
          </div>
        ) : matchResult ? (
          <div className="space-y-3">
            {matchResult.noMatch ? (
              <div className="flex items-start gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-yellow-900">No matches found</p>
                  <p className="text-xs text-yellow-800">This phone number is not in the system</p>
                </div>
              </div>
            ) : (
              matchResult.map((match, idx) => (
                <div 
                  key={idx}
                  className="p-3 border rounded-lg hover:bg-secondary/50 transition-colors cursor-pointer"
                  onClick={() => onMatchFound(match)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600 shrink-0" />
                        <p className="font-medium text-sm">{match.data.full_name}</p>
                        <span className="inline-block px-2 py-0.5 bg-primary/10 text-primary text-xs rounded">
                          {match.type === 'tenant' ? 'Tenant' : 'Contact'}
                        </span>
                      </div>
                      {match.property && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {match.property.name} - {match.property.city}
                        </p>
                      )}
                      {match.type === 'contact' && match.data.company_name && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {match.data.company_name}
                        </p>
                      )}
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        onMatchFound(match);
                      }}
                    >
                      Select
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : null}

        <Button variant="outline" onClick={onCancel} className="w-full">
          Cancel
        </Button>
      </CardContent>
    </Card>
  );
}