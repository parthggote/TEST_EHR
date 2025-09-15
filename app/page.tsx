'use client';

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Users, Calendar, Activity, CreditCard, FileText, Settings } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background dark">
      {/* Navigation */}
      <nav className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-xl font-bold text-foreground">Epic FHIR Dashboard</h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                className="text-muted-foreground hover:text-foreground"
                onClick={() => window.location.href = '/status'}
              >
                Status
              </Button>
              <Button 
                variant="ghost" 
                className="text-muted-foreground hover:text-foreground"
                onClick={() => window.location.href = '/debug'}
              >
                Debug
              </Button>
              <Button 
                variant="ghost" 
                className="text-muted-foreground hover:text-foreground"
                onClick={() => window.location.href = '/api/auth/login'}
              >
                Log In
              </Button>
              <Button 
                className="bg-purple-600 hover:bg-purple-700 text-white"
                onClick={() => window.location.href = '/api/auth/login'}
              >
                Login with Epic
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center">
            {/* Customer Count */}
            <div className="flex justify-center items-center mb-8">
              <div className="flex -space-x-2">
                <div className="w-8 h-8 rounded-full bg-purple-500 border-2 border-background" />
                <div className="w-8 h-8 rounded-full bg-blue-500 border-2 border-background" />
                <div className="w-8 h-8 rounded-full bg-green-500 border-2 border-background" />
              </div>
              <span className="ml-3 text-sm text-gray-300">1,254+ healthcare providers</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 text-balance">
              Streamlined Healthcare Data for <span className="text-purple-400">Better Patient Care</span>
            </h1>

            {/* Description */}
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto text-pretty">
              Epic FHIR Dashboard is a comprehensive healthcare management system. Seamlessly integrate with Epic APIs
              to manage patients, appointments, and clinical data with HIPAA-compliant security.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto bg-gray-800 border-gray-600 text-gray-200 hover:bg-gray-700 hover:text-white"
                onClick={() => window.location.href = '/demo'}
              >
                View Live Demo
              </Button>
              <Button 
                size="lg" 
                className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 text-white"
                onClick={() => window.location.href = '/api/auth/login'}
              >
                Connect to Epic MyChart
              </Button>
            </div>
          </div>
        </div>

        {/* Features Preview */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <p className="text-sm text-gray-400 mb-4">Join 4,000+ healthcare organizations already growing</p>
            <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
              <div className="text-lg font-semibold">Epic Systems</div>
              <div className="text-lg font-semibold">Cerner</div>
              <div className="text-lg font-semibold">Allscripts</div>
              <div className="text-lg font-semibold">athenahealth</div>
              <div className="text-lg font-semibold">NextGen</div>
            </div>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-16">
            <Card className="bg-card border-border">
              <CardContent className="p-6">
                <Users className="w-8 h-8 text-purple-500 mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">Patient Management</h3>
                <p className="text-gray-300">
                  Comprehensive patient records with demographics, allergies, medications, and conditions.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardContent className="p-6">
                <Calendar className="w-8 h-8 text-purple-500 mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">Appointment Scheduling</h3>
                <p className="text-gray-300">
                  Intuitive calendar interface for booking, rescheduling, and managing appointments.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardContent className="p-6">
                <Activity className="w-8 h-8 text-purple-500 mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">Clinical Data</h3>
                <p className="text-gray-300">
                  Track vitals, lab results, clinical notes, and immunizations in one place.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardContent className="p-6">
                <CreditCard className="w-8 h-8 text-purple-500 mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">Billing Management</h3>
                <p className="text-gray-300">
                  Handle insurance claims, patient balances, and transaction tracking efficiently.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardContent className="p-6">
                <FileText className="w-8 h-8 text-purple-500 mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">Reports & Analytics</h3>
                <p className="text-gray-300">
                  Generate insights with appointment trends, billing analytics, and custom reports.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardContent className="p-6">
                <Settings className="w-8 h-8 text-purple-500 mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">HIPAA Compliance</h3>
                <p className="text-gray-300">
                  Built-in security features, audit logs, and compliance tools for healthcare standards.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Bottom CTA */}
          <div className="text-center mt-16">
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                size="lg" 
                className="bg-purple-600 hover:bg-purple-700 text-white"
                onClick={() => window.location.href = '/api/auth/login'}
              >
                Get started
              </Button>
              <Button variant="outline" size="lg">
                See more
              </Button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="border-t border-border bg-card mt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="text-sm text-gray-400">
                © 2024 Epic FHIR Dashboard. HIPAA Compliant Healthcare Solution.
              </div>
              <div className="flex space-x-6 mt-4 md:mt-0">
                <Link href="/support" className="text-sm text-gray-400 hover:text-gray-200">
                  Support
                </Link>
                <Link href="/privacy" className="text-sm text-gray-400 hover:text-gray-200">
                  Privacy Policy
                </Link>
                <Link href="/compliance" className="text-sm text-gray-400 hover:text-gray-200">
                  HIPAA Compliance
                </Link>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  )
}
