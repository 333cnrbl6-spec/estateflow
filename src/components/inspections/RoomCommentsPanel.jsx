import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, MessageSquare } from 'lucide-react';

const ROOMS = [
  'Living Room', 'Kitchen', 'Master Bedroom', 'Bedroom 2', 'Bedroom 3',
  'Bathroom', 'En-Suite', 'Hallway', 'Dining Room', 'Study', 'Garage', 'Garden',
];

const FIXTURE_TYPES = [
  'Boiler', 'Windows', 'Doors', 'Carpets', 'Flooring', 'Walls', 'Ceiling',
  'Lighting', 'Electrical Outlets', 'Plumbing', 'Appliances', 'Fixtures', 'Other',
];

const CONDITION_OPTIONS = ['excellent', 'good', 'fair', 'poor', 'critical'];

export default function RoomCommentsPanel({ roomComments, onCommentsChange, disabled }) {
  const [selectedRoom, setSelectedRoom] = useState('Living Room');
  const [showFixtureForm, setShowFixtureForm] = useState(false);
  const [roomComment, setRoomComment] = useState(roomComments[selectedRoom]?.comment || '');
  const [roomCondition, setRoomCondition] = useState(roomComments[selectedRoom]?.condition || 'good');
  const [fixture, setFixture] = useState({ name: '', condition: 'good', needsRepair: false, priority: 'low' });

  const handleRoomCommentChange = () => {
    onCommentsChange({
      ...roomComments,
      [selectedRoom]: {
        ...(roomComments[selectedRoom] || {}),
        comment: roomComment,
        condition: roomCondition,
      },
    });
  };

  const addFixture = () => {
    if (!fixture.name) return;
    
    const fixtures = roomComments[selectedRoom]?.fixtures || [];
    onCommentsChange({
      ...roomComments,
      [selectedRoom]: {
        ...(roomComments[selectedRoom] || {}),
        comment: roomComment,
        condition: roomCondition,
        fixtures: [
          ...fixtures,
          {
            fixture_id: `fixture-${Date.now()}`,
            name: fixture.name,
            condition: fixture.condition,
            needs_repair: fixture.needsRepair,
            repair_priority: fixture.priority,
          },
        ],
      },
    });
    setFixture({ name: '', condition: 'good', needsRepair: false, priority: 'low' });
    setShowFixtureForm(false);
  };

  const removeFixture = (fixtureId) => {
    onCommentsChange({
      ...roomComments,
      [selectedRoom]: {
        ...(roomComments[selectedRoom] || {}),
        fixtures: (roomComments[selectedRoom]?.fixtures || []).filter(f => f.fixture_id !== fixtureId),
      },
    });
  };

  const currentRoom = roomComments[selectedRoom] || {};
  const conditionColor = {
    excellent: 'bg-green-100 text-green-700',
    good: 'bg-blue-100 text-blue-700',
    fair: 'bg-amber-100 text-amber-700',
    poor: 'bg-orange-100 text-orange-700',
    critical: 'bg-red-100 text-red-700',
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-purple-600" />
          Room Comments & Fixtures
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Room Selection */}
        <div className="space-y-4 p-4 bg-slate-50 rounded-lg border">
          <div>
            <label className="text-sm font-medium mb-2 block">Select Room</label>
            <Select value={selectedRoom} onValueChange={setSelectedRoom} disabled={disabled}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ROOMS.map(room => (
                  <SelectItem key={room} value={room}>
                    {room}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Overall Condition</label>
            <Select
              value={roomCondition}
              onValueChange={(v) => {
                setRoomCondition(v);
                handleRoomCommentChange();
              }}
              disabled={disabled}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CONDITION_OPTIONS.map(c => (
                  <SelectItem key={c} value={c}>
                    {c.charAt(0).toUpperCase() + c.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">General Comments</label>
            <Textarea
              value={roomComment}
              onChange={(e) => setRoomComment(e.target.value)}
              onBlur={handleRoomCommentChange}
              placeholder="Add observations about this room..."
              rows={3}
              disabled={disabled}
            />
          </div>
        </div>

        {/* Fixtures List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="font-semibold text-sm">Fixtures & Issues</p>
            {!showFixtureForm && !disabled && (
              <Button
                size="sm"
                variant="outline"
                className="gap-1 h-8 text-xs"
                onClick={() => setShowFixtureForm(true)}
              >
                <Plus className="w-3 h-3" /> Add Fixture
              </Button>
            )}
          </div>

          {/* Fixture Form */}
          {showFixtureForm && (
            <div className="p-3 border rounded-lg bg-slate-50 space-y-3">
              <div>
                <label className="text-xs font-medium mb-1 block">Fixture/Item Name</label>
                <Select value={fixture.name} onValueChange={(v) => setFixture(f => ({ ...f, name: v }))}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="Select fixture..." />
                  </SelectTrigger>
                  <SelectContent>
                    {FIXTURE_TYPES.map(type => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-medium mb-1 block">Condition</label>
                  <Select value={fixture.condition} onValueChange={(v) => setFixture(f => ({ ...f, condition: v }))}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CONDITION_OPTIONS.map(c => (
                        <SelectItem key={c} value={c}>
                          {c.charAt(0).toUpperCase() + c.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-xs font-medium mb-1 block">Repair Priority</label>
                  <Select
                    value={fixture.priority}
                    onValueChange={(v) => setFixture(f => ({ ...f, priority: v }))}
                    disabled={!fixture.needsRepair}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {['low', 'medium', 'high', 'urgent'].map(p => (
                        <SelectItem key={p} value={p}>
                          {p.charAt(0).toUpperCase() + p.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <label className="flex items-center gap-2 text-xs">
                <input
                  type="checkbox"
                  checked={fixture.needsRepair}
                  onChange={(e) => setFixture(f => ({ ...f, needsRepair: e.target.checked }))}
                  className="rounded"
                />
                Requires Repair
              </label>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  className="text-xs h-7 flex-1"
                  onClick={addFixture}
                  disabled={!fixture.name}
                >
                  Add Fixture
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs h-7 flex-1"
                  onClick={() => {
                    setShowFixtureForm(false);
                    setFixture({ name: '', condition: 'good', needsRepair: false, priority: 'low' });
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Fixtures List */}
          <div className="space-y-2">
            {(currentRoom.fixtures || []).map(fix => (
              <div key={fix.fixture_id} className="p-3 border rounded-lg bg-white">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <p className="font-medium text-sm">{fix.name}</p>
                    <div className="flex gap-2 mt-1">
                      <Badge className={conditionColor[fix.condition]}>
                        {fix.condition}
                      </Badge>
                      {fix.needs_repair && (
                        <Badge variant="destructive">{fix.repair_priority}</Badge>
                      )}
                    </div>
                  </div>
                  {!disabled && (
                    <button
                      onClick={() => removeFixture(fix.fixture_id)}
                      className="text-red-600 hover:text-red-700 mt-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {(currentRoom.fixtures || []).length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-4">No fixtures added yet</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}