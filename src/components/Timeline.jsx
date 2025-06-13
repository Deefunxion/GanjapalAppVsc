import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Calendar,
  Clock,
  Plus,
  CheckCircle,
  AlertCircle,
  Scissors,
  Leaf,
  Droplets,
  Sun
} from 'lucide-react';
import AppStorage from '../utils/storage';

const QuickActions = ({ onAddEvent }) => {
  const quickActionTypes = [
    { type: 'watering', label: 'Water Plants', icon: Droplets, color: 'bg-blue-500' },
    { type: 'training', label: 'Training Session', icon: Scissors, color: 'bg-green-500' },
    { type: 'feeding', label: 'Nutrient Feed', icon: Leaf, color: 'bg-yellow-500' },
    { type: 'inspection', label: 'Plant Check', icon: Sun, color: 'bg-orange-500' }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {quickActionTypes.map(action => {
        const Icon = action.icon;
        return (
          <Button
            key={action.type}
            variant="outline"
            className="h-20 flex flex-col gap-2"
            onClick={() => onAddEvent({
              type: action.type,
              title: action.label,
              date: new Date(),
              plantId: 'all'
            })}
          >
            <div className={`w-8 h-8 rounded-full ${action.color} flex items-center justify-center`}>
              <Icon className="w-4 h-4 text-white" />
            </div>
            <span className="text-xs">{action.label}</span>
          </Button>
        );
      })}
    </div>
  );
};

const EventForm = ({ isOpen, onClose, onSubmit, initialEvent = null }) => {
  const [event, setEvent] = useState({
    title: '',
    description: '',
    type: 'general',
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().split(' ')[0].substring(0, 5),
    plantId: 'all',
    priority: 'medium'
  });

  useEffect(() => {
    if (initialEvent) {
      setEvent({
        ...initialEvent,
        date: new Date(initialEvent.date).toISOString().split('T')[0],
        time: new Date(initialEvent.date).toTimeString().split(' ')[0].substring(0, 5)
      });
    }
  }, [initialEvent]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const eventDate = new Date(`${event.date}T${event.time}`);
    onSubmit({
      ...event,
      date: eventDate,
      id: initialEvent?.id || Date.now().toString()
    });
    onClose();
    setEvent({
      title: '',
      description: '',
      type: 'general',
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().split(' ')[0].substring(0, 5),
      plantId: 'all',
      priority: 'medium'
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{initialEvent ? 'Edit Event' : 'Add New Event'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <Input
              value={event.title}
              onChange={(e) => setEvent(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Event title"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Type</label>
            <select
              value={event.type}
              onChange={(e) => setEvent(prev => ({ ...prev, type: e.target.value }))}
              className="w-full p-2 border rounded-md"
            >
              <option value="general">General</option>
              <option value="watering">Watering</option>
              <option value="training">Training</option>
              <option value="feeding">Feeding</option>
              <option value="inspection">Inspection</option>
              <option value="repotting">Repotting</option>
              <option value="harvest">Harvest</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Date</label>
              <Input
                type="date"
                value={event.date}
                onChange={(e) => setEvent(prev => ({ ...prev, date: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Time</label>
              <Input
                type="time"
                value={event.time}
                onChange={(e) => setEvent(prev => ({ ...prev, time: e.target.value }))}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Priority</label>
            <select
              value={event.priority}
              onChange={(e) => setEvent(prev => ({ ...prev, priority: e.target.value }))}
              className="w-full p-2 border rounded-md"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <Textarea
              value={event.description}
              onChange={(e) => setEvent(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Event description (optional)"
              rows={3}
            />
          </div>

          <div className="flex gap-2">
            <Button type="submit" className="flex-1">
              {initialEvent ? 'Update Event' : 'Add Event'}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const EventItem = ({ event, onEdit, onComplete, onDelete }) => {
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'border-l-red-500 bg-red-50';
      case 'high': return 'border-l-orange-500 bg-orange-50';
      case 'medium': return 'border-l-yellow-500 bg-yellow-50';
      case 'low': return 'border-l-green-500 bg-green-50';
      default: return 'border-l-gray-500 bg-gray-50';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'watering': return <Droplets className="w-4 h-4 text-blue-500" />;
      case 'training': return <Scissors className="w-4 h-4 text-green-500" />;
      case 'feeding': return <Leaf className="w-4 h-4 text-yellow-500" />;
      case 'inspection': return <Sun className="w-4 h-4 text-orange-500" />;
      default: return <Calendar className="w-4 h-4 text-gray-500" />;
    }
  };

  const isOverdue = new Date(event.date) < new Date() && !event.completed;
  const isToday = new Date(event.date).toDateString() === new Date().toDateString();

  return (
    <Card className={`border-l-4 ${getPriorityColor(event.priority)} ${event.completed ? 'opacity-60' : ''}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <div className="mt-1">
              {getTypeIcon(event.type)}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className={`font-medium ${event.completed ? 'line-through' : ''}`}>
                  {event.title}
                </h3>
                {isToday && !event.completed && (
                  <Badge variant="secondary" className="text-xs">Today</Badge>
                )}
                {isOverdue && (
                  <Badge variant="destructive" className="text-xs">Overdue</Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                {new Date(event.date).toLocaleDateString()} at {new Date(event.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
              {event.description && (
                <p className="text-sm text-gray-600">{event.description}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1 ml-2">
            {!event.completed && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onComplete(event.id)}
                className="text-green-600 hover:text-green-700"
              >
                <CheckCircle className="w-4 h-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(event)}
              className="text-blue-600 hover:text-blue-700"
            >
              Edit
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(event.id)}
              className="text-red-600 hover:text-red-700"
            >
              Delete
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const Timeline = () => {
  const [events, setEvents] = useState([]);
  const [showEventForm, setShowEventForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [filter, setFilter] = useState('all'); // all, pending, completed, today

  useEffect(() => {
    const storedEvents = AppStorage.getTimelineEvents();
    setEvents(storedEvents);
  }, []);

  const saveEvents = (newEvents) => {
    setEvents(newEvents);
    AppStorage.saveTimelineEvents(newEvents);
  };

  const handleAddEvent = (eventData) => {
    const newEvent = {
      ...eventData,
      id: eventData.id || Date.now().toString(),
      completed: false,
      createdAt: new Date().toISOString()
    };
    
    const updatedEvents = [...events, newEvent];
    saveEvents(updatedEvents);
  };

  const handleEditEvent = (eventData) => {
    const updatedEvents = events.map(event =>
      event.id === eventData.id ? { ...eventData, updatedAt: new Date().toISOString() } : event
    );
    saveEvents(updatedEvents);
    setEditingEvent(null);
  };

  const handleCompleteEvent = (eventId) => {
    const updatedEvents = events.map(event =>
      event.id === eventId ? { ...event, completed: true, completedAt: new Date().toISOString() } : event
    );
    saveEvents(updatedEvents);
  };

  const handleDeleteEvent = (eventId) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      const updatedEvents = events.filter(event => event.id !== eventId);
      saveEvents(updatedEvents);
    }
  };

  const filteredEvents = events.filter(event => {
    switch (filter) {
      case 'pending':
        return !event.completed;
      case 'completed':
        return event.completed;
      case 'today':
        return new Date(event.date).toDateString() === new Date().toDateString();
      default:
        return true;
    }
  }).sort((a, b) => new Date(a.date) - new Date(b.date));

  const upcomingEvents = events.filter(event => 
    !event.completed && new Date(event.date) >= new Date()
  ).slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Calendar className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-bold">Timeline & Events</h2>
        </div>
        <Button onClick={() => setShowEventForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Event
        </Button>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <QuickActions onAddEvent={handleAddEvent} />
        </CardContent>
      </Card>

      {/* Upcoming Events Summary */}
      {upcomingEvents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-orange-500" />
              Upcoming Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {upcomingEvents.map(event => (
                <div key={event.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="font-medium">{event.title}</span>
                  <span className="text-sm text-muted-foreground">
                    {new Date(event.date).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {[
          { key: 'all', label: 'All Events' },
          { key: 'pending', label: 'Pending' },
          { key: 'today', label: 'Today' },
          { key: 'completed', label: 'Completed' }
        ].map(tab => (
          <Button
            key={tab.key}
            variant={filter === tab.key ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter(tab.key)}
          >
            {tab.label}
          </Button>
        ))}
      </div>

      {/* Events List */}
      <div className="space-y-3">
        {filteredEvents.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-600 mb-2">No events found</h3>
              <p className="text-gray-500 mb-4">
                {filter === 'all' 
                  ? 'Start by adding your first event or use quick actions above.'
                  : `No ${filter} events at the moment.`
                }
              </p>
              <Button onClick={() => setShowEventForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Event
              </Button>
            </CardContent>
          </Card>
        ) : (
          filteredEvents.map(event => (
            <EventItem
              key={event.id}
              event={event}
              onEdit={setEditingEvent}
              onComplete={handleCompleteEvent}
              onDelete={handleDeleteEvent}
            />
          ))
        )}
      </div>

      {/* Event Form Dialog */}
      <EventForm
        isOpen={showEventForm || !!editingEvent}
        onClose={() => {
          setShowEventForm(false);
          setEditingEvent(null);
        }}
        onSubmit={editingEvent ? handleEditEvent : handleAddEvent}
        initialEvent={editingEvent}
      />
    </div>
  );
};

export default Timeline;

