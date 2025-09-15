# Epic FHIR Integration Setup Guide

## ✅ Current Status
Your Epic FHIR app is now configured and ready to test with the real Epic API!

## Configuration Summary

### Environment Variables (✅ Configured)
```env
CLIENT_ID=6a862d92-94ae-49e6-acb4-1828e2e573bf
USE_MOCK_DATA=false
REDIRECT_URI=http://localhost:3000/auth/callback
FHIR_BASE_URL=https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4/
EPIC_AUTHORIZE_URL=https://fhir.epic.com/interconnect-fhir-oauth/oauth2/authorize
EPIC_TOKEN_URL=https://fhir.epic.com/interconnect-fhir-oauth/oauth2/token
ENCRYPTION_KEY=epic_fhir_secure_encryption_key_32
```

## Testing Your Integration

### 1. Start the Development Server
```bash
npm run dev
```

### 2. Test Authentication Flow
1. Navigate to `http://localhost:3000`
2. Click "Login with Epic" 
3. You'll be redirected to Epic's OAuth2 authorization page
4. Use Epic's test credentials or your sandbox account
5. After authorization, you'll be redirected back to your app

### 3. Test Patient Data Access
Once authenticated, you can test these endpoints:

#### Patient Search
```bash
# Search for patients by name
GET /api/fhir/patients?family=Smith&given=John

# Get specific patient
GET /api/fhir/patients?id=eq081-VQEgP8drUUqCWzHfw3
```

#### Clinical Data
```bash
# Get all clinical data for a patient
GET /api/fhir/patients/eq081-VQEgP8drUUqCWzHfw3/clinical

# Get specific data types
GET /api/fhir/patients/eq081-VQEgP8drUUqCWzHfw3/clinical?type=observations
GET /api/fhir/patients/eq081-VQEgP8drUUqCWzHfw3/clinical?type=conditions
GET /api/fhir/patients/eq081-VQEgP8drUUqCWzHfw3/clinical?type=medications
GET /api/fhir/patients/eq081-VQEgP8drUUqCWzHfw3/clinical?type=allergies
```

#### Appointments
```bash
# Get patient appointments
GET /api/fhir/patients/eq081-VQEgP8drUUqCWzHfw3/appointments
```

## Epic Sandbox Test Patients

Epic provides these test patients for development:

### Test Patient IDs
- `eq081-VQEgP8drUUqCWzHfw3` - Fhir Jason (comprehensive test data)
- `erXuFYUfucBZaryVksYEcMg3` - Fhir Nancy (female patient)
- `eRry4-HEd6LlCPNk5wIz8jA3` - Fhir Derrick (pediatric patient)

### Test Credentials
When testing in Epic's sandbox, you can use:
- **Username**: `fhiruser`
- **Password**: `epicepic1`

## Available FHIR Resources

Your app currently supports these Epic FHIR endpoints:

### ✅ Implemented
- Patient demographics
- Observations (vitals, labs)
- Conditions (problems, diagnoses)
- Medications (prescriptions)
- Allergies and intolerances
- Appointments

### 🚀 Ready to Add (High Priority)
- DiagnosticReport (lab results)
- Procedure (medical procedures)
- Immunization (vaccinations)
- DocumentReference (clinical notes)
- CarePlan (care management)
- Practitioner (provider info)

## Troubleshooting

### Common Issues

#### 1. Authentication Errors
- **Error**: "Invalid client_id"
  - **Solution**: Verify your CLIENT_ID in .env matches your Epic app registration

#### 2. CORS Issues
- **Error**: "Access-Control-Allow-Origin"
  - **Solution**: Ensure your redirect URI matches exactly in Epic app settings

#### 3. Token Expired
- **Error**: "401 Unauthorized"
  - **Solution**: Implement token refresh or re-authenticate

#### 4. Scope Issues
- **Error**: "Insufficient scope"
  - **Solution**: Check that your Epic app has the required scopes enabled

### Debug Mode
To enable detailed logging, add to your .env:
```env
DEBUG=true
LOG_LEVEL=debug
```

## Next Steps

### 1. Test with Real Data
1. Start your dev server: `npm run dev`
2. Navigate to `http://localhost:3000`
3. Login with Epic credentials
4. Test patient data retrieval

### 2. Add More Endpoints
Choose from the high-priority list in `EPIC_API_ENDPOINTS.md`:
- DiagnosticReport for lab results
- Procedure for medical procedures
- Immunization for vaccination records

### 3. Production Deployment
When ready for production:
1. Register a production Epic app
2. Update environment variables
3. Configure proper SSL/HTTPS
4. Implement proper error handling
5. Add comprehensive logging

## Security Checklist

- ✅ OAuth2 with PKCE implemented
- ✅ Access tokens encrypted in storage
- ✅ Audit logging for PHI access
- ✅ Proper error handling
- ⚠️ Add rate limiting for production
- ⚠️ Implement session management
- ⚠️ Add comprehensive input validation

## Support Resources

- **Epic FHIR Documentation**: https://fhir.epic.com/
- **SMART on FHIR**: https://docs.smarthealthit.org/
- **HL7 FHIR R4**: https://hl7.org/fhir/R4/

Your Epic FHIR integration is ready to test! 🎉