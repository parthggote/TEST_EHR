/**
 * Epic FHIR Client Tests
 * Unit tests for the Epic FHIR client functionality
 */

import { EpicFHIRClient } from '../lib/epic-client';
import { Patient, Appointment, Condition, OperationOutcome } from '../lib/types/fhir';

// Mock environment variables
const mockPatientEnv = {
  CLIENT_ID: 'test-patient-client-id',
  REDIRECT_URI: 'http://localhost:3000/api/auth/callback',
  ENCRYPTION_KEY: 'test-encryption-key-32-characters-long-enough',
  USE_MOCK_DATA: 'false',
};

const mockClinicianEnv = {
  EPIC_CLINICIAN_CLIENT_ID: 'test-clinician-client-id',
  EPIC_CLINICIAN_REDIRECT_URI: 'http://localhost:3000/api/auth/clinician/callback',
  EPIC_CLINICIAN_SCOPES: 'user/Patient.read user/Patient.write',
};

// Mock global fetch for all tests
global.fetch = jest.fn();

describe('EpicFHIRClient', () => {

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('Patient Flow', () => {
    let client: EpicFHIRClient;

    beforeAll(() => {
      Object.assign(process.env, mockPatientEnv);
    });

    beforeEach(() => {
      client = new EpicFHIRClient('patient');
    });

    it('should initialize with patient environment variables', () => {
      expect(client).toBeInstanceOf(EpicFHIRClient);
      // @ts-ignore // Access private property for testing
      expect(client.config.clientId).toBe('test-patient-client-id');
    });

    it('should generate a valid patient authorization URL', () => {
      const { url } = client.generateAuthUrl();
      expect(url).toContain('client_id=test-patient-client-id');
      expect(url).toContain('scope=patient'); // Check for patient-specific scope prefix
    });
  });

  describe('Clinician Flow', () => {
    let client: EpicFHIRClient;
    const mockAccessToken = 'mock-clinician-access-token';

    beforeAll(() => {
      // Set all required env vars for the clinician flow
      Object.assign(process.env, mockPatientEnv, mockClinicianEnv);
    });

    beforeEach(() => {
      client = new EpicFHIRClient('clinician');
    });

    it('should initialize with clinician environment variables', () => {
      expect(client).toBeInstanceOf(EpicFHIRClient);
      // @ts-ignore
      expect(client.config.clientId).toBe('test-clinician-client-id');
    });

    it('should generate a valid clinician authorization URL with user scopes', () => {
      const { url } = client.generateAuthUrl();
      expect(url).toContain('client_id=test-clinician-client-id');
      expect(url).toContain('scope=user'); // Check for user-specific scope prefix
    });

    // Test Patient CRUD
    describe('Patient CRUD', () => {
      it('should create a patient', async () => {
        const mockPatient: Partial<Patient> = { resourceType: 'Patient', name: [{ family: 'Test', given: ['Patient'] }] };
        (fetch as jest.Mock).mockResolvedValue({
          ok: true,
          json: () => Promise.resolve({ ...mockPatient, id: '123' }),
        });

        const result = await client.createPatient(mockAccessToken, mockPatient);
        expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/Patient'), expect.objectContaining({ method: 'POST', body: JSON.stringify(mockPatient) }));
        expect(result.id).toBe('123');
      });

      it('should update a patient', async () => {
        const mockPatient: Patient = { resourceType: 'Patient', id: '123', name: [{ family: 'Test', given: ['Updated'] }] };
        (fetch as jest.Mock).mockResolvedValue({ ok: true, json: () => Promise.resolve(mockPatient) });

        const result = await client.updatePatient(mockAccessToken, mockPatient);
        expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/Patient/123'), expect.objectContaining({ method: 'PUT', body: JSON.stringify(mockPatient) }));
        expect(result.name?.[0].given?.[0]).toBe('Updated');
      });

      it('should delete a patient', async () => {
        (fetch as jest.Mock).mockResolvedValue({ ok: true, status: 204, json: () => Promise.resolve({}) });
        await client.deletePatient(mockAccessToken, '123');
        expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/Patient/123'), expect.objectContaining({ method: 'DELETE' }));
      });
    });

    // Test Appointment CRUD
    describe('Appointment CRUD', () => {
      it('should get a single appointment', async () => {
        const mockAppt: Appointment = { resourceType: 'Appointment', id: 'abc', status: 'booked' };
        (fetch as jest.Mock).mockResolvedValue({ ok: true, json: () => Promise.resolve(mockAppt) });

        const result = await client.getAppointment(mockAccessToken, 'abc');
        expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/Appointment/abc'), expect.any(Object));
        expect(result.status).toBe('booked');
      });

      it('should update an appointment', async () => {
        const mockAppt: Appointment = { resourceType: 'Appointment', id: 'abc', status: 'cancelled' };
        (fetch as jest.Mock).mockResolvedValue({ ok: true, json: () => Promise.resolve(mockAppt) });

        const result = await client.updateAppointment(mockAccessToken, mockAppt);
        expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/Appointment/abc'), expect.objectContaining({ method: 'PUT' }));
        expect(result.status).toBe('cancelled');
      });

      it('should delete an appointment', async () => {
        (fetch as jest.Mock).mockResolvedValue({ ok: true, status: 204, json: () => Promise.resolve({}) });
        await client.deleteAppointment(mockAccessToken, 'abc');
        expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/Appointment/abc'), expect.objectContaining({ method: 'DELETE' }));
      });
    });

    // Test Condition CRUD
    describe('Condition CRUD', () => {
      it('should create a condition', async () => {
        const mockCondition: Partial<Condition> = { resourceType: 'Condition', code: { text: 'Fever' } };
        (fetch as jest.Mock).mockResolvedValue({ ok: true, json: () => Promise.resolve({ ...mockCondition, id: 'cond1' }) });

        const result = await client.createCondition(mockAccessToken, mockCondition);
        expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/Condition'), expect.objectContaining({ method: 'POST' }));
        expect(result.id).toBe('cond1');
      });

      it('should delete a condition', async () => {
        (fetch as jest.Mock).mockResolvedValue({ ok: true, status: 204, json: () => Promise.resolve({}) });
        await client.deleteCondition(mockAccessToken, 'cond1');
        expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/Condition/cond1'), expect.objectContaining({ method: 'DELETE' }));
      });
    });
  });
});