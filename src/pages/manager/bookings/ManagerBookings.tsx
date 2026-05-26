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

const emptyBookingForm: Omit<HallEvent, "id" | "balance" | "createdAt"> = {
  title: "",
  hall: "",
  date: "",
  startTime: "12:00",
  endTime: "15:00",
  clientName: "",
  clientPhone: "",
  guestCount: 1,
  status: "pending",
  depositPaid: 0,
  totalAmount: 0,
  notes: "",
};

export default function ManagerBookings() {
  const { data: events = [], isLoading } = useEvents();
  const createEvent = useCreateEvent();
  const updateEvent = useUpdateEvent();
  const deleteEvent = useDeleteEvent();

  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<HallEvent | null>(null);
  const [formState, setFormState] = useState(emptyBookingForm);

  const filteredEvents = useMemo(
    () =>
      events.filter((event) =>
        [event.title, event.hall, event.clientName, event.clientPhone]
          .join(" ")
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      ),
    [events, searchTerm]
  );

  const openNewBooking = () => {
    setEditingEvent(null);
    setFormState(emptyBookingForm);
    setShowForm(true);
  };

  const openEditBooking = (event: HallEvent) => {
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

  const saveBooking = () => {
    if (!formState.clientName || !formState.clientPhone || !formState.date) {
      alert("Please fill in the client name, phone, and date.");
      return;
    }

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

  const deleteBooking = (id: string) => {
    if (confirm("Are you sure you want to delete this booking?")) {
      deleteEvent.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 p-4 md:p-6">
        <Skeleton className="h-8 w-48" />
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
      </div>
    );
  }

  const confirmedBookings = events.filter((e) => e.status === "confirmed").length;
  const totalRevenue = events.reduce((sum, e) => sum + e.totalAmount, 0);
  const depositsCollected = events.reduce((sum, e) => sum + e.depositPaid, 0);

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold md:text-3xl">Event Bookings</h1>
          <p className="text-sm text-muted-foreground md:text-base">Manage all hall bookings and events</p>
        </div>
        <Button className="w-full gap-2 md:w-auto" onClick={openNewBooking}>
          <Plus className="h-4 w-4" />
          New Booking
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground md:text-sm">Total Bookings</p>
            <p className="text-xl font-bold md:text-2xl">{events.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground md:text-sm">Confirmed</p>
            <p className="text-xl font-bold text-success md:text-2xl">{confirmedBookings}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground md:text-sm">Total Revenue</p>
            <p className="text-lg font-bold md:text-xl">₦{(totalRevenue / 1000).toFixed(0)}k</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground md:text-sm">Deposits Collected</p>
            <p className="text-lg font-bold md:text-xl">₦{(depositsCollected / 1000).toFixed(0)}k</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by title, hall, client, or phone..."
          className="pl-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Bookings List */}
      <div className="space-y-2">
        {filteredEvents.length === 0 ? (
          <Card className="p-6 text-center">
            <p className="text-muted-foreground">No bookings found</p>
          </Card>
        ) : (
          filteredEvents.map((event) => (
            <Card key={event.id} className="p-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold">{event.title}</h3>
                    <Badge className={statusConfig[event.status]}>{event.status}</Badge>
                  </div>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {event.date} · {event.startTime} - {event.endTime}
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      {event.clientName} ({event.guestCount} guests) · {event.clientPhone}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-2 items-start md:items-end">
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Total / Deposit</p>
                    <p className="font-semibold">₦{event.totalAmount.toLocaleString()} / ₦{event.depositPaid.toLocaleString()}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1"
                      onClick={() => openEditBooking(event)}
                    >
                      <Edit3 className="h-3 w-3" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      className="gap-1"
                      onClick={() => deleteBooking(event.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>{editingEvent ? "Edit Booking" : "New Booking"}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium">Event Title</label>
                  <Input
                    value={formState.title}
                    onChange={(e) => setFormState({ ...formState, title: e.target.value })}
                    placeholder="e.g., Wedding Reception"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Hall</label>
                  <Input
                    value={formState.hall}
                    onChange={(e) => setFormState({ ...formState, hall: e.target.value })}
                    placeholder="e.g., Grand Hall"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div>
                  <label className="text-sm font-medium">Date</label>
                  <Input
                    type="date"
                    value={formState.date}
                    onChange={(e) => setFormState({ ...formState, date: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Start Time</label>
                  <Input
                    type="time"
                    value={formState.startTime}
                    onChange={(e) => setFormState({ ...formState, startTime: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">End Time</label>
                  <Input
                    type="time"
                    value={formState.endTime}
                    onChange={(e) => setFormState({ ...formState, endTime: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium">Client Name</label>
                  <Input
                    value={formState.clientName}
                    onChange={(e) => setFormState({ ...formState, clientName: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Client Phone</label>
                  <Input
                    value={formState.clientPhone}
                    onChange={(e) => setFormState({ ...formState, clientPhone: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div>
                  <label className="text-sm font-medium">Guest Count</label>
                  <Input
                    type="number"
                    value={formState.guestCount}
                    onChange={(e) => setFormState({ ...formState, guestCount: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Total Amount</label>
                  <Input
                    type="number"
                    value={formState.totalAmount}
                    onChange={(e) => setFormState({ ...formState, totalAmount: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Deposit Paid</label>
                  <Input
                    type="number"
                    value={formState.depositPaid}
                    onChange={(e) => setFormState({ ...formState, depositPaid: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="status" className="text-sm font-medium">Status</label>
                <select
                  id="status"
                  value={formState.status}
                  onChange={(e) => setFormState({ ...formState, status: e.target.value as EventStatus })}
                  className="w-full rounded-md border border-input bg-background px-3 py-2"
                  aria-label="Booking status"
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium">Notes</label>
                <textarea
                  value={formState.notes}
                  onChange={(e) => setFormState({ ...formState, notes: e.target.value })}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  rows={3}
                  placeholder="Additional notes..."
                />
              </div>

              <div className="flex gap-2 justify-end pt-4">
                <Button variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
                <Button onClick={saveBooking}>
                  {editingEvent ? "Update" : "Create"} Booking
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
