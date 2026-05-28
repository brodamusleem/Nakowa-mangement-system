import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Calendar, Users, Edit3, Trash2 } from "lucide-react"
import {
  useCreateEvent,
  useDeleteEvent,
  useEvents,
  useUpdateEvent,
} from "@/api/hooks"
import { Skeleton } from "@/components/ui/skeleton"
import type { EventStatus, HallEvent } from "@/types/analyticsTypes"

const statusConfig: Record<EventStatus, string> = {
  confirmed: "bg-success/10 text-success",
  pending: "bg-warning/10 text-warning",
  completed: "bg-primary/10 text-primary",
  cancelled: "bg-destructive/10 text-destructive",
}

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
}

export default function AdminBookings() {
  const { data: events = [], isLoading } = useEvents()
  const createEvent = useCreateEvent()
  const updateEvent = useUpdateEvent()
  const deleteEvent = useDeleteEvent()

  const [searchTerm, setSearchTerm] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [editingEvent, setEditingEvent] = useState<HallEvent | null>(null)
  const [formState, setFormState] = useState(emptyBookingForm)

  const filteredEvents = useMemo(
    () =>
      events.filter((event) =>
        [event.title, event.hall, event.clientName, event.clientPhone]
          .join(" ")
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      ),
    [events, searchTerm]
  )

  const openNewBooking = () => {
    setEditingEvent(null)
    setFormState(emptyBookingForm)
    setShowForm(true)
  }

  const openEditBooking = (event: HallEvent) => {
    setEditingEvent(event)
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
    })
    setShowForm(true)
  }

  const saveBooking = () => {
    if (!formState.clientName || !formState.clientPhone || !formState.date) {
      alert("Please fill in the client name, phone, and date.")
      return
    }

    const payload = {
      ...formState,
      guestCount: Number(formState.guestCount),
      depositPaid: Number(formState.depositPaid),
      totalAmount: Number(formState.totalAmount),
      status: formState.status,
    }

    if (editingEvent) {
      updateEvent.mutate({ id: editingEvent.id, ...payload })
    } else {
      createEvent.mutate(payload)
    }

    setShowForm(false)
  }

  const handleCancelBooking = (event: HallEvent) => {
    updateEvent.mutate({ id: event.id, status: "cancelled" })
  }

  const handleDeleteBooking = (event: HallEvent) => {
    if (window.confirm("Delete this booking?")) {
      deleteEvent.mutate(event.id)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6 p-4 md:p-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, idx) => (
            <Skeleton key={idx} className="h-48" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold md:text-3xl">Bookings & Reservations</h1>
          <p className="text-sm text-muted-foreground md:text-base">Manage event bookings and reservations</p>
        </div>
        <Button className="w-full gap-2 md:w-auto" onClick={openNewBooking}>
          <Plus className="h-4 w-4" />
          New Booking
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <CardTitle>{editingEvent ? "Edit Booking" : "Create Booking"}</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setShowForm(false)}>
                Close
              </Button>
            </div>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <Input
              placeholder="Booking title"
              value={formState.title}
              onChange={(e) => setFormState({ ...formState, title: e.target.value })}
            />
            <Input
              placeholder="Hall name"
              value={formState.hall}
              onChange={(e) => setFormState({ ...formState, hall: e.target.value })}
            />
            <Input
              type="date"
              value={formState.date}
              onChange={(e) => setFormState({ ...formState, date: e.target.value })}
            />
            <Input
              type="time"
              value={formState.startTime}
              onChange={(e) => setFormState({ ...formState, startTime: e.target.value })}
            />
            <Input
              type="time"
              value={formState.endTime}
              onChange={(e) => setFormState({ ...formState, endTime: e.target.value })}
            />
            <Input
              placeholder="Client name"
              value={formState.clientName}
              onChange={(e) => setFormState({ ...formState, clientName: e.target.value })}
            />
            <Input
              placeholder="Client phone"
              value={formState.clientPhone}
              onChange={(e) => setFormState({ ...formState, clientPhone: e.target.value })}
            />
            <Input
              type="number"
              min={1}
              placeholder="Guest count"
              value={formState.guestCount}
              onChange={(e) => setFormState({ ...formState, guestCount: Number(e.target.value) })}
            />
            <Input
              type="number"
              min={0}
              placeholder="Deposit paid"
              value={formState.depositPaid}
              onChange={(e) => setFormState({ ...formState, depositPaid: Number(e.target.value) })}
            />
            <Input
              type="number"
              min={0}
              placeholder="Total amount"
              value={formState.totalAmount}
              onChange={(e) => setFormState({ ...formState, totalAmount: Number(e.target.value) })}
            />
            <Input
              placeholder="Notes"
              value={formState.notes}
              onChange={(e) => setFormState({ ...formState, notes: e.target.value })}
            />
            <Input
              placeholder="Status"
              value={formState.status}
              onChange={(e) => setFormState({ ...formState, status: e.target.value as EventStatus })}
            />
          </CardContent>
          <CardContent className="flex flex-wrap gap-2">
            <Button onClick={saveBooking} disabled={!formState.clientName || !formState.clientPhone || !formState.date}>
              Save Booking
            </Button>
            <Button variant="outline" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search bookings..."
          className="pl-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredEvents.map((event) => (
          <Card key={event.id} className="flex flex-col">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <CardTitle className="text-lg">{event.title || event.clientName}</CardTitle>
                  <p className="text-xs text-muted-foreground">{event.hall}</p>
                </div>
                <Badge className={statusConfig[event.status]}>{event.status}</Badge>
              </div>
            </CardHeader>
            <CardContent className="flex-1 space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-primary" />
                <span>
                  {new Date(event.date).toLocaleDateString()} · {event.startTime}–{event.endTime}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Users className="h-4 w-4 text-primary" />
                <span>{event.guestCount} guests</span>
              </div>
              <div className="text-sm">
                <span className="text-muted-foreground">Client:</span>
                <span className="font-medium ml-1">{event.clientName}</span>
              </div>
              <div className="text-sm text-muted-foreground">{event.clientPhone}</div>
              <div className="text-sm font-medium">₦{event.totalAmount.toLocaleString()}</div>
              <div className="flex flex-wrap gap-2 pt-2">
                <Button size="sm" variant="outline" onClick={() => openEditBooking(event)}>
                  <Edit3 className="mr-1 h-3.5 w-3.5" />
                  Edit
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleCancelBooking(event)}>
                  Cancel
                </Button>
                <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleDeleteBooking(event)}>
                  <Trash2 className="mr-1 h-3.5 w-3.5" />
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredEvents.length === 0 && (
        <Card className="border-dashed p-8 text-center">
          <p className="text-muted-foreground">No bookings found matching your search.</p>
        </Card>
      )}
    </div>
  )
}
