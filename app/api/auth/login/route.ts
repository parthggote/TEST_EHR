/**
 * Epic FHIR OAuth2 Login Route
 * Initiates SMART on FHIR authorization flow
 */

import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const scopes = searchParams.get('scopes')?.split(',') || undefined; // Use default scopes from config
    
    // Generate authorization URL with PKCE
    const { EpicFHIRClient } = await import('@/lib/epic-client');
    const epicClient = new EpicFHIRClient();
    const { url, state } = epicClient.generateAuthUrl(scopes);
    
    // Store auth state securely in HTTP-only cookie
    const cookieStore = cookies();
    cookieStore.set('epic_auth_state', JSON.stringify(state), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 600, // 10 minutes
      path: '/'
    });
    
    // Redirect to Epic authorization server
    return NextResponse.redirect(url);
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Failed to initiate login' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { scopes } = await request.json();
    
    // Generate authorization URL with custom scopes
    const { EpicFHIRClient } = await import('@/lib/epic-client');
    const epicClient = new EpicFHIRClient();
    const { url, state } = epicClient.generateAuthUrl(scopes || undefined); // Use default scopes from config
    
    // Store auth state securely
    const cookieStore = cookies();
    cookieStore.set('epic_auth_state', JSON.stringify(state), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 600,
      path: '/'
    });
    
    return NextResponse.json({ authUrl: url });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Failed to generate auth URL' },
      { status: 500 }
    );
  }
}