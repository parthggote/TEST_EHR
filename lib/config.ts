/**
 * Configuration Helper
 * Manages Epic FHIR integration settings
 */

export interface EpicConfig {
  clientId: string;
  redirectUri: string;
  baseUrl: string;
  authorizeUrl: string;
  tokenUrl: string;
  encryptionKey: string;
  useMockData: boolean;
  testPatientId: string;
}

export function getEpicConfig(): EpicConfig {
  const config: EpicConfig = {
    clientId: process.env.CLIENT_ID || '',
    redirectUri: process.env.REDIRECT_URI || 'http://localhost:3000/auth/callback',
    baseUrl: process.env.FHIR_BASE_URL || 'https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4/',
    authorizeUrl: process.env.EPIC_AUTHORIZE_URL || 'https://fhir.epic.com/interconnect-fhir-oauth/oauth2/authorize',
    tokenUrl: process.env.EPIC_TOKEN_URL || 'https://fhir.epic.com/interconnect-fhir-oauth/oauth2/token',
    encryptionKey: process.env.ENCRYPTION_KEY || '',
    useMockData: process.env.USE_MOCK_DATA === 'true' || (!process.env.CLIENT_ID && process.env.USE_MOCK_DATA !== 'false'),
    testPatientId: process.env.TEST_PATIENT_ID || 'eq081-VQEgP8drUUqCWzHfw3'
  };

  return config;
}

export function validateEpicConfig(): { valid: boolean; errors: string[] } {
  const config = getEpicConfig();
  const errors: string[] = [];

  if (!config.useMockData) {
    if (!config.clientId) {
      errors.push('CLIENT_ID is required for real Epic API integration');
    }
    if (!config.encryptionKey || config.encryptionKey.length < 32) {
      errors.push('ENCRYPTION_KEY must be at least 32 characters long');
    }
    if (!config.redirectUri.startsWith('http')) {
      errors.push('REDIRECT_URI must be a valid URL');
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

export function getEpicScopes(): string[] {
  return [
    'patient/*.read',
    'user/*.read', 
    'launch',
    'openid',
    'profile'
  ];
}

export function isProductionMode(): boolean {
  return process.env.NODE_ENV === 'production';
}

export function isDevelopmentMode(): boolean {
  return process.env.NODE_ENV === 'development';
}