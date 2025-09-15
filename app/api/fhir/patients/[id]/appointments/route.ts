/**
 * FHIR Patient Appointments API Route
 * Handles appointment retrieval and creation for specific patients
 */

import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { cookies } from 'next/headers';
import CryptoJS from 'crypto-js';

async function getAccessToken(): Promise<string | null> {
  const cookieStore = cookies();
  const encryptedToken = cookieStore.get('epic_access_token')?.value;
  
  if (!encryptedToken) return null;
  
  try {
    const encryptionKey = process.env.ENCRYPTION_KEY!;
    const decryptedToken = CryptoJS.AES.decrypt(encryptedToken, encryptionKey).toString(CryptoJS.enc.Utf8);
    return decryptedToken;
  } catch {
    return null;
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) {
      return NextResponse.json(
        { error: 'Unauthorized - No valid access token' },
        { status: 401 }
      );
    }

    const patientId = params.id;
    const searchParams = request.nextUrl.searchParams;
    
    const queryParams = {
      date: searchParams.get('date') || undefined,
      status: searchParams.get('status') || undefined
    };
    
    const { EpicFHIRClient } = await import('@/lib/epic-client');
    const epicClient = new EpicFHIRClient();
    
    const appointments = await epicClient.getPatientAppointments(
      accessToken, 
      patientId, 
      queryParams
    );
    
    return NextResponse.json(appointments);
  } catch (error) {
    console.error('Patient appointments API error:', error);
    
    if (error instanceof Error && error.message.includes('401')) {
      return NextResponse.json(
        { error: 'Unauthorized - Token expired or invalid' },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch patient appointments',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) {
      return NextResponse.json(
        { error: 'Unauthorized - No valid access token' },
        { status: 401 }
      );
    }

    const patientId = params.id;
    const appointmentData = await request.json();
    
    // Ensure patient reference is set
    if (!appointmentData.participant) {
      appointmentData.participant = [];
    }
    
    // Add patient as participant if not already present
    const hasPatientParticipant = appointmentData.participant.some(
      (p: any) => p.actor?.reference === `Patient/${patientId}`
    );
    
    if (!hasPatientParticipant) {
      appointmentData.participant.push({
        actor: {
          reference: `Patient/${patientId}`,
          display: 'Patient'
        },
        required: 'required',
        status: 'accepted'
      });
    }
    
    const { EpicFHIRClient } = await import('@/lib/epic-client');
    const epicClient = new EpicFHIRClient();
    
    const appointment = await epicClient.createAppointment(accessToken, appointmentData);
    
    return NextResponse.json(appointment, { status: 201 });
  } catch (error) {
    console.error('Create appointment API error:', error);
    
    if (error instanceof Error && error.message.includes('401')) {
      return NextResponse.json(
        { error: 'Unauthorized - Token expired or invalid' },
        { status: 401 }
      );
    }
    
    if (error instanceof Error && error.message.includes('403')) {
      return NextResponse.json(
        { error: 'Forbidden - Insufficient permissions to create appointments' },
        { status: 403 }
      );
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to create appointment',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}