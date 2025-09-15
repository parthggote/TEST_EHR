"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, Plus, User, Phone, Edit, Trash2, ChevronLeft, ChevronRight } from "lucide-react"

// Mock appointment data
const appointments = [
  {
    id: "A001",
    patient: "Sarah Johnson",
    patientId: "P001",
    provider: "Dr. Smith",
    date: "2024-01-15",
    time: "09:00",
    duration: 30,
    type: "Checkup",
    status: "Confirmed",
    phone: "(555) 123-4567",
    notes: "Annual physical examination",
  },
  {
    id: "A002",
    patient: "Michael Chen",
    patientId: "P002",
    provider: "Dr. Johnson",
    date: "2024-01-15",
    time: "10:30",
    duration: 45,
    type: "Follow-up",
    status: "Confirmed",
    phone: "(555) 987-6543",
    notes: "Cholesterol follow-up",
  },
  {
    id: "A003",
    patient: "Emma Davis",
    patientId: "P003",
    provider: "Dr. Smith",
    date: "2024-01-15",
    time: "14:00",
    duration: 30,
    type: "Consultation",
    status: "Pending",
    phone: "(555) 456-7890",
    notes: "New patient consultation",
  },
  {
    id: "A004",
    patient: "James Wilson",
    patientId: "P004",
    provider: "Dr. Johnson",
    date: "2024-01-16",
    time: "15:30",
    duration: 60,
    type: "Lab Review",
    status: "Confirmed",
    phone: "(555) 321-0987",
    notes: "Review recent lab results",
  },
]

const timeSlots = [
  "08:00",
  "08:30",
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "12:00",
  "12:30",
  "13:00",
  "13:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
  "17:00",
  "17:30",
]

export default function AppointmentsPage() {
  const [selectedDate, setSelectedDate] = useState("2024-01-15")
  const [viewMode, setViewMode] = useState<"calendar" | "list">("calendar")
  const [isBookingOpen, setIsBookingOpen] = useState(false)

  const todaysAppointments = appointments.filter((apt) => apt.date === selectedDate)

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Confirmed":
        return "bg-green-500"
      case "Pending":
        return "bg-yellow-500"
      case "Cancelled":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Appointments</h1>
            <p className="text-muted-foreground">Manage patient appointments and scheduling</p>
          </div>
          <div className="flex gap-2">
            <Dialog open={isBookingOpen} onOpenChange={setIsBookingOpen}>
              <DialogTrigger asChild>
                <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Book Appointment
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Book New Appointment</DialogTitle>
                  <DialogDescription>Schedule a new appointment for a patient</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="patient">Patient</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select patient" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="P001">Sarah Johnson</SelectItem>
                        <SelectItem value="P002">Michael Chen</SelectItem>
                        <SelectItem value="P003">Emma Davis</SelectItem>
                        <SelectItem value="P004">James Wilson</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="provider">Provider</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select provider" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="dr-smith">Dr. Smith</SelectItem>
                        <SelectItem value="dr-johnson">Dr. Johnson</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="date">Date</Label>
                      <Input type="date" defaultValue="2024-01-15" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="time">Time</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select time" />
                        </SelectTrigger>
                        <SelectContent>
                          {timeSlots.map((time) => (
                            <SelectItem key={time} value={time}>
                              {time}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="type">Appointment Type</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="checkup">Checkup</SelectItem>
                        <SelectItem value="follow-up">Follow-up</SelectItem>
                        <SelectItem value="consultation">Consultation</SelectItem>
                        <SelectItem value="lab-review">Lab Review</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="duration">Duration (minutes)</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select duration" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15">15 minutes</SelectItem>
                        <SelectItem value="30">30 minutes</SelectItem>
                        <SelectItem value="45">45 minutes</SelectItem>
                        <SelectItem value="60">60 minutes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex justify-end gap-2 pt-4">
                    <Button variant="outline" onClick={() => setIsBookingOpen(false)}>
                      Cancel
                    </Button>
                    <Button className="bg-purple-600 hover:bg-purple-700 text-white">Book Appointment</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* View Toggle */}
        <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as "calendar" | "list")}>
          <TabsList>
            <TabsTrigger value="calendar">Calendar View</TabsTrigger>
            <TabsTrigger value="list">List View</TabsTrigger>
          </TabsList>

          <TabsContent value="calendar" className="space-y-6">
            {/* Date Navigation */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <Button variant="outline" size="sm">
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">January 15, 2024</span>
                  </div>
                  <Button variant="outline" size="sm">
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Daily Schedule */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Time Slots */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Daily Schedule</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {timeSlots.map((time) => {
                        const appointment = todaysAppointments.find((apt) => apt.time === time)
                        return (
                          <div
                            key={time}
                            className="flex items-center min-h-[60px] border-b border-border last:border-b-0"
                          >
                            <div className="w-16 text-sm text-muted-foreground font-mono">{time}</div>
                            <div className="flex-1 ml-4">
                              {appointment ? (
                                <div className="bg-purple-600/10 border border-purple-600/20 rounded-lg p-3">
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <p className="font-medium text-foreground">{appointment.patient}</p>
                                      <p className="text-sm text-muted-foreground">
                                        {appointment.type} • {appointment.duration} min • {appointment.provider}
                                      </p>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <Badge
                                        variant="outline"
                                        className={`${getStatusColor(appointment.status)} text-white border-0`}
                                      >
                                        {appointment.status}
                                      </Badge>
                                      <Button variant="ghost" size="sm">
                                        <Edit className="w-3 h-3" />
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <div className="text-sm text-muted-foreground italic">Available</div>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Appointment Details */}
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle>Today's Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Total Appointments</span>
                      <span className="font-medium">{todaysAppointments.length}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Confirmed</span>
                      <span className="font-medium text-green-600">
                        {todaysAppointments.filter((apt) => apt.status === "Confirmed").length}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Pending</span>
                      <span className="font-medium text-yellow-600">
                        {todaysAppointments.filter((apt) => apt.status === "Pending").length}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button variant="outline" className="w-full justify-start bg-transparent">
                      <Phone className="w-4 h-4 mr-2" />
                      Call Next Patient
                    </Button>
                    <Button variant="outline" className="w-full justify-start bg-transparent">
                      <User className="w-4 h-4 mr-2" />
                      Check-in Patient
                    </Button>
                    <Button variant="outline" className="w-full justify-start bg-transparent">
                      <Clock className="w-4 h-4 mr-2" />
                      Reschedule
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="list" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>All Appointments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {appointments.map((appointment) => (
                    <div key={appointment.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className={`w-3 h-3 rounded-full ${getStatusColor(appointment.status)}`} />
                        <div>
                          <p className="font-medium text-foreground">{appointment.patient}</p>
                          <p className="text-sm text-muted-foreground">
                            {appointment.date} at {appointment.time} • {appointment.type} • {appointment.provider}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">{appointment.status}</Badge>
                        <Button variant="ghost" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
