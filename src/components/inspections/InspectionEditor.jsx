import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Camera, 
  Upload, 
  Plus, 
  Trash2, 
  X,
  MapPin,
  Home,
  Wrench
} from 'lucide-react';
import { base44 } from "@/api/base44Client";
import { useMutation } from "@tanstack/react-query";

const ROOM_TYPES = [
  { value: 'living_room', label: 'Living Room' },
  { value: 'kitchen', label: 'Kitchen' },
  { value: 'bedroom', label: 'Bedroom' },
  { value: 'bathroom', label: 'Bathroom' },
  { value: 'hallway', label: 'Hallway' },
  { value: 'garden', label: 'Garden' },
  { value: 'other', label: 'Other' }
];

const CONDITION_OPTIONS = [
  { value: 'excellent', label: 'Excellent' },
  { value: 'good', label: 'Good' },
  { value: 'fair', label: 'Fair' },
  { value: 'poor', label: 'Poor' },
  { value: 'damaged', label: 'Damaged' }
];

const CLEANLINESS_OPTIONS = [
  { value: 'very_clean', label: 'Very Clean' },
  { value: 'clean', label: 'Clean' },
  { value: 'acceptable', label: 'Acceptable' },
  { value: 'dirty', label: 'Dirty' },
  { value: 'very_dirty', label: 'Very Dirty' }
];

const ITEM_CATEGORIES = [
  { value: 'furniture', label: 'Furniture' },
  { value: 'appliance', label: 'Appliance' },
  { value: 'fixture', label: 'Fixture' },
  { value: 'fitting', label: 'Fitting' },
  { value: 'flooring', label: 'Flooring' },
  { value: 'decoration', label: 'Decoration' },
  { value: 'other', label: 'Other' }
];

export default function InspectionEditor({ inspection, onSave, onCancel }) {
  const [activeTab, setActiveTab] = useState('rooms');
  const [rooms, setRooms] = useState(inspection?.rooms || []);
  const [currentRoom, setCurrentRoom] = useState(null);
  const [showAddRoom, setShowAddRoom] = useState(false);
  const [showAddItem, setShowAddItem] = useState(false);
  const [overallCondition, setOverallCondition] = useState(inspection?.overall_condition || '');
  const [meterReadings, setMeterReadings] = useState(inspection?.meter_readings || {});
  const [keysProvided, setKeysProvided] = useState(inspection?.keys_provided || []);
  const [newKey, setNewKey] = useState('');

  // Upload photo mutation
  const uploadMutation = useMutation({
    mutationFn: async (file) => {
      const response = await base44.integrations.Core.UploadFile({ file });
      return response.file_url;
    }
  });

  const handleAddRoom = (roomData) => {
    const newRoom = {
      ...roomData,
      items: [],
      photos: []
    };
    setRooms([...rooms, newRoom]);
    setShowAddRoom(false);
  };

  const handleUpdateRoom = (roomIndex, updatedRoom) => {
    const updatedRooms = [...rooms];
    updatedRooms[roomIndex] = { ...updatedRooms[roomIndex], ...updatedRoom };
    setRooms(updatedRooms);
  };

  const handleDeleteRoom = (roomIndex) => {
    const updatedRooms = rooms.filter((_, idx) => idx !== roomIndex);
    setRooms(updatedRooms);
  };

  const handleAddItemToRoom = (roomIndex, item) => {
    const updatedRooms = [...rooms];
    if (!updatedRooms[roomIndex].items) {
      updatedRooms[roomIndex].items = [];
    }
    updatedRooms[roomIndex].items.push(item);
    setRooms(updatedRooms);
  };

  const handleUploadPhoto = async (roomIndex, file, isItem = false, itemIndex = null) => {
    const fileUrl = await uploadMutation.mutateAsync(file);
    const updatedRooms = [...rooms];
    
    if (isItem && itemIndex !== null) {
      if (!updatedRooms[roomIndex].items[itemIndex].photo_urls) {
        updatedRooms[roomIndex].items[itemIndex].photo_urls = [];
      }
      updatedRooms[roomIndex].items[itemIndex].photo_urls.push(fileUrl);
    } else {
      if (!updatedRooms[roomIndex].photos) {
        updatedRooms[roomIndex].photos = [];
      }
      updatedRooms[roomIndex].photos.push(fileUrl);
    }
    
    setRooms(updatedRooms);
  };

  const handleAddKey = () => {
    if (newKey.trim()) {
      setKeysProvided([...keysProvided, newKey.trim()]);
      setNewKey('');
    }
  };

  const handleRemoveKey = (index) => {
    setKeysProvided(keysProvided.filter((_, idx) => idx !== index));
  };

  const handleSave = () => {
    onSave({
      ...inspection,
      rooms,
      overall_condition: overallCondition,
      meter_readings: meterReadings,
      keys_provided: keysProvided,
      completed_date: new Date().toISOString(),
      status: 'pending_tenant_review'
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Edit Inspection Report</h3>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
          <Button onClick={handleSave}>Save Report</Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="rooms">Rooms & Items</TabsTrigger>
          <TabsTrigger value="details">Property Details</TabsTrigger>
          <TabsTrigger value="summary">Summary</TabsTrigger>
        </TabsList>

        <TabsContent value="rooms" className="space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="font-medium">Rooms</h4>
            <Button size="sm" onClick={() => setShowAddRoom(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Room
            </Button>
          </div>

          {rooms.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Home className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No rooms added yet</p>
              <p className="text-sm">Start by adding rooms to the inspection</p>
            </div>
          ) : (
            <div className="space-y-4">
              {rooms.map((room, roomIdx) => (
                <RoomCard
                  key={roomIdx}
                  room={room}
                  roomIndex={roomIdx}
                  onUpdateRoom={handleUpdateRoom}
                  onDeleteRoom={handleDeleteRoom}
                  onAddItem={(item) => handleAddItemToRoom(roomIdx, item)}
                  onUploadPhoto={(file, isItem, itemIdx) => handleUploadPhoto(roomIdx, file, isItem, itemIdx)}
                  uploadMutation={uploadMutation}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="details" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Overall Condition</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-5 gap-2">
                {CONDITION_OPTIONS.map((option) => (
                  <Button
                    key={option.value}
                    variant={overallCondition === option.value ? 'default' : 'outline'}
                    className="text-xs"
                    onClick={() => setOverallCondition(option.value)}
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Meter Readings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label htmlFor="electricity">Electricity</Label>
                <Input
                  id="electricity"
                  value={meterReadings.electricity || ''}
                  onChange={(e) => setMeterReadings({ ...meterReadings, electricity: e.target.value })}
                  placeholder="Enter reading"
                />
              </div>
              <div>
                <Label htmlFor="gas">Gas</Label>
                <Input
                  id="gas"
                  value={meterReadings.gas || ''}
                  onChange={(e) => setMeterReadings({ ...meterReadings, gas: e.target.value })}
                  placeholder="Enter reading"
                />
              </div>
              <div>
                <Label htmlFor="water">Water</Label>
                <Input
                  id="water"
                  value={meterReadings.water || ''}
                  onChange={(e) => setMeterReadings({ ...meterReadings, water: e.target.value })}
                  placeholder="Enter reading"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Keys Provided</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 mb-3">
                <Input
                  value={newKey}
                  onChange={(e) => setNewKey(e.target.value)}
                  placeholder="e.g., Front door, Back door"
                  onKeyPress={(e) => e.key === 'Enter' && handleAddKey()}
                />
                <Button onClick={handleAddKey} size="sm">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              {keysProvided.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {keysProvided.map((key, idx) => (
                    <Badge key={idx} variant="secondary" className="flex items-center gap-1">
                      {key}
                      <button onClick={() => handleRemoveKey(idx)} className="hover:text-destructive">
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="summary">
          <Card>
            <CardHeader>
              <CardTitle>Inspection Summary</CardTitle>
              <CardDescription>
                Review before saving
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Total Rooms</Label>
                  <p className="text-2xl font-bold">{rooms.length}</p>
                </div>
                <div>
                  <Label>Total Items</Label>
                  <p className="text-2xl font-bold">
                    {rooms.reduce((sum, room) => sum + (room.items?.length || 0), 0)}
                  </p>
                </div>
              </div>

              {overallCondition && (
                <div>
                  <Label>Overall Condition</Label>
                  <p className="font-medium">{overallCondition.toUpperCase()}</p>
                </div>
              )}

              {keysProvided.length > 0 && (
                <div>
                  <Label>Keys Provided</Label>
                  <p className="font-medium">{keysProvided.join(', ')}</p>
                </div>
              )}

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> Once saved, this report will be sent to the tenant for review and digital sign-off.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {showAddRoom && (
        <AddRoomDialog
          onAdd={handleAddRoom}
          onCancel={() => setShowAddRoom(false)}
        />
      )}
    </div>
  );
}

function RoomCard({ room, roomIndex, onUpdateRoom, onDeleteRoom, onAddItem, onUploadPhoto, uploadMutation }) {
  const [showAddItem, setShowAddItem] = useState(false);

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{room.room_name}</CardTitle>
            <CardDescription>
              {ROOM_TYPES.find(t => t.value === room.room_type)?.label} • {room.condition_rating.toUpperCase()}
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={() => onDeleteRoom(roomIndex)}>
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-2 text-sm">
          <div>
            <span className="text-muted-foreground">Walls:</span>{' '}
            <span className="font-medium">{room.walls_condition || 'N/A'}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Flooring:</span>{' '}
            <span className="font-medium">{room.flooring_condition || 'N/A'}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Windows:</span>{' '}
            <span className="font-medium">{room.windows_condition || 'N/A'}</span>
          </div>
        </div>

        {room.notes && (
          <div className="text-sm">
            <span className="text-muted-foreground">Notes:</span>{' '}
            <p className="inline">{room.notes}</p>
          </div>
        )}

        {room.items && room.items.length > 0 && (
          <div>
            <div className="flex justify-between items-center mb-2">
              <Label className="text-sm">Items ({room.items.length})</Label>
              <Button size="sm" variant="outline" onClick={() => setShowAddItem(true)}>
                <Plus className="w-3 h-3 mr-1" />
                Add Item
              </Button>
            </div>
            <div className="space-y-2">
              {room.items.map((item, itemIdx) => (
                <div key={itemIdx} className="border rounded p-3 bg-muted/50">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-sm">{item.item_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {ITEM_CATEGORIES.find(c => c.value === item.item_category)?.label} • {item.condition.toUpperCase()}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs">{item.cleanliness}</Badge>
                  </div>
                  {item.description && (
                    <p className="text-xs mt-1">{item.description}</p>
                  )}
                  {item.notes && (
                    <p className="text-xs text-muted-foreground mt-1">Note: {item.notes}</p>
                  )}
                  {item.photo_urls && item.photo_urls.length > 0 && (
                    <div className="flex gap-1 mt-2">
                      {item.photo_urls.map((url, photoIdx) => (
                        <img
                          key={photoIdx}
                          src={url}
                          alt="Item photo"
                          className="w-12 h-12 object-cover rounded cursor-pointer hover:opacity-75"
                          onClick={() => window.open(url, '_blank')}
                        />
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {!room.items || room.items.length === 0 ? (
          <Button size="sm" variant="outline" onClick={() => setShowAddItem(true)}>
            <Plus className="w-3 h-3 mr-1" />
            Add First Item
          </Button>
        ) : null}

        <div>
          <Label className="text-sm mb-2 block">Room Photos</Label>
          <div className="flex gap-2 flex-wrap">
            {room.photos && room.photos.map((url, idx) => (
              <img
                key={idx}
                src={url}
                alt={`Room photo ${idx + 1}`}
                className="w-20 h-20 object-cover rounded cursor-pointer hover:opacity-75"
                onClick={() => window.open(url, '_blank')}
              />
            ))}
            <label className="w-20 h-20 border-2 border-dashed border-muted-foreground/25 rounded-lg flex items-center justify-center cursor-pointer hover:border-primary/50">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    onUploadPhoto(e.target.files[0]);
                  }
                }}
              />
              <Camera className="w-6 h-6 text-muted-foreground" />
            </label>
          </div>
        </div>

        {room.notes && (
          <div className="text-sm text-muted-foreground">
            {room.notes}
          </div>
        )}
      </CardContent>

      {showAddItem && (
        <AddItemDialog
          onAdd={(item) => {
            onAddItem(item);
            setShowAddItem(false);
          }}
          onCancel={() => setShowAddItem(false)}
        />
      )}
    </Card>
  );
}

function AddRoomDialog({ onAdd, onCancel }) {
  const [formData, setFormData] = useState({
    room_name: '',
    room_type: 'living_room',
    condition_rating: 'good',
    walls_condition: 'good',
    flooring_condition: 'good',
    windows_condition: 'good',
    notes: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onAdd(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-background rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">Add Room</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="room_name">Room Name</Label>
            <Input
              id="room_name"
              value={formData.room_name}
              onChange={(e) => setFormData({ ...formData, room_name: e.target.value })}
              placeholder="e.g., Master Bedroom, Kitchen"
              required
            />
          </div>

          <div>
            <Label htmlFor="room_type">Room Type</Label>
            <Select
              value={formData.room_type}
              onValueChange={(value) => setFormData({ ...formData, room_type: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ROOM_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="condition_rating">Overall Condition</Label>
            <Select
              value={formData.condition_rating}
              onValueChange={(value) => setFormData({ ...formData, condition_rating: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CONDITION_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <Label>Walls</Label>
              <Select
                value={formData.walls_condition}
                onValueChange={(value) => setFormData({ ...formData, walls_condition: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CONDITION_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Flooring</Label>
              <Select
                value={formData.flooring_condition}
                onValueChange={(value) => setFormData({ ...formData, flooring_condition: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CONDITION_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Windows</Label>
              <Select
                value={formData.windows_condition}
                onValueChange={(value) => setFormData({ ...formData, windows_condition: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CONDITION_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              placeholder="Additional observations..."
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit">Add Room</Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AddItemDialog({ onAdd, onCancel }) {
  const [formData, setFormData] = useState({
    item_name: '',
    item_category: 'furniture',
    condition: 'good',
    cleanliness: 'clean',
    description: '',
    notes: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onAdd(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-background rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">Add Item</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="item_name">Item Name</Label>
            <Input
              id="item_name"
              value={formData.item_name}
              onChange={(e) => setFormData({ ...formData, item_name: e.target.value })}
              placeholder="e.g., Sofa, Carpet, Light fixture"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="item_category">Category</Label>
              <Select
                value={formData.item_category}
                onValueChange={(value) => setFormData({ ...formData, item_category: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ITEM_CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="condition">Condition</Label>
              <Select
                value={formData.condition}
                onValueChange={(value) => setFormData({ ...formData, condition: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CONDITION_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="cleanliness">Cleanliness</Label>
            <Select
              value={formData.cleanliness}
              onValueChange={(value) => setFormData({ ...formData, cleanliness: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CLEANLINESS_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={2}
              placeholder="Describe the item and its condition..."
            />
          </div>

          <div>
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={2}
              placeholder="Any damage, wear, or observations..."
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit">Add Item</Button>
          </div>
        </form>
      </div>
    </div>
  );
}