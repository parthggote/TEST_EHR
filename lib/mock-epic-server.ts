/**
 * Mock Epic FHIR Server
 * Provides mock data for development and testing
 */

import {
  Patient,
  FHIRBundle,
  Appointment,
  Observation,
  Condition,
  MedicationRequest,
  AllergyIntolerance,
  EpicTokenResponse
} from './types/fhir';

export class MockEpicServer {
  static mockTokenExchange(): EpicTokenResponse {
    return {
      access_token: 'mock_access_token_' + Date.now(),
      token_type: 'Bearer',
      expires_in: 3600,
      scope: 'patient/*.read user/*.read launch openid profile',
      patient: 'mock-patient-123'
    };
  }

  static getPatient(patientId: string): Patient {
    return {
      resourceType: 'Patient',
      id: patientId,
      meta: {
        lastUpdated: '2024-01-15T10:30:00Z'
      },
      identifier: [
        {
          use: 'usual',
          system: 'http://hospital.smarthealthit.org',
          value: patientId
        }
      ],
      active: true,
      name: [
        {
          use: 'official',
          family: 'Doe',
          given: ['John', 'Michael']
        }
      ],
      telecom: [
        {
          system: 'phone',
          value: '555-0123',
          use: 'home'
        },
        {
          system: 'email',
          value: 'john.doe@example.com',
          use: 'home'
        }
      ],
      gender: 'male',
      birthDate: '1985-03-15',
      address: [
        {
          use: 'home',
          type: 'both',
          line: ['123 Main St', 'Apt 4B'],
          city: 'Boston',
          state: 'MA',
          postalCode: '02101',
          country: 'US'
        }
      ]
    };
  }

  static searchPatients(params: { family?: string; given?: string; birthdate?: string; identifier?: string }): FHIRBundle {
    const patients = [
      MockEpicServer.getPatient('mock-patient-123'),
      {
        ...MockEpicServer.getPatient('mock-patient-456'),
        name: [{ use: 'official', family: 'Smith', given: ['Jane'] }],
        gender: 'female' as const,
        birthDate: '1990-07-22'
      }
    ];

    // Simple filtering based on search params
    let filteredPatients = patients;
    if (params.family) {
      filteredPatients = patients.filter(p => 
        p.name?.[0]?.family?.toLowerCase().includes(params.family!.toLowerCase())
      );
    }

    return {
      resourceType: 'Bundle',
      type: 'searchset',
      total: filteredPatients.length,
      entry: filteredPatients.map(patient => ({
        resource: patient,
        search: { mode: 'match' }
      }))
    };
  }

  static getPatientObservations(patientId: string): FHIRBundle {
    const observations: Observation[] = [
      {
        resourceType: 'Observation',
        id: 'obs-vitals-1',
        status: 'final',
        category: [
          {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/observation-category',
                code: 'vital-signs',
                display: 'Vital Signs'
              }
            ]
          }
        ],
        code: {
          coding: [
            {
              system: 'http://loinc.org',
              code: '8480-6',
              display: 'Systolic blood pressure'
            }
          ]
        },
        subject: {
          reference: `Patient/${patientId}`
        },
        effectiveDateTime: '2024-01-15T10:30:00Z',
        valueQuantity: {
          value: 120,
          unit: 'mmHg',
          system: 'http://unitsofmeasure.org',
          code: 'mm[Hg]'
        }
      },
      {
        resourceType: 'Observation',
        id: 'obs-lab-1',
        status: 'final',
        category: [
          {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/observation-category',
                code: 'laboratory',
                display: 'Laboratory'
              }
            ]
          }
        ],
        code: {
          coding: [
            {
              system: 'http://loinc.org',
              code: '33747-0',
              display: 'Hemoglobin A1c'
            }
          ]
        },
        subject: {
          reference: `Patient/${patientId}`
        },
        effectiveDateTime: '2024-01-10T09:00:00Z',
        valueQuantity: {
          value: 6.2,
          unit: '%',
          system: 'http://unitsofmeasure.org',
          code: '%'
        }
      }
    ];

    return {
      resourceType: 'Bundle',
      type: 'searchset',
      total: observations.length,
      entry: observations.map(obs => ({
        resource: obs,
        search: { mode: 'match' }
      }))
    };
  }

  static getPatientConditions(patientId: string): FHIRBundle {
    const conditions: Condition[] = [
      {
        resourceType: 'Condition',
        id: 'condition-1',
        clinicalStatus: {
          coding: [
            {
              system: 'http://terminology.hl7.org/CodeSystem/condition-clinical',
              code: 'active'
            }
          ]
        },
        verificationStatus: {
          coding: [
            {
              system: 'http://terminology.hl7.org/CodeSystem/condition-ver-status',
              code: 'confirmed'
            }
          ]
        },
        category: [
          {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/condition-category',
                code: 'problem-list-item',
                display: 'Problem List Item'
              }
            ]
          }
        ],
        code: {
          coding: [
            {
              system: 'http://snomed.info/sct',
              code: '73211009',
              display: 'Diabetes mellitus'
            }
          ]
        },
        subject: {
          reference: `Patient/${patientId}`
        },
        onsetDateTime: '2020-05-15',
        recordedDate: '2020-05-15T14:30:00Z'
      }
    ];

    return {
      resourceType: 'Bundle',
      type: 'searchset',
      total: conditions.length,
      entry: conditions.map(condition => ({
        resource: condition,
        search: { mode: 'match' }
      }))
    };
  }

  static getPatientMedications(patientId: string): FHIRBundle {
    const medications: MedicationRequest[] = [
      {
        resourceType: 'MedicationRequest',
        id: 'med-1',
        status: 'active',
        intent: 'order',
        medicationCodeableConcept: {
          coding: [
            {
              system: 'http://www.nlm.nih.gov/research/umls/rxnorm',
              code: '860975',
              display: 'Metformin 500 MG Oral Tablet'
            }
          ]
        },
        subject: {
          reference: `Patient/${patientId}`
        },
        authoredOn: '2024-01-01T10:00:00Z',
        dosageInstruction: [
          {
            text: 'Take 1 tablet by mouth twice daily with meals',
            timing: {
              repeat: {
                frequency: 2,
                period: 1,
                periodUnit: 'd'
              }
            }
          }
        ]
      }
    ];

    return {
      resourceType: 'Bundle',
      type: 'searchset',
      total: medications.length,
      entry: medications.map(med => ({
        resource: med,
        search: { mode: 'match' }
      }))
    };
  }

  static getPatientAllergies(patientId: string): FHIRBundle {
    const allergies: AllergyIntolerance[] = [
      {
        resourceType: 'AllergyIntolerance',
        id: 'allergy-1',
        clinicalStatus: {
          coding: [
            {
              system: 'http://terminology.hl7.org/CodeSystem/allergyintolerance-clinical',
              code: 'active'
            }
          ]
        },
        verificationStatus: {
          coding: [
            {
              system: 'http://terminology.hl7.org/CodeSystem/allergyintolerance-verification',
              code: 'confirmed'
            }
          ]
        },
        type: 'allergy',
        category: ['medication'],
        criticality: 'high',
        code: {
          coding: [
            {
              system: 'http://www.nlm.nih.gov/research/umls/rxnorm',
              code: '7980',
              display: 'Penicillin'
            }
          ]
        },
        patient: {
          reference: `Patient/${patientId}`
        },
        recordedDate: '2020-01-15T10:00:00Z',
        reaction: [
          {
            manifestation: [
              {
                coding: [
                  {
                    system: 'http://snomed.info/sct',
                    code: '247472004',
                    display: 'Hives'
                  }
                ]
              }
            ],
            severity: 'moderate'
          }
        ]
      }
    ];

    return {
      resourceType: 'Bundle',
      type: 'searchset',
      total: allergies.length,
      entry: allergies.map(allergy => ({
        resource: allergy,
        search: { mode: 'match' }
      }))
    };
  }

  static getPatientAppointments(patientId: string): FHIRBundle {
    const appointments: Appointment[] = [
      {
        resourceType: 'Appointment',
        id: 'appt-1',
        status: 'booked',
        serviceType: [
          {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/service-type',
                code: '124',
                display: 'General Practice'
              }
            ]
          }
        ],
        description: 'Annual physical examination',
        start: '2024-02-15T10:00:00Z',
        end: '2024-02-15T11:00:00Z',
        minutesDuration: 60,
        participant: [
          {
            actor: {
              reference: `Patient/${patientId}`,
              display: 'John Doe'
            },
            required: 'required',
            status: 'accepted'
          },
          {
            actor: {
              reference: 'Practitioner/dr-smith',
              display: 'Dr. Smith'
            },
            required: 'required',
            status: 'accepted'
          }
        ]
      }
    ];

    return {
      resourceType: 'Bundle',
      type: 'searchset',
      total: appointments.length,
      entry: appointments.map(appt => ({
        resource: appt,
        search: { mode: 'match' }
      }))
    };
  }
}