# Epic FHIR API Endpoints Configuration

## Currently Implemented ✅

### Patient Management
- `Patient.Read (Demographics) (R4)` - Get patient demographics
- `Patient.Search (Demographics) (R4)` - Search for patients

### Clinical Data
- `Observation.Read (Vitals) (R4)` - Patient vital signs
- `Observation.Read (Labs) (R4)` - Laboratory results
- `Condition.Read (Problems) (R4)` - Patient conditions/problems
- `AllergyIntolerance.Read (R4)` - Patient allergies
- `MedicationRequest.Read (Signed Medication Order) (R4)` - Patient medications

### Appointments
- `Appointment.Read (Appointments) (R4)` - Patient appointments
- `Appointment.Search (Appointments) (R4)` - Search appointments

## High Priority - Recommended Next Steps 🚀

### Enhanced Clinical Data
- `DiagnosticReport.Read (Results) (R4)` - Lab and diagnostic reports
- `DiagnosticReport.Search (Results) (R4)` - Search diagnostic reports
- `Procedure.Read (Orders) (R4)` - Medical procedures
- `Procedure.Search (Orders) (R4)` - Search procedures
- `Immunization.Read (R4)` - Vaccination records
- `Immunization.Search (R4)` - Search immunizations

### Clinical Documentation
- `DocumentReference.Read (Clinical Notes) (R4)` - Clinical notes and documents
- `DocumentReference.Search (Clinical Notes) (R4)` - Search clinical documents
- `Binary.Read (Clinical Notes) (R4)` - Actual document content

### Care Management
- `CarePlan.Read (Longitudinal) (R4)` - Patient care plans
- `CarePlan.Search (Longitudinal) (R4)` - Search care plans
- `Goal.Read (Patient) (R4)` - Patient care goals
- `Goal.Search (Patient) (R4)` - Search patient goals

### Provider Information
- `Practitioner.Read (R4)` - Healthcare provider information
- `Practitioner.Search (R4)` - Search providers
- `Organization.Read (R4)` - Healthcare organizations
- `Location.Read (R4)` - Healthcare facility locations

## Medium Priority - Extended Features 📋

### Advanced Appointments
- `Appointment.$book (STU3)` - Book appointments programmatically
- `Schedule.Read (STU3)` - Provider schedules
- `Slot.Read (STU3)` - Available appointment slots

### Extended Clinical
- `FamilyMemberHistory.Read (R4)` - Family medical history
- `FamilyMemberHistory.Search (R4)` - Search family history
- `Flag.Read (Patient FYI) (R4)` - Patient alerts and flags
- `Flag.Search (Patient FYI) (R4)` - Search patient flags

### Orders and Requests
- `ServiceRequest.Read (Order Procedure) (R4)` - Service orders
- `ServiceRequest.Search (Order Procedure) (R4)` - Search service requests
- `MedicationDispense.Read (Verified Orders) (R4)` - Medication dispensing
- `DeviceRequest.Read (R4)` - Medical device requests

### Communication
- `Communication.Read (Patient Education) (R4)` - Patient communications
- `Communication.Search (Patient Education) (R4)` - Search communications

## Advanced Features - Future Enhancements 🔮

### Bulk Data Operations
- `Bulk Data Kick-off` - Initiate bulk data export
- `Bulk Data Status Request` - Check export status
- `Bulk Data File Request` - Download exported data

### Clinical Decision Support
- `CDS Hooks Framework` - Clinical decision support integration
- `CDS Hooks MedicationRequest.Create (Unsigned Order) (R4)` - Medication alerts
- `CDS Hooks ServiceRequest.Create (Unsigned Order) (R4)` - Procedure alerts

### Patient Engagement
- `Questionnaire.Read (Patient-Entered Questionnaires) (R4)` - Patient questionnaires
- `QuestionnaireResponse.Create (Patient-Entered Questionnaires) (R4)` - Patient responses
- `QuestionnaireResponse.Read (Patient-Entered Questionnaires) (R4)` - Read responses

### Financial
- `Coverage.Read (R4)` - Insurance coverage information
- `ExplanationOfBenefit.Read (Claim) (R4)` - Claims and benefits

## Implementation Recommendations

### Phase 1: Core Clinical Enhancement
1. Add DiagnosticReport endpoints for comprehensive lab results
2. Implement Procedure endpoints for surgical/medical procedures
3. Add Immunization tracking
4. Enhance clinical documentation with DocumentReference

### Phase 2: Care Coordination
1. Implement CarePlan and Goal management
2. Add Provider and Organization lookup
3. Enhance appointment booking capabilities
4. Add patient communication features

### Phase 3: Advanced Features
1. Implement bulk data operations for analytics
2. Add clinical decision support hooks
3. Integrate patient questionnaires
4. Add financial/billing information

## Security Considerations

All endpoints should implement:
- OAuth 2.0 with PKCE authentication
- Proper scope validation
- Audit logging for PHI access
- Rate limiting and retry logic
- Encryption for sensitive data storage

## Testing Strategy

For each endpoint:
1. Unit tests with mock data
2. Integration tests with Epic sandbox
3. Error handling validation
4. Performance testing
5. Security testing

## Next Steps

1. Choose endpoints from High Priority list
2. Update Epic client with new methods
3. Create corresponding API routes
4. Add TypeScript types
5. Implement UI components
6. Add comprehensive testing

Would you like me to implement any specific endpoints from this list?