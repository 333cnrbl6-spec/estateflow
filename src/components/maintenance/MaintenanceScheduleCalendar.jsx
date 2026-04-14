import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { MapPin, Wrench, Calendar, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function MaintenanceScheduleCalendar() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [selectedTradeType, setSelectedTradeType] = useState('all');
  const [assigning, setAssigning] = useState(false);

  // Fetch data
  const { data: tasks = [] } = useQuery({
    queryKey: ['maintenanceTasks'],
    queryFn: () => base44.entities.MaintenanceOrder?.list?.('-created_date', 100) || Promise.resolve([])
  });

  const { data: vendors = [] } = useQuery({
    queryKey: ['vendors'],
    queryFn: () => base44.entities.Vendor?.list?.('-updated_date', 200) || Promise.resolve([])
  });

  const { data: properties = [] } = useQuery({
    queryKey: ['properties'],
    queryFn: () => base44.entities.Property?.list?.('-updated_date', 100) || Promise.resolve([])
  });

  // Get unique locations
  const locations = useMemo(() => {
    const locs = new Set(properties.map(p => p.region || 'unknown'));
    return Array.from(locs);
  }, [properties]);

  // Get unique trade types
  const tradeTypes = useMemo(() => {
    const types = new Set(vendors.map(v => v.type || 'other'));
    return Array.from(types);
  }, [vendors]);

  // Filter unassigned tasks
  const unassignedTasks = useMemo(() => {
    return tasks.filter(t => !t.assigned_to_vendor && ['pending', 'in_progress'].includes(t.status));
  }, [tasks]);

  // Filter vendors by location and trade type
  const availableVendors = useMemo(() => {
    return vendors.filter(v => {
      const locationMatch = selectedLocation === 'all' || v.location === selectedLocation;
      const tradeMatch = selectedTradeType === 'all' || v.type === selectedTradeType;
      return locationMatch && tradeMatch && v.status === 'active';
    });
  }, [vendors, selectedLocation, selectedTradeType]);

  const handleDragEnd = async (result) => {
    const { source, destination, draggableId } = result;

    if (!destination) return;
    if (source.droppableId === destination.droppableId) return;

    const taskId = draggableId;
    const vendorId = destination.droppableId.replace('vendor-', '');

    if (!vendorId) return;

    setAssigning(true);
    try {
      const scheduledDate = new Date(selectedDate);
      scheduledDate.setHours(9, 0, 0, 0);

      await base44.functions.invoke('assignTaskToVendor', {
        taskId,
        vendorId,
        scheduledDate: scheduledDate.toISOString()
      });

      toast.success('Task assigned to vendor');
    } catch (error) {
      toast.error('Failed to assign task: ' + error.message);
    } finally {
      setAssigning(false);
    }
  };

  const getTaskColor = (priority) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 border-red-300 text-red-900';
      case 'high':
        return 'bg-orange-100 border-orange-300 text-orange-900';
      case 'medium':
        return 'bg-blue-100 border-blue-300 text-blue-900';
      default:
        return 'bg-slate-100 border-slate-300 text-slate-900';
    }
  };

  const getVendorAvailability = (vendor) => {
    const assignedCount = tasks.filter(t => t.assigned_to_vendor === vendor.id).length;
    return {
      assigned: assignedCount,
      capacity: vendor.maximum_visits_per_month || 10
    };
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="space-y-6">
        {/* Header and Filters */}
        <Card className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Maintenance Schedule</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Drag tasks to assign them to vendors
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Date</label>
              <input
                type="date"
                value={selectedDate.toISOString().split('T')[0]}
                onChange={(e) => setSelectedDate(new Date(e.target.value))}
                className="w-full px-3 py-2 border border-input rounded-md bg-background"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Location</label>
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="w-full px-3 py-2 border border-input rounded-md bg-background"
              >
                <option value="all">All Locations</option>
                {locations.map(loc => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Trade Type</label>
              <select
                value={selectedTradeType}
                onChange={(e) => setSelectedTradeType(e.target.value)}
                className="w-full px-3 py-2 border border-input rounded-md bg-background"
              >
                <option value="all">All Types</option>
                {tradeTypes.map(type => (
                  <option key={type} value={type}>
                    {type.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </Card>

        {/* Calendar Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Tasks Column */}
          <div className="lg:col-span-1">
            <Card className="p-4 sticky top-6">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Unassigned Tasks ({unassignedTasks.length})
              </h3>

              <Droppable droppableId="unassigned" type="TASK">
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`space-y-2 min-h-[200px] p-2 rounded-lg border-2 border-dashed ${
                      snapshot.isDraggingOver ? 'border-primary bg-primary/5' : 'border-slate-300'
                    }`}
                  >
                    {unassignedTasks.length === 0 ? (
                      <p className="text-xs text-muted-foreground text-center py-8">No unassigned tasks</p>
                    ) : (
                      unassignedTasks.map((task, idx) => (
                        <Draggable key={task.id} draggableId={task.id} index={idx}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`p-2 rounded border text-xs cursor-move transition-all ${getTaskColor(task.priority)} ${
                                snapshot.isDragging ? 'rotate-3 shadow-lg' : ''
                              }`}
                            >
                              <p className="font-medium truncate">{task.title}</p>
                              <p className="text-xs opacity-75 mt-1">{task.category}</p>
                            </div>
                          )}
                        </Draggable>
                      ))
                    )}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </Card>
          </div>

          {/* Vendors Column */}
          <div className="lg:col-span-3 space-y-4">
            <div className="text-sm text-muted-foreground">
              Showing {availableVendors.length} vendor(s) for {selectedDate.toLocaleDateString()}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {availableVendors.length === 0 ? (
                <Card className="p-8 col-span-full text-center">
                  <Wrench className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-20" />
                  <p className="text-muted-foreground">No vendors match the selected filters</p>
                </Card>
              ) : (
                availableVendors.map(vendor => {
                  const availability = getVendorAvailability(vendor);
                  const capacityPercent = (availability.assigned / availability.capacity) * 100;

                  return (
                    <Droppable key={vendor.id} droppableId={`vendor-${vendor.id}`} type="TASK">
                      {(provided, snapshot) => (
                        <Card
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          className={`p-4 transition-all ${
                            snapshot.isDraggingOver
                              ? 'ring-2 ring-primary bg-primary/5'
                              : ''
                          }`}
                        >
                          <div className="mb-4">
                            <h4 className="font-bold text-foreground">{vendor.name}</h4>
                            <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                              <Wrench className="w-3 h-3" />
                              <span>{vendor.type?.replace(/_/g, ' ')}</span>
                            </div>
                            {vendor.location && (
                              <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                                <MapPin className="w-3 h-3" />
                                <span>{vendor.location}</span>
                              </div>
                            )}

                            {/* Capacity Bar */}
                            <div className="mt-3">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs font-medium">Capacity</span>
                                <span className="text-xs text-muted-foreground">
                                  {availability.assigned}/{availability.capacity}
                                </span>
                              </div>
                              <div className="w-full bg-slate-200 rounded-full h-2">
                                <div
                                  className={`h-2 rounded-full transition-all ${
                                    capacityPercent > 80
                                      ? 'bg-red-600'
                                      : capacityPercent > 50
                                      ? 'bg-orange-600'
                                      : 'bg-green-600'
                                  }`}
                                  style={{ width: `${Math.min(capacityPercent, 100)}%` }}
                                ></div>
                              </div>
                            </div>

                            {/* Rating */}
                            {vendor.rating && (
                              <div className="mt-2">
                                <Badge variant="outline" className="text-xs">
                                  ⭐ {vendor.rating.toFixed(1)}
                                </Badge>
                              </div>
                            )}
                          </div>

                          {/* Drop Zone */}
                          <div
                            className={`min-h-[150px] p-2 rounded-lg border-2 border-dashed transition-colors ${
                              snapshot.isDraggingOver
                                ? 'border-primary bg-primary/10'
                                : 'border-slate-300'
                            }`}
                          >
                            {tasks
                              .filter(t => t.assigned_to_vendor === vendor.id)
                              .map((task, idx) => (
                                <div
                                  key={task.id}
                                  className={`p-2 rounded border text-xs mb-2 ${getTaskColor(task.priority)}`}
                                >
                                  <p className="font-medium truncate">{task.title}</p>
                                  {task.scheduled_date && (
                                    <p className="text-xs opacity-75 mt-1">
                                      {new Date(task.scheduled_date).toLocaleDateString()}
                                    </p>
                                  )}
                                </div>
                              ))}
                            {provided.placeholder}
                          </div>
                        </Card>
                      )}
                    </Droppable>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </DragDropContext>
  );
}