/**
 * Epic FHIR Client - Secure wrapper for Epic FHIR API interactions
 * Implements SMART on FHIR OAuth2 Authorization Code Flow with PKCE
 * HIPAA-compliant PHI handling with encryption and audit logging
 */

import { 
  FHIRBundle, 
  Patient, 
  Appointment,
  OperationOutcome,
  EpicTokenResponse,
  EpicAuthState,
  Condition,
  AllergyIntolerance,
  Observation,
  DocumentReference,
  MedicationRequest,
  Immunization
} from './types/fhir';
import { getEpicConfig, getEpicScopes } from './config';
import CryptoJS from 'crypto-js';
import { v4 as uuidv4 } from 'uuid';

import { UserType } from './config';

export class EpicFHIRClient {
  private config: ReturnType<typeof getEpicConfig>;
  private userType: UserType;

  constructor(userType: UserType = 'patient') {
    this.userType = userType;
    this.config = getEpicConfig(this.userType);

    // Only validate configuration at runtime, not during build
    if (typeof window !== 'undefined' || process.env.NODE_ENV === 'development') {
      if (this.userType === 'patient' && !this.config.useMockData && (!this.config.clientId || !this.config.encryptionKey)) {
        console.warn('Missing Epic FHIR configuration for patient. Using mock data for development.');
        this.config.useMockData = true;
      }
    }
  }

  /**
   * Generate PKCE code verifier and challenge for OAuth2 flow
   */
  private generatePKCE(): { codeVerifier: string; codeChallenge: string } {
    const codeVerifier = this.base64URLEncode(CryptoJS.lib.WordArray.random(32));
    const codeChallenge = this.base64URLEncode(CryptoJS.SHA256(codeVerifier));
    return { codeVerifier, codeChallenge };
  }

  /**
   * Base64 URL encode helper
   */
  private base64URLEncode(wordArray: CryptoJS.lib.WordArray): string {
    return CryptoJS.enc.Base64.stringify(wordArray)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  }

  /**
   * Encrypt sensitive data for secure storage
   */
  encrypt(data: string): string {
    return CryptoJS.AES.encrypt(data, this.config.encryptionKey).toString();
  }

  /**
   * Decrypt sensitive data
   */
  decrypt(encryptedData: string): string {
    const bytes = CryptoJS.AES.decrypt(encryptedData, this.config.encryptionKey);
    return bytes.toString(CryptoJS.enc.Utf8);
  }

  /**
   * Generate authorization URL for SMART on FHIR OAuth2 flow
   */
  generateAuthUrl(scopes?: string[]): { url: string; state: EpicAuthState } {
    const resolvedScopes = scopes || getEpicScopes(this.userType);
    const { codeVerifier, codeChallenge } = this.generatePKCE();
    const state = uuidv4();
    
    const authState: EpicAuthState = {
      state,
      codeVerifier,
      redirectUri: this.config.redirectUri,
      timestamp: Date.now()
    };

    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      scope: resolvedScopes.join(' '),
      state,
      code_challenge: codeChallenge,
      code_challenge_method: 'S256'
    });

    const authUrl = `${this.config.authorizeUrl}?${params.toString()}`;

    // Log auth URL generation for debugging (without sensitive data)
    if (process.env.NODE_ENV === 'development') {
      console.log('Generated auth URL:', {
        clientId: this.config.clientId ? `${this.config.clientId.substring(0, 8)}...` : 'missing',
        redirectUri: this.config.redirectUri,
        scopes: resolvedScopes.join(' '),
        state: state.substring(0, 8) + '...',
        codeChallenge: codeChallenge.substring(0, 8) + '...',
        fullUrl: authUrl
      });
    }

    return {
      url: authUrl,
      state: authState
    };
  }

  /**
   * Exchange authorization code for access token
   */
  async exchangeCodeForToken(
    code: string, 
    authState: EpicAuthState
  ): Promise<EpicTokenResponse> {
    if (this.config.useMockData) {
      try {
        const { MockEpicServer } = await import('./mock-epic-server');
        return MockEpicServer.mockTokenExchange();
      } catch (error) {
        console.warn('Mock server not available, proceeding with real API');
      }
    }

    try {
      const response = await fetch(this.config.tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json'
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          client_id: this.config.clientId,
          code,
          redirect_uri: authState.redirectUri,
          code_verifier: authState.codeVerifier
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Token exchange failed: ${response.status} ${errorText}`);
      }

      const tokenData: EpicTokenResponse = await response.json();
      
      // Log successful authentication (without sensitive data)
      this.auditLog('TOKEN_EXCHANGE_SUCCESS', {
        timestamp: new Date().toISOString(),
        scope: tokenData.scope,
        patientId: tokenData.patient
      });

      return tokenData;
    } catch (error) {
      this.auditLog('TOKEN_EXCHANGE_ERROR', {
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshToken(refreshToken: string): Promise<EpicTokenResponse> {
    try {
      const response = await fetch(this.config.tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json'
        },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          client_id: this.config.clientId,
          refresh_token: refreshToken
        })
      });

      if (!response.ok) {
        throw new Error(`Token refresh failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      this.auditLog('TOKEN_REFRESH_ERROR', {
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * Make authenticated FHIR API request with retry logic
   */
  private async makeRequest<T>(
    endpoint: string, 
    accessToken: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.config.baseUrl}${endpoint}`;
    let retryCount = 0;
    const maxRetries = 3;

    while (retryCount <= maxRetries) {
      try {
        const response = await fetch(url, {
          ...options,
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Accept': 'application/fhir+json',
            'Content-Type': 'application/fhir+json',
            ...options.headers
          }
        });

        // Handle rate limiting with exponential backoff
        if (response.status === 429) {
          const retryAfter = response.headers.get('Retry-After');
          const delay = retryAfter ? parseInt(retryAfter) * 1000 : Math.pow(2, retryCount) * 1000;
          
          if (retryCount < maxRetries) {
            await new Promise(resolve => setTimeout(resolve, delay));
            retryCount++;
            continue;
          }
        }

        if (!response.ok) {
          const errorBody = await response.text();
          let operationOutcome: OperationOutcome | null = null;
          
          try {
            operationOutcome = JSON.parse(errorBody) as OperationOutcome;
          } catch {
            // Not a valid FHIR OperationOutcome
          }

          this.auditLog('FHIR_REQUEST_ERROR', {
            timestamp: new Date().toISOString(),
            endpoint,
            status: response.status,
            error: operationOutcome?.issue?.[0]?.diagnostics || errorBody
          });

          throw new Error(
            operationOutcome?.issue?.[0]?.diagnostics || 
            `FHIR request failed: ${response.status} ${response.statusText}`
          );
        }

        const data = await response.json();
        
        // Log successful request (without PHI)
        this.auditLog('FHIR_REQUEST_SUCCESS', {
          timestamp: new Date().toISOString(),
          endpoint,
          resourceType: data.resourceType || 'Bundle'
        });

        return data;
      } catch (error) {
        if (retryCount === maxRetries) {
          throw error;
        }
        retryCount++;
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000));
      }
    }

    throw new Error('Max retries exceeded');
  }

  // Patient Operations
  async searchPatients(
    accessToken: string, 
    params: { family?: string; given?: string; birthdate?: string; identifier?: string }
  ): Promise<FHIRBundle> {
    if (this.config.useMockData) {
      try {
        const { MockEpicServer } = await import('./mock-epic-server');
        return MockEpicServer.searchPatients(params);
      } catch (error) {
        console.warn('Mock server not available, proceeding with real API');
      }
    }

    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value) searchParams.append(key, value);
    });
    
    return this.makeRequest<FHIRBundle>(`Patient?${searchParams.toString()}`, accessToken);
  }

  async getPatient(accessToken: string, patientId: string): Promise<Patient> {
    if (this.config.useMockData) {
      try {
        const { MockEpicServer } = await import('./mock-epic-server');
        return MockEpicServer.getPatient(patientId);
      } catch (error) {
        console.warn('Mock server not available, proceeding with real API');
      }
    }

    return this.makeRequest<Patient>(`Patient/${patientId}`, accessToken);
  }

  async createPatient(accessToken: string, patient: Partial<Patient>): Promise<Patient> {
    return this.makeRequest<Patient>('Patient', accessToken, {
      method: 'POST',
      body: JSON.stringify(patient)
    });
  }

  async updatePatient(accessToken: string, patient: Patient): Promise<Patient> {
    return this.makeRequest<Patient>(`Patient/${patient.id}`, accessToken, {
      method: 'PUT',
      body: JSON.stringify(patient)
    });
  }

  async deletePatient(accessToken: string, patientId: string): Promise<OperationOutcome> {
    return this.makeRequest<OperationOutcome>(`Patient/${patientId}`, accessToken, {
      method: 'DELETE'
    });
  }

  // Appointment Operations
  async getPatientAppointments(
    accessToken: string, 
    patientId: string,
    params?: { date?: string; status?: string }
  ): Promise<FHIRBundle> {
    if (this.config.useMockData) {
      try {
        const { MockEpicServer } = await import('./mock-epic-server');
        return MockEpicServer.getPatientAppointments(patientId);
      } catch (error) {
        console.warn('Mock server not available, proceeding with real API');
      }
    }

    const searchParams = new URLSearchParams({ patient: patientId });
    if (params?.date) searchParams.append('date', params.date);
    if (params?.status) searchParams.append('status', params.status);
    
    return this.makeRequest<FHIRBundle>(`Appointment?${searchParams.toString()}`, accessToken);
  }

  async createAppointment(accessToken: string, appointment: Partial<Appointment>): Promise<Appointment> {
    return this.makeRequest<Appointment>('Appointment', accessToken, {
      method: 'POST',
      body: JSON.stringify(appointment)
    });
  }

  async updateAppointment(accessToken: string, appointment: Appointment): Promise<Appointment> {
    return this.makeRequest<Appointment>(`Appointment/${appointment.id}`, accessToken, {
      method: 'PUT',
      body: JSON.stringify(appointment)
    });
  }

  async deleteAppointment(accessToken: string, appointmentId: string): Promise<OperationOutcome> {
    return this.makeRequest<OperationOutcome>(`Appointment/${appointmentId}`, accessToken, {
      method: 'DELETE'
    });
  }

  async getAppointment(accessToken: string, appointmentId: string): Promise<Appointment> {
    return this.makeRequest<Appointment>(`Appointment/${appointmentId}`, accessToken);
  }

  // Clinical Data Operations
  async createCondition(accessToken: string, condition: Partial<Condition>): Promise<Condition> {
    return this.makeRequest<Condition>('Condition', accessToken, {
      method: 'POST',
      body: JSON.stringify(condition)
    });
  }

  async getCondition(accessToken: string, conditionId: string): Promise<Condition> {
    return this.makeRequest<Condition>(`Condition/${conditionId}`, accessToken);
  }

  async updateCondition(accessToken: string, condition: Condition): Promise<Condition> {
    return this.makeRequest<Condition>(`Condition/${condition.id}`, accessToken, {
      method: 'PUT',
      body: JSON.stringify(condition)
    });
  }

  async deleteCondition(accessToken: string, conditionId: string): Promise<OperationOutcome> {
    return this.makeRequest<OperationOutcome>(`Condition/${conditionId}`, accessToken, {
      method: 'DELETE'
    });
  }

  async getPatientObservations(
    accessToken: string, 
    patientId: string,
    params?: { category?: string; code?: string; date?: string }
  ): Promise<FHIRBundle> {
    if (this.config.useMockData) {
      try {
        const { MockEpicServer } = await import('./mock-epic-server');
        return MockEpicServer.getPatientObservations(patientId);
      } catch (error) {
        console.warn('Mock server not available, proceeding with real API');
      }
    }

    const searchParams = new URLSearchParams({ patient: patientId });
    if (params?.category) searchParams.append('category', params.category);
    if (params?.code) searchParams.append('code', params.code);
    if (params?.date) searchParams.append('date', params.date);
    
    return this.makeRequest<FHIRBundle>(`Observation?${searchParams.toString()}`, accessToken);
  }

  async createObservation(accessToken: string, observation: Partial<Observation>): Promise<Observation> {
    return this.makeRequest<Observation>('Observation', accessToken, {
      method: 'POST',
      body: JSON.stringify(observation)
    });
  }

  async getObservation(accessToken: string, observationId: string): Promise<Observation> {
    return this.makeRequest<Observation>(`Observation/${observationId}`, accessToken);
  }

  async updateObservation(accessToken: string, observation: Observation): Promise<Observation> {
    return this.makeRequest<Observation>(`Observation/${observation.id}`, accessToken, {
      method: 'PUT',
      body: JSON.stringify(observation)
    });
  }

  async deleteObservation(accessToken: string, observationId: string): Promise<OperationOutcome> {
    return this.makeRequest<OperationOutcome>(`Observation/${observationId}`, accessToken, {
      method: 'DELETE'
    });
  }

  async createDocumentReference(accessToken: string, docRef: Partial<DocumentReference>): Promise<DocumentReference> {
    return this.makeRequest<DocumentReference>('DocumentReference', accessToken, {
      method: 'POST',
      body: JSON.stringify(docRef)
    });
  }

  async getDocumentReference(accessToken: string, docRefId: string): Promise<DocumentReference> {
    return this.makeRequest<DocumentReference>(`DocumentReference/${docRefId}`, accessToken);
  }

  async updateDocumentReference(accessToken: string, docRef: DocumentReference): Promise<DocumentReference> {
    return this.makeRequest<DocumentReference>(`DocumentReference/${docRef.id}`, accessToken, {
      method: 'PUT',
      body: JSON.stringify(docRef)
    });
  }

  async deleteDocumentReference(accessToken: string, docRefId: string): Promise<OperationOutcome> {
    return this.makeRequest<OperationOutcome>(`DocumentReference/${docRefId}`, accessToken, {
      method: 'DELETE'
    });
  }

  async getPatientConditions(accessToken: string, patientId: string): Promise<FHIRBundle> {
    if (this.config.useMockData) {
      try {
        const { MockEpicServer } = await import('./mock-epic-server');
        return MockEpicServer.getPatientConditions(patientId);
      } catch (error) {
        console.warn('Mock server not available, proceeding with real API');
      }
    }

    return this.makeRequest<FHIRBundle>(`Condition?patient=${patientId}`, accessToken);
  }

  async getPatientMedications(accessToken: string, patientId: string): Promise<FHIRBundle> {
    if (this.config.useMockData) {
      try {
        const { MockEpicServer } = await import('./mock-epic-server');
        return MockEpicServer.getPatientMedications(patientId);
      } catch (error) {
        console.warn('Mock server not available, proceeding with real API');
      }
    }

    return this.makeRequest<FHIRBundle>(`MedicationRequest?patient=${patientId}`, accessToken);
  }

  async createMedicationRequest(accessToken: string, medReq: Partial<MedicationRequest>): Promise<MedicationRequest> {
    return this.makeRequest<MedicationRequest>('MedicationRequest', accessToken, {
      method: 'POST',
      body: JSON.stringify(medReq)
    });
  }

  async getMedicationRequest(accessToken: string, medReqId: string): Promise<MedicationRequest> {
    return this.makeRequest<MedicationRequest>(`MedicationRequest/${medReqId}`, accessToken);
  }

  async updateMedicationRequest(accessToken: string, medReq: MedicationRequest): Promise<MedicationRequest> {
    return this.makeRequest<MedicationRequest>(`MedicationRequest/${medReq.id}`, accessToken, {
      method: 'PUT',
      body: JSON.stringify(medReq)
    });
  }

  async deleteMedicationRequest(accessToken: string, medReqId: string): Promise<OperationOutcome> {
    return this.makeRequest<OperationOutcome>(`MedicationRequest/${medReqId}`, accessToken, {
      method: 'DELETE'
    });
  }

  async getPatientImmunizations(accessToken: string, patientId: string): Promise<FHIRBundle> {
    return this.makeRequest<FHIRBundle>(`Immunization?patient=${patientId}`, accessToken);
  }

  async createImmunization(accessToken: string, immunization: Partial<Immunization>): Promise<Immunization> {
    return this.makeRequest<Immunization>('Immunization', accessToken, {
      method: 'POST',
      body: JSON.stringify(immunization)
    });
  }

  async getImmunization(accessToken: string, immunizationId: string): Promise<Immunization> {
    return this.makeRequest<Immunization>(`Immunization/${immunizationId}`, accessToken);
  }

  async updateImmunization(accessToken: string, immunization: Immunization): Promise<Immunization> {
    return this.makeRequest<Immunization>(`Immunization/${immunization.id}`, accessToken, {
      method: 'PUT',
      body: JSON.stringify(immunization)
    });
  }

  async deleteImmunization(accessToken: string, immunizationId: string): Promise<OperationOutcome> {
    return this.makeRequest<OperationOutcome>(`Immunization/${immunizationId}`, accessToken, {
      method: 'DELETE'
    });
  }

  async getPatientAllergies(accessToken: string, patientId: string): Promise<FHIRBundle> {
    if (this.config.useMockData) {
      try {
        const { MockEpicServer } = await import('./mock-epic-server');
        return MockEpicServer.getPatientAllergies(patientId);
      } catch (error) {
        console.warn('Mock server not available, proceeding with real API');
      }
    }

    return this.makeRequest<FHIRBundle>(`AllergyIntolerance?patient=${patientId}`, accessToken);
  }

  async createAllergy(accessToken: string, allergy: Partial<AllergyIntolerance>): Promise<AllergyIntolerance> {
    return this.makeRequest<AllergyIntolerance>('AllergyIntolerance', accessToken, {
      method: 'POST',
      body: JSON.stringify(allergy)
    });
  }

  async getAllergy(accessToken: string, allergyId: string): Promise<AllergyIntolerance> {
    return this.makeRequest<AllergyIntolerance>(`AllergyIntolerance/${allergyId}`, accessToken);
  }

  async updateAllergy(accessToken: string, allergy: AllergyIntolerance): Promise<AllergyIntolerance> {
    return this.makeRequest<AllergyIntolerance>(`AllergyIntolerance/${allergy.id}`, accessToken, {
      method: 'PUT',
      body: JSON.stringify(allergy)
    });
  }

  async deleteAllergy(accessToken: string, allergyId: string): Promise<OperationOutcome> {
    return this.makeRequest<OperationOutcome>(`AllergyIntolerance/${allergyId}`, accessToken, {
      method: 'DELETE'
    });
  }

  // Bulk Data Operations
  async kickOffBulkExport(accessToken: string): Promise<string> {
    const exportUrl = `${this.config.baseUrl}$export`;

    const response = await fetch(exportUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/fhir+json',
        'Prefer': 'respond-async',
      },
    });

    if (response.status !== 202) {
      const errorText = await response.text();
      throw new Error(`Failed to kick off bulk export: ${response.status} ${errorText}`);
    }

    const contentLocation = response.headers.get('Content-Location');
    if (!contentLocation) {
      throw new Error('Bulk export kick-off did not return a Content-Location header.');
    }

    return contentLocation;
  }

  async checkBulkExportStatus(accessToken: string, statusUrl: string): Promise<any> {
    const response = await fetch(statusUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json',
      },
    });

    if (response.status === 202) {
      // Job is still in progress
      return {
        status: 'in-progress',
        progress: response.headers.get('X-Progress') || 'Not specified',
      };
    }

    if (response.status === 200) {
      // Job is complete
      const manifest = await response.json();
      return {
        status: 'complete',
        manifest: manifest,
      };
    }

    const errorText = await response.text();
    throw new Error(`Failed to check bulk export status: ${response.status} ${errorText}`);
  }

  // Utility Methods
  private auditLog(event: string, data: any): void {
    // In production, this should write to a secure audit log
    // For now, we'll use console.log with timestamp
    console.log(`[AUDIT] ${event}:`, {
      timestamp: new Date().toISOString(),
      ...data
    });
  }

  /**
   * Validate FHIR resource structure
   */
  validateResource(resource: any): boolean {
    return resource && typeof resource === 'object' && resource.resourceType;
  }

  /**
   * Extract patient ID from various FHIR references
   */
  extractPatientId(reference: string): string | null {
    const match = reference.match(/Patient\/(.+)/);
    return match ? match[1] : null;
  }

  /**
   * Format FHIR date for display
   */
  formatFHIRDate(fhirDate: string): string {
    try {
      return new Date(fhirDate).toLocaleDateString();
    } catch {
      return fhirDate;
    }
  }

  /**
   * Get human-readable name from FHIR HumanName array
   */
  getDisplayName(names: any[]): string {
    if (!names || names.length === 0) return 'Unknown';
    
    const officialName = names.find(name => name.use === 'official') || names[0];
    const given = officialName.given?.join(' ') || '';
    const family = officialName.family || '';
    
    return `${given} ${family}`.trim() || 'Unknown';
  }
}

// Export the class for dynamic imports
export default EpicFHIRClient;