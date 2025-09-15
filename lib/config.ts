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

export type UserType = 'patient' | 'clinician';

export function getEpicConfig(userType: UserType = 'patient'): EpicConfig {
  const baseUrl = (process.env.NEXTAUTH_URL || process.env.VERCEL_URL || '').replace(/\/$/, '');

  let config: EpicConfig;

  if (userType === 'clinician') {
    const redirectUri = process.env.EPIC_CLINICIAN_REDIRECT_URI || `${baseUrl}/api/auth/clinician/callback`;
    config = {
      clientId: process.env.EPIC_CLINICIAN_CLIENT_ID || '',
      redirectUri: redirectUri,
      baseUrl: process.env.FHIR_BASE_URL || 'https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4/',
      authorizeUrl: process.env.EPIC_CLINICIAN_AUTHORIZE_URL || 'https://fhir.epic.com/interconnect-fhir-oauth/oauth2/authorize',
      tokenUrl: process.env.EPIC_CLINICIAN_TOKEN_URL || 'https://fhir.epic.com/interconnect-fhir-oauth/oauth2/token',
      encryptionKey: process.env.ENCRYPTION_KEY || '',
      useMockData: false, // Clinician flow should not use mock data
      testPatientId: '' // Not applicable for clinician flow
    };
  } else {
    const redirectUri = baseUrl
      ? `${baseUrl}/api/auth/callback`
      : process.env.REDIRECT_URI || 'https://test-ehr.vercel.app/api/auth/callback';

    config = {
      clientId: process.env.CLIENT_ID || '',
      redirectUri: redirectUri,
      baseUrl: process.env.FHIR_BASE_URL || 'https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4/',
      authorizeUrl: process.env.EPIC_AUTHORIZE_URL || 'https://fhir.epic.com/interconnect-fhir-oauth/oauth2/authorize',
      tokenUrl: process.env.EPIC_TOKEN_URL || 'https://fhir.epic.com/interconnect-fhir-oauth/oauth2/token',
      encryptionKey: process.env.ENCRYPTION_KEY || '',
      useMockData: process.env.USE_MOCK_DATA === 'true' || (!process.env.CLIENT_ID && process.env.USE_MOCK_DATA !== 'false'),
      testPatientId: process.env.TEST_PATIENT_ID || 'eq081-VQEgP8drUUqCWzHfw3'
    };
  }

  if (process.env.NODE_ENV === 'development') {
    console.log(`Epic Config (${userType}):`, {
      clientId: config.clientId ? `${config.clientId.substring(0, 8)}...` : 'missing',
      redirectUri: config.redirectUri,
      authorizeUrl: config.authorizeUrl,
      useMockData: config.useMockData
    });
  }

  return config;
}

export function validateEpicConfig(userType: UserType = 'patient'): { valid: boolean; errors: string[] } {
  const config = getEpicConfig(userType);
  const errors: string[] = [];

  if (!config.useMockData) {
    if (!config.clientId) {
      errors.push(`CLIENT_ID for ${userType} is required for real Epic API integration`);
    }
    if (!config.encryptionKey || config.encryptionKey.length < 32) {
      errors.push('ENCRYPTION_KEY must be at least 32 characters long');
    }
    
    try {
      const url = new URL(config.redirectUri);
      if (url.protocol !== 'https:' && url.protocol !== 'http:') {
        errors.push(`REDIRECT_URI for ${userType} must use https or http protocol`);
      }
    } catch {
      errors.push(`REDIRECT_URI for ${userType} is not a valid URL format`);
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

export function getEpicScopes(userType: UserType = 'patient'): string[] {
  if (userType === 'clinician') {
    // Scopes are space-separated in the env variable
    const scopesString = process.env.EPIC_CLINICIAN_SCOPES || "openid profile launch offline_access user/Patient.read user/Patient.write user/Appointment.read user/Appointment.write user/Observation.read user/Observation.write user/Condition.read user/Condition.write user/AllergyIntolerance.read user/AllergyIntolerance.write user/Immunization.read user/Immunization.write user/DocumentReference.read user/DocumentReference.write user/MedicationRequest.read user/MedicationRequest.write user/Coverage.read user/ExplanationOfBenefit.read user/Account.read";
    return scopesString.split(' ');
  }

  // Patient scopes
  return [
    'patient/Patient.Read',
    'patient/Patient.Search',
    'patient/AllergyIntolerance.Read',
    'patient/AllergyIntolerance.Search',
    'patient/MedicationRequest.Read',
    'patient/MedicationRequest.Search',
    'patient/Condition.Read',
    'patient/Condition.Search',
    'patient/Appointment.Read',
    'patient/Appointment.Search',
    'patient/Observation.Read',
    'patient/Observation.Search',
    'patient/Immunization.Read',
    'patient/Immunization.Search',
    'patient/DocumentReference.Read',
    'patient/DocumentReference.Search',
    'patient/Coverage.Read',
    'patient/Coverage.Search',
    'patient/ExplanationOfBenefit.Read',
    'patient/ExplanationOfBenefit.Search',
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
