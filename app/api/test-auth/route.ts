/**
 * Test Auth URL Generation
 * Helps debug OAuth2 parameters
 */

import { NextResponse } from 'next/server';
import { EpicFHIRClient } from '@/lib/epic-client';
import { getEpicConfig } from '@/lib/config';

export async function GET() {
  try {
    const config = getEpicConfig();
    const epicClient = new EpicFHIRClient();
    const { url, state } = epicClient.generateAuthUrl();

    // Parse the URL to show individual parameters
    const urlObj = new URL(url);
    const params: Record<string, string> = {};
    urlObj.searchParams.forEach((value, key) => {
      params[key] = value;
    });

    return NextResponse.json({
      config: {
        clientId: config.clientId,
        redirectUri: config.redirectUri,
        authorizeUrl: config.authorizeUrl,
        baseUrl: config.baseUrl
      },
      authUrl: url,
      parameters: params,
      state: {
        state: state.state,
        redirectUri: state.redirectUri,
        timestamp: state.timestamp
      }
    });
  } catch (error) {
    console.error('Test auth error:', error);
    return NextResponse.json(
      { error: 'Failed to generate test auth URL', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}