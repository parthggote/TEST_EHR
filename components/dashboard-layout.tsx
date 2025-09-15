"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Users,
  Calendar,
  Activity,
  CreditCard,
  FileText,
  Settings,
  Search,
  Bell,
  User,
  Menu,
  X,
  Home,
  Download,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

const patientNavigation = [
  { name: "Overview", href: "/dashboard", icon: Home },
  { name: "Patients", href: "/dashboard/patients", icon: Users },
  { name: "Appointments", href: "/dashboard/appointments", icon: Calendar },
  { name: "Clinical", href: "/dashboard/clinical", icon: Activity },
  { name: "Billing", href: "/dashboard/billing", icon: CreditCard },
]

const clinicianNavigation = [
  { name: "Clinician Home", href: "/dashboard/clinician", icon: Home },
  { name: "Patient Management", href: "/dashboard/clinician/patients", icon: Users },
  { name: "Appointments", href: "/dashboard/clinician/appointments", icon: Calendar },
  { name: "Bulk Data Export", href: "/dashboard/clinician/bulk-data", icon: Download },
]

interface DashboardLayoutProps {
  children: React.ReactNode
  userType?: "patient" | "clinician"
}

export function DashboardLayout({ children, userType = "patient" }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()
  const navigation = userType === "clinician" ? clinicianNavigation : patientNavigation
  const logoutUrl = userType === "clinician" ? "/api/auth/clinician/logout" : "/api/auth/logout"
  const portalTitle = userType === "clinician" ? "Clinician Portal" : "Patient Dashboard"

  return (
    <div className="min-h-screen bg-background dark">
      {/* Mobile sidebar */}
      <div className={cn("fixed inset-0 z-50 lg:hidden", sidebarOpen ? "block" : "hidden")}>
        <div className="fixed inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
        <div className="fixed left-0 top-0 h-full w-64 bg-card border-r border-border">
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h1 className="text-lg font-semibold text-foreground">{portalTitle}</h1>
            <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(false)}>
              <X className="w-4 h-4" />
            </Button>
          </div>
          <nav className="p-4 space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    pathname === item.href
                      ? "bg-purple-600 text-white"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent",
                  )}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon className="w-4 h-4 mr-3" />
                  {item.name}
                </Link>
              )
            })}
          </nav>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-card border-r border-border">
          <div className="flex items-center px-4 py-4 border-b border-border">
            <h1 className="text-lg font-semibold text-foreground">{portalTitle}</h1>
          </div>
          <nav className="flex-1 p-4 space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    pathname === item.href
                      ? "bg-purple-600 text-white"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent",
                  )}
                >
                  <Icon className="w-4 h-4 mr-3" />
                  {item.name}
                </Link>
              )
            })}
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top navbar */}
        <div className="sticky top-0 z-40 bg-card border-b border-border">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center">
              <Button variant="ghost" size="sm" className="lg:hidden mr-2" onClick={() => setSidebarOpen(true)}>
                <Menu className="w-4 h-4" />
              </Button>
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Search..." className="pl-10 w-full md:w-80" />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="w-4 h-4" />
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-purple-600 rounded-full" />
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                    <User className="w-4 h-4" />
                    <span className="hidden md:inline">
                      {userType === "clinician" ? "Clinician User" : "Patient User"}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Profile</DropdownMenuItem>
                  <DropdownMenuItem>Settings</DropdownMenuItem>
                  <DropdownMenuItem>Security</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => (window.location.href = logoutUrl)}>
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="p-6">{children}</main>
      </div>
    </div>
  )
}
