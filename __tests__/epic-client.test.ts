/**
 * Epic FHIR Client Tests
 * Unit tests for the Epic FHIR client functionality
 */

import { EpicFHIRClient } from '../lib/epic-client';

// Mock environment variables
const mockEnv = {
  CLIENT_ID: 'test-client-id',
  REDIRECT_URI: 'http://localhost:3000/auth/callback',
  FHIR_BASE_URL: 'https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4/',
  EPIC_AUTHORIZE_URL: 'https://fhir.epic.com/interconnect-fhir-oauth/oauth2/authorize',
  EPIC_TOKEN_URL: 'https://fhir.epic.com/interconnect-fhir-oauth/oauth2/token',
  ENCRYPTION_KEY: 'test-encryption-key-32-characters'
};

// Mock process.env
Object.assign(process.env, mockEnv);

describe('EpicFHIRClient', () => {
  let client: EpicFHIRClient;

  beforeEach(() => {
    client = new EpicFHIRClient();
  });

  describe('Constructor', () => {
    it('should initialize with environment variables', () => {
      expect(client).toBeInstanceOf(EpicFHIRClient);
    });

    it('should throw error if required env vars are missing', () => {
      const originalClientId = process.env.CLIENT_ID;
      delete process.env.CLIENT_ID;
      
      expect(() => new EpicFHIRClient()).toThrow('Missing required Epic FHIR configuration');
      
      process.env.CLIENT_ID = originalClientId;
    });
  });

  describe('generateAuthUrl', () => {
    it('should generate valid authorization URL', () => {
      const { url, state } = client.generateAuthUrl();
      
      expect(url).toContain('https://fhir.epic.com/interconnect-fhir-oauth/oauth2/authorize');
      expect(url).toContain('response_type=code');
      expect(url).toContain('client_id=test-client-id');
      expect(url).toContain('code_challenge_method=S256');
      expect(state.state).toBeDefined();
      expect(state.codeVerifier).toBeDefined();
    });

    it('should include custom scopes', () => {
      const customScopes = ['patient/*.read', 'user/*.read'];
      const { url } = client.generateAuthUrl(customScopes);
      
      expect(url).toContain('scope=patient%2F*.read%20user%2F*.read');
    });
  });

  describe('Utility Methods', () => {
    it('should validate FHIR resources correctly', () => {
      const validResource = { resourceType: 'Patient', id: '123' };
      const invalidResource = { id: '123' };
      
      expect(client.validateResource(validResource)).toBe(true);
      expect(client.validateResource(invalidResource)).toBe(false);
      expect(client.validateResource(null)).toBe(false);
    });

    it('should extract patient ID from reference', () => {
      expect(client.extractPatientId('Patient/123')).toBe('123');
      expect(client.extractPatientId('Patient/eq081-VQEgP8drUUqCWzHfw3')).toBe('eq081-VQEgP8drUUqCWzHfw3');
      expect(client.extractPatientId('invalid-reference')).toBe(null);
    });

    it('should format FHIR dates correctly', () => {
      expect(client.formatFHIRDate('2024-01-15')).toBe('1/15/2024');
      expect(client.formatFHIRDate('invalid-date')).toBe('invalid-date');
    });

    it('should get display name from HumanName array', () => {
      const names = [
        {
          use: 'official',
          given: ['John', 'Michael'],
          family: 'Doe'
        }
      ];
      
      expect(client.getDisplayName(names)).toBe('John Michael Doe');
      expect(client.getDisplayName([])).toBe('Unknown');
      expect(client.getDisplayName(null as any)).toBe('Unknown');
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors gracefully', async () => {
      // Mock fetch to simulate network error
      global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));
      
      await expect(
        client.exchangeCodeForToken('test-code', {
          state: 'test-state',
          codeVerifier: 'test-verifier',
          redirectUri: 'http://localhost:3000/auth/callback',
          timestamp: Date.now()
        })
      ).rejects.toThrow('Network error');
    });

    it('should handle HTTP error responses', async () => {
      // Mock fetch to simulate HTTP error
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 400,
        text: () => Promise.resolve('Bad Request')
      });
      
      await expect(
        client.exchangeCodeForToken('test-code', {
          state: 'test-state',
          codeVerifier: 'test-verifier',
          redirectUri: 'http://localhost:3000/auth/callback',
          timestamp: Date.now()
        })
      ).rejects.toThrow('Token exchange failed: 400 Bad Request');
    });
  });
});

// Mock global fetch for tests
global.fetch = jest.fn();

// Reset mocks after each test
afterEach(() => {
  jest.resetAllMocks();
});