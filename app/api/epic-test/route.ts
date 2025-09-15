/**
 * Epic Configuration Test
 * Tests the exact parameters being sent to Epic
 */

import { NextResponse } from 'next/server';
import { getEpicConfig, getEpicScopes } from '@/lib/config';

export async function GET() {
  try {
    const config = getEpicConfig();
    const scopes = getEpicScopes();
    
    // Create the exact URL that would be sent to Epic
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: config.clientId,
      redirect_uri: config.redirectUri,
      scope: scopes.join(' '),
      state: 'test-state-123',
      code_challenge: 'test-challenge-123',
      code_challenge_method: 'S256'
    });

    const authUrl = `${config.authorizeUrl}?${params.toString()}`;

    return NextResponse.json({
      message: 'Epic Configuration Test',
      config: {
        clientId: config.clientId,
        redirectUri: config.redirectUri,
        authorizeUrl: config.authorizeUrl,
        baseUrl: config.baseUrl,
        useMockData: config.useMockData
      },
      scopes: scopes,
      scopeString: scopes.join(' '),
      authUrl: authUrl,
      urlBreakdown: {
        baseUrl: config.authorizeUrl,
        parameters: Object.fromEntries(params.entries())
      },
      recommendations: [
        'Verify your Epic app registration at https://fhir.epic.com/Developer',
        'Ensure your Client ID matches exactly',
        'Check that your redirect URI is registered',
        'Verify your app has the required scopes enabled'
      ]
    });
  } catch (error) {
    return NextResponse.json(
      { 
        error: 'Configuration test failed', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}