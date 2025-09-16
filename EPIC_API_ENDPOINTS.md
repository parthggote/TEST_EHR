# Epic FHIR API Endpoints Configuration

This document provides a structured overview of Epic FHIR API endpoints, categorized by workflow for **Patient Dashboard** and **Clinician Dashboard**, including descriptions, usage, and implementation recommendations.

---

## 1. Patient Dashboard APIs
Endpoints that are primarily used to provide patients with their health information and appointments.

| Category | Endpoint | FHIR Version | Description / Usage |
|----------|----------|--------------|-------------------|
| **Patient Management** | `Patient.Read` | R4 | Retrieve detailed patient demographics (name, date of birth, contact info). |
|  | `Patient.Search` | R4 | Search for patients by parameters such as name, MRN, or identifiers. |
| **Clinical Data** | `Observation.Read` | R4 | Fetch patient vitals such as blood pressure, heart rate, temperature. |
|  | `Observation.Read (Labs)` | R4 | Retrieve lab results for the patient. |
|  | `Condition.Read` | R4 | List active and historical conditions or problems. |
|  | `AllergyIntolerance.Read` | R4 | Retrieve allergy records and intolerances. |
|  | `MedicationRequest.Read` | R4 | Access signed medication orders for the patient. |
| **Appointments** | `Appointment.Read` | R4 | Get scheduled appointments. |
|  | `Appointment.Search` | R4 | Search appointments using date, provider, or location filters. |
| **Clinical Documentation** | `DocumentReference.Read` | R4 | Retrieve clinical notes and documents. |
|  | `DocumentReference.Search` | R4 | Search documents by date, type, or author. |
|  | `Binary.Read` | R4 | Access the actual file contents of clinical documents (PDF, images). |
| **Financial / Insurance** | `Coverage.Read` | R4 | Fetch patient insurance coverage information. |
|  | `ExplanationOfBenefit.Read` | R4 | Retrieve claim details and benefits. |

---

## 2. Clinician Dashboard APIs
Endpoints used by clinicians to manage patient care, procedures, communication, and advanced features.

| Category | Endpoint | FHIR Version | Description / Usage |
|----------|----------|--------------|-------------------|
| **Enhanced Clinical Data** | `DiagnosticReport.Read` | R4 | Retrieve lab and diagnostic reports. |
|  | `DiagnosticReport.Search` | R4 | Search reports by date, type, or status. |
|  | `Procedure.Read` | R4 | Access medical procedures (completed or scheduled). |
|  | `Procedure.Search` | R4 | Search procedures by patient or procedure type. |
|  | `Immunization.Read` | R4 | Retrieve vaccination records. |
|  | `Immunization.Search` | R4 | Search immunizations by type or date. |
| **Provider & Organization Info** | `Practitioner.Read` | R4 | Fetch clinician information (name, role, credentials). |
|  | `Practitioner.Search` | R4 | Search providers by specialty or department. |
|  | `Organization.Read` | R4 | Access healthcare organization details. |
|  | `Location.Read` | R4 | Retrieve location/facility details. |
| **Advanced Appointments** | `Appointment.$book` | STU3 | Programmatically book appointments for patients. |
|  | `Schedule.Read` | STU3 | Access provider schedules. |
|  | `Slot.Read` | STU3 | List available appointment slots. |
| **Extended Clinical** | `FamilyMemberHistory.Read` | R4 | Retrieve patient family medical history. |
|  | `FamilyMemberHistory.Search` | R4 | Search family history by relation or condition. |
|  | `Flag.Read` | R4 | View patient alerts or flags (clinical FYI). |
|  | `Flag.Search` | R4 | Search patient flags by type or severity. |
| **Orders & Requests** | `ServiceRequest.Read` | R4 | Access orders for procedures or services. |
|  | `ServiceRequest.Search` | R4 | Search service requests by patient or type. |
|  | `MedicationDispense.Read` | R4 | View verified medication dispensing. |
|  | `DeviceRequest.Read` | R4 | Retrieve medical device orders. |
| **Communication & Patient Education** | `Communication.Read` | R4 | Access patient education messages or communications. |
|  | `Communication.Search` | R4 | Search communications by type, date, or sender. |
| **Advanced / Future Enhancements** | Bulk Data Operations | R4 | Initiate bulk exports, check status, and download files for analytics. |

---

## 3. Implementation Recommendations

### Phase 1: Core Clinical Enhancement
- Implement **DiagnosticReport**, **Procedure**, and **Immunization** endpoints for complete clinical data.
- Enhance **DocumentReference** access for clinical documentation.

### Phase 2: Care Coordination
- Add **Provider** and **Organization** endpoints.
- Enhance appointment management and patient communication features.

### Phase 3: Advanced Features
- Add **Bulk Data Operations** for analytics and reporting.
- Incorporate financial and insurance information.

---

## 4. Security Considerations
- OAuth 2.0 with PKCE authentication for all endpoints.
- Proper **scope validation** per endpoint.
- **Audit logging** for all PHI access.
- **Rate limiting** and **retry logic**.
- Encryption for sensitive data at rest and in transit.

---

## 5. Testing Strategy
For each endpoint:
- **Unit tests** with mock data.
- **Integration tests** with Epic sandbox environment.
- **Error handling validation**.
- **Performance testing**.
- **Security testing**.

---

## 6. Next Steps
1. Prioritize endpoints from **High Priority list** for initial implementation.
2. Update Epic client with new API methods.
3. Create corresponding API routes and UI components.
4. Add **TypeScript types** for frontend integration.
5. Implement comprehensive testing strategy.
