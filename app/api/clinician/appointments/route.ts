/**
 * API Route for searching and creating appointments.
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { EpicFHIRClient } from '@/lib/epic-client';
import CryptoJS from 'crypto-js';
import { connectToDatabase } from '@/lib/mongodb';

// Helper function to get and decrypt the access token
function getAccessToken(): string | null {
  const cookieStore = cookies();
  const encryptedToken = cookieStore.get('epic_clinician_access_token')?.value;

  if (!encryptedToken) return null;

  try {
    const encryptionKey = process.env.ENCRYPTION_KEY!;
    return CryptoJS.AES.decrypt(encryptedToken, encryptionKey).toString(CryptoJS.enc.Utf8);
  } catch (error) {
    console.error("Failed to decrypt access token:", error);
    return null;
  }
}

// Search for appointments
export async function GET(request: NextRequest) {
  const accessToken = getAccessToken();
  if (!accessToken) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get('patient');

    const epicClient = new EpicFHIRClient('clinician');

    if (!patientId) {
      // If no patient ID, fetch all appointments for the clinician's context
      const appointments = await epicClient.makeRequest(`Appointment?_count=10`, accessToken);
      return NextResponse.json(appointments);
    }

    const { db } = await connectToDatabase();
    const cachedAppointments = await db.collection('data').find({
      resourceType: 'Appointment',
      'participant.actor.reference': `Patient/${patientId}`
    }).toArray();

    if (cachedAppointments.length > 0) {
      console.log(`CACHE HIT: Found ${cachedAppointments.length} appointments for patient ${patientId} in cache.`);
      const appointmentsBundle = {
        resourceType: 'Bundle',
        type: 'searchset',
        total: cachedAppointments.length,
        entry: cachedAppointments.map(appt => ({ resource: appt })),
      };
      return NextResponse.json(appointmentsBundle);
    }

    console.log(`CACHE MISS: Appointments for patient ${patientId} not found. Fetching from API.`);
    const searchOptions = {
      date: searchParams.get('date') || undefined,
      status: searchParams.get('status') || undefined,
    };

    const appointments = await epicClient.getPatientAppointments(accessToken, patientId, searchOptions);

    if (appointments.entry && appointments.entry.length > 0) {
      const appointmentsToCache = appointments.entry.map((entry: any) => entry.resource);
      await db.collection('data').insertMany(appointmentsToCache);
      console.log(`CACHE POPULATE: Stored ${appointmentsToCache.length} appointments for patient ${patientId}.`);
    }

    return NextResponse.json(appointments);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: 'Failed to search appointments', details: errorMessage }, { status: 500 });
  }
}

// Create a new appointment
export async function POST(request: NextRequest) {
  const accessToken = getAccessToken();
  if (!accessToken) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const appointmentData = await request.json();
    if (!appointmentData || !appointmentData.resourceType) {
      return NextResponse.json({ error: 'Invalid appointment data' }, { status: 400 });
    }

    const epicClient = new EpicFHIRClient('clinician');
    const newAppointment = await epicClient.createAppointment(accessToken, appointmentData);

    // Add to cache
    const { db } = await connectToDatabase();
    await db.collection('data').insertOne(newAppointment);
    console.log(`CACHE ADD: Added new appointment ${newAppointment.id} to cache.`);

    return NextResponse.json(newAppointment, { status: 201 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: 'Failed to create appointment', details: errorMessage }, { status: 500 });
  }
}
