import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Calendar, Users, Edit3, Trash2 } from "lucide-react";
import {
  useCreateEvent,
  useDeleteEvent,
  useEvents,
  useUpdateEvent,
} from "@/api/hooks";
import { Skeleton } from "@/components/ui/skeleton";
import type { EventStatus, HallEvent } from "@/types/analyticsTypes";

const statusConfig: Record<EventStatus, string> = {
  confirmed: "bg-success/10 text-success",
  pending: "bg-warning/10 text-warning",
  completed: "bg-primary/10 text-primary",
  cancelled: "bg-destructive/10 text-destructive",
};

const emptyEventForm = {
  title: "",
  hall: "",
  date: "",
  startTime: "",
  endTime: "",
  clientName: "",
  clientPhone: "",
  guestCount: 1,
  status: "pending" as EventStatus,
  depositPaid: 0,
  totalAmount: 0,
  notes: "",
};

export default function AdminEvents() {
  const { data: events = [], isLoading } = useEvents();
  const createEvent = useCreateEvent();
  const updateEvent = useUpdateEvent();
  const deleteEvent = useDeleteEvent();
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<HallEvent | null>(null);
  const [formState, setFormState] = useState(emptyEventForm);

  const filtered = useMemo(
    () =>
      events.filter(
        (event) =>
          event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          event.clientName.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [events, searchTerm]
  );

  const totalRevenue = useMemo(
    () => events.reduce((sum, event) => sum + event.totalAmount, 0),
    [events]
  );

  const openNewForm = () => {
    setEditingEvent(null);
    setFormState(emptyEventForm);
    setShowForm(true);
  };

  const openEditForm = (event: HallEvent) => {
    setEditingEvent(event);
    setFormState({
      title: event.title,
      hall: event.hall,
      date: event.date,
      startTime: event.startTime,
      endTime: event.endTime,
      clientName: event.clientName,
      clientPhone: event.clientPhone,
      guestCount: event.guestCount,
      status: event.status,
      depositPaid: event.depositPaid,
      totalAmount: event.totalAmount,
      notes: event.notes,
    });
    setShowForm(true);
  };

  const handleFormChange = (field: keyof typeof emptyEventForm, value: string | number) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveEvent = () => {
    const payload = {
      ...formState,
      guestCount: Number(formState.guestCount),
      depositPaid: Number(formState.depositPaid),
      totalAmount: Number(formState.totalAmount),
      status: formState.status,
    };

    if (editingEvent) {
      updateEvent.mutate({ id: editingEvent.id, ...payload });
    } else {
      createEvent.mutate(payload);
    }

    setShowForm(false);
  };

  const handleCancelEvent = (event: HallEvent) => {
    updateEvent.mutate({ id: event.id, status: "cancelled" });
  };

  const handleRemoveEvent = (event: HallEvent) => {
    if (window.confirm("Delete this event?")) {
      deleteEvent.mutate(event.id);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 p-4 md:p-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-16" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold md:text-3xl">Hall Events</h1>
          <p className="text-sm text-muted-foreground md:text-base">Manage event bookings and coordination</p>
        </div>
        <Button className="w-full gap-2 md:w-auto" onClick={openNewForm}>
          <Plus className="h-4 w-4" />
          New Event
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingEvent ? "Edit Event" : "Create New Event"}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <Input
              placeholder="Event title"
              value={formState.title}
              onChange={(e) => handleFormChange("title", e.target.value)}
            />
            <Input
              placeholder="Hall name"
              value={formState.hall}
              onChange={(e) => handleFormChange("hall", e.target.value)}
            />
            <Input
              type="date"
              value={formState.date}
              onChange={(e) => handleFormChange("date", e.target.value)}
            />
            <Input
              type="time"
              value={formState.startTime}
              onChange={(e) => handleFormChange("startTime", e.target.value)}
            />
            <Input
              type="time"
              value={formState.endTime}
              onChange={(e) => handleFormChange("endTime", e.target.value)}
            />
            <Input
              placeholder="Client name"
              value={formState.clientName}
              onChange={(e) => handleFormChange("clientName", e.target.value)}
            />
            <Input
              placeholder="Client phone"
              value={formState.clientPhone}
              onChange={(e) => handleFormChange("clientPhone", e.target.value)}
            />
            <Input
              type="number"
              placeholder="Guest count"
              value={formState.guestCount}
              onChange={(e) => handleFormChange("guestCount", Number(e.target.value))}
            />
            <Input
              type="number"
              placeholder="Deposit paid"
              value={formState.depositPaid}
              onChange={(e) => handleFormChange("depositPaid", Number(e.target.value))}
            />
            <Input
              type="number"
              placeholder="Total amount"
              value={formState.totalAmount}
              onChange={(e) => handleFormChange("totalAmount", Number(e.target.value))}
            />
            <Input
              placeholder="Notes"
              value={formState.notes}
              onChange={(e) => handleFormChange("notes", e.target.value)}
            />
          </CardContent>
          <CardContent className="flex flex-wrap gap-2">
            <Button onClick={handleSaveEvent} disabled={!formState.title || !formState.date}>
              Save Event
            </Button>
            <Button variant="outline" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4">
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground md:text-sm">Total Events</p>
            <p className="text-xl font-bold md:text-2xl">{events.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground md:text-sm">Total Guests</p>
            <p className="text-xl font-bold md:text-2xl">{events.reduce((s, e) => s + e.guestCount, 0)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground md:text-sm">Total Revenue</p>
            <p className="text-lg font-bold md:text-xl">₦{(totalRevenue / 1000000).toFixed(1)}m</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search events..."
          className="pl-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Events Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((event) => (
          <Card key={event.id}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <CardTitle className="text-lg">{event.title}</CardTitle>
                </div>
                <Badge className={statusConfig[event.status]}>{event.status}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-primary" />
                <span>{new Date(event.date).toLocaleDateString()} at {event.startTime}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Users className="h-4 w-4 text-primary" />
                <span>{event.guestCount} guests</span>
              </div>
              <div className="text-sm">
                <span className="text-muted-foreground">Client: </span>
                <span className="font-medium">{event.clientName}</span>
              </div>
              <div className="text-sm font-medium">₦{event.totalAmount.toLocaleString()}</div>
              <div className="flex flex-wrap gap-2 pt-2">
                <Button size="sm" variant="outline" onClick={() => openEditForm(event)}>
                  <Edit3 className="mr-1 h-3.5 w-3.5" />
                  Edit
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleCancelEvent(event)}>
                  Cancel
                </Button>
                <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleRemoveEvent(event)}>
                  <Trash2 className="mr-1 h-3.5 w-3.5" />
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}