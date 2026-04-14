import React, { useState, useMemo } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export default function PropertyMapView({ properties = [], units = [], maintenance = [] }) {
  const [colorBy, setColorBy] = useState('occupancy'); // 'occupancy' or 'maintenance'

  // Filter properties with valid coordinates
  const propertiesWithCoords = useMemo(() => 
    properties.filter(p => p.latitude && p.longitude),
    [properties]
  );

  // Calculate occupancy for each property
  const propertyStats = useMemo(() => 
    propertiesWithCoords.map(prop => {
      const propUnits = units.filter(u => u.property_id === prop.id);
      const occupiedUnits = propUnits.filter(u => u.status === 'occupied').length;
      const occupancyRate = propUnits.length > 0 ? Math.round((occupiedUnits / propUnits.length) * 100) : 0;
      
      const propMaintenance = maintenance.filter(m => m.property_id === prop.id && !['completed', 'cancelled'].includes(m.status));
      const maintenanceCount = propMaintenance.length;

      return {
        ...prop,
        occupancyRate,
        maintenanceCount,
        unitsTotal: propUnits.length,
        unitsOccupied: occupiedUnits
      };
    }),
    [propertiesWithCoords, units, maintenance]
  );

  // Determine color based on selection
  const getColor = (prop) => {
    if (colorBy === 'occupancy') {
      if (prop.occupancyRate >= 90) return '#22c55e'; // Green
      if (prop.occupancyRate >= 70) return '#eab308'; // Yellow
      if (prop.occupancyRate >= 50) return '#f97316'; // Orange
      return '#ef4444'; // Red
    } else {
      if (prop.maintenanceCount === 0) return '#22c55e'; // Green
      if (prop.maintenanceCount <= 2) return '#eab308'; // Yellow
      if (prop.maintenanceCount <= 5) return '#f97316'; // Orange
      return '#ef4444'; // Red
    }
  };

  // Calculate bounds
  const bounds = useMemo(() => {
    if (propertyStats.length === 0) return null;
    const lats = propertyStats.map(p => p.latitude);
    const lngs = propertyStats.map(p => p.longitude);
    return [
      [Math.min(...lats) - 0.1, Math.min(...lngs) - 0.1],
      [Math.max(...lats) + 0.1, Math.max(...lngs) + 0.1]
    ];
  }, [propertyStats]);

  if (propertiesWithCoords.length === 0) {
    return (
      <Card className="p-6 text-center">
        <p className="text-muted-foreground">No properties with location data available</p>
        <p className="text-xs text-muted-foreground mt-2">Add latitude and longitude to properties to display on map</p>
      </Card>
    );
  }

  return (
    <Card className="p-4">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-semibold text-foreground">Property Locations</h3>
        <div className="flex gap-2">
          <Button
            onClick={() => setColorBy('occupancy')}
            variant={colorBy === 'occupancy' ? 'default' : 'outline'}
            size="sm"
            className="text-xs"
          >
            By Occupancy
          </Button>
          <Button
            onClick={() => setColorBy('maintenance')}
            variant={colorBy === 'maintenance' ? 'default' : 'outline'}
            size="sm"
            className="text-xs"
          >
            By Maintenance
          </Button>
        </div>
      </div>

      {/* Legend */}
      <div className="mb-4 flex flex-wrap gap-3 text-xs">
        {colorBy === 'occupancy' ? (
          <>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-green-500"></div>
              <span>≥90% occupied</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-yellow-400"></div>
              <span>70-89%</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-orange-500"></div>
              <span>50-69%</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-red-500"></div>
              <span>&lt;50%</span>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-green-500"></div>
              <span>No issues</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-yellow-400"></div>
              <span>1-2 issues</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-orange-500"></div>
              <span>3-5 issues</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-red-500"></div>
              <span>&gt;5 issues</span>
            </div>
          </>
        )}
      </div>

      {/* Map */}
      <div className="rounded-lg overflow-hidden border border-border" style={{ height: '400px' }}>
        {bounds && (
          <MapContainer
            bounds={bounds}
            style={{ height: '100%', width: '100%' }}
            scrollWheelZoom={true}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            {propertyStats.map(prop => (
              <CircleMarker
                key={prop.id}
                center={[prop.latitude, prop.longitude]}
                radius={Math.max(8, Math.min(20, 8 + prop.unitsTotal / 2))}
                pathOptions={{
                  color: getColor(prop),
                  weight: 2,
                  opacity: 0.8,
                  fillOpacity: 0.6
                }}
              >
                <Popup>
                  <div className="text-sm font-medium">{prop.address}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {prop.postcode}
                  </div>
                  <div className="mt-2 space-y-1 text-xs">
                    {colorBy === 'occupancy' ? (
                      <>
                        <div>Occupancy: {prop.occupancyRate}%</div>
                        <div className="text-muted-foreground">
                          {prop.unitsOccupied}/{prop.unitsTotal} units occupied
                        </div>
                      </>
                    ) : (
                      <>
                        <div>Open Issues: {prop.maintenanceCount}</div>
                        {prop.maintenanceCount > 0 && (
                          <Badge variant="outline" className="mt-1">
                            {prop.maintenanceCount} maintenance item{prop.maintenanceCount !== 1 ? 's' : ''}
                          </Badge>
                        )}
                      </>
                    )}
                  </div>
                </Popup>
              </CircleMarker>
            ))}
          </MapContainer>
        )}
      </div>

      <div className="mt-4 text-xs text-muted-foreground text-center">
        {propertyStats.length} properties with location data
      </div>
    </Card>
  );
}