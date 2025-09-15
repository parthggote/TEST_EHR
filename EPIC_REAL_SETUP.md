# Epic FHIR Real API Integration Setup

## 🏥 Step-by-Step Epic Integration

### Step 1: Register Your Epic Application

1. **Visit Epic's Developer Portal**: https://fhir.epic.com/Developer
2. **Create Account**: Use your professional email
3. **Submit App Registration Form**:
   - **App Name**: "EHR Integration Dashboard"
   - **App Type**: "Public Client" (SMART on FHIR)
   - **Redirect URI**: `http://localhost:3000/auth/callback`
   - **Scopes**: 
     - `patient/*.read` (Read patient data)
     - `user/*.read` (Read user data)
     - `launch` (Launch context)
     - `openid` (OpenID Connect)
     - `profile` (User profile)
   - **FHIR Version**: R4

### Step 2: Get Your Client ID

After approval, Epic will provide:
- **Client ID**: Your unique application identifier
- **Sandbox Access**: Access to Epic's test environment

### Step 3: Configure Environment Variables

Update your `.env` file with your actual Epic credentials:

```env
# Epic FHIR Configuration
CLIENT_ID=your_actual_epic_client_id_from_registration
REDIRECT_URI=http://localhost:3000/auth/callback
FHIR_BASE_URL=https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4/

# Epic OAuth2 Endpoints
EPIC_AUTHORIZE_URL=https://fhir.epic.com/interconnect-fhir-oauth/oauth2/authorize
EPIC_TOKEN_URL=https://fhir.epic.com/interconnect-fhir-oauth/oauth2/token

# Disable mock data to use real Epic API
USE_MOCK_DATA=false

# Security (generate secure values)
NEXTAUTH_SECRET=your_secure_random_string_32_chars
NEXTAUTH_URL=http://localhost:3000
ENCRYPTION_KEY=your_32_character_encryption_key_here

# Environment
NODE_ENV=development
```

### Step 4: Generate Secure Keys

Generate secure keys for production use:

```bash
# Generate NEXTAUTH_SECRET (32 characters)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generate ENCRYPTION_KEY (32 characters)
node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"
```

### Step 5: Test Epic Integration

1. **Start Development Server**:
   ```bash
   npm run dev
   ```

2. **Test Authentication Flow**:
   - Visit `http://localhost:3000`
   - Click "Connect to Epic MyChart"
   - You'll be redirected to Epic's OAuth2 server
   - Login with Epic test credentials or your own Epic MyChart account
   - Grant permissions for data access
   - You'll be redirected back to the dashboard

3. **Available Test Data**:
   - **Test Patient**: Jason Fhir (ID: eq081-VQEgP8drUUqCWzHfw3)
   - **Test Organization**: Epic Test Organization
   - **Available Data**: Demographics, appointments, observations, conditions

## 🔧 Epic Sandbox Testing

### Test Credentials (Epic Sandbox)
Epic provides public test credentials for sandbox testing:
- **Username**: Use Epic's test patient accounts
- **Password**: Provided by Epic for sandbox testing

### Test Patient Data
Epic's sandbox includes realistic test data:
- Patient demographics
- Vital signs and observations
- Medical conditions
- Medications
- Appointments
- Allergies and intolerances

## 🚀 Production Deployment

### For Production Use:

1. **SSL Certificate Required**: Epic requires HTTPS for production
2. **Update Redirect URI**: Change to your production domain
3. **Environment Variables**: Use production-grade secrets
4. **Epic App Review**: Submit for Epic's app review process

### Production Environment Variables:
```env
CLIENT_ID=your_production_epic_client_id
REDIRECT_URI=https://yourdomain.com/auth/callback
NEXTAUTH_URL=https://yourdomain.com
USE_MOCK_DATA=false
NODE_ENV=production
```

## 🔍 Testing the Integration

### 1. Authentication Flow Test
```bash
# Start the server
npm run dev

# Visit in browser
http://localhost:3000

# Click "Connect to Epic MyChart"
# Should redirect to Epic OAuth2 server
```

### 2. API Endpoints Test
```bash
# Test patient search (after authentication)
curl -X GET "http://localhost:3000/api/fhir/patients?family=Fhir&given=Jason" \
  -H "Cookie: your_session_cookie"

# Test patient data
curl -X GET "http://localhost:3000/api/fhir/patients/eq081-VQEgP8drUUqCWzHfw3/clinical?type=all" \
  -H "Cookie: your_session_cookie"
```

### 3. Use Postman Collection
Import the provided `postman-collection.json` and:
1. Set your base URL to `http://localhost:3000`
2. Complete the authentication flow
3. Test all FHIR endpoints

## 🛠️ Troubleshooting

### Common Issues:

**"Invalid client_id" Error**
- Verify CLIENT_ID matches your Epic registration exactly
- Check that your app is approved by Epic

**"Redirect URI mismatch" Error**
- Ensure REDIRECT_URI exactly matches your Epic app registration
- Check for trailing slashes or protocol mismatches

**"Insufficient scope" Error**
- Verify your Epic app has the required scopes approved
- Check that you're requesting the correct scopes in the auth flow

**CORS Errors**
- Epic requires proper CORS configuration
- Ensure your domain is registered with Epic

**403 Forbidden Errors**
- This typically means your requests aren't coming from an approved domain
- For development, ensure you're using localhost
- For production, ensure your domain is registered with Epic

### Debug Mode
Enable detailed logging:
```env
DEBUG=epic:*
NODE_ENV=development
```

## 📊 Available FHIR Resources

Epic's sandbox supports these FHIR R4 resources:
- **Patient**: Demographics, contact info
- **Observation**: Vital signs, lab results
- **Condition**: Diagnoses, problems
- **MedicationRequest**: Prescriptions
- **AllergyIntolerance**: Allergies, adverse reactions
- **Appointment**: Scheduled appointments
- **Practitioner**: Healthcare providers
- **Organization**: Healthcare organizations

## 🔐 Security Best Practices

1. **Never commit credentials** to version control
2. **Use environment variables** for all sensitive data
3. **Implement proper session management**
4. **Encrypt all PHI data** at rest and in transit
5. **Implement audit logging** for all data access
6. **Follow HIPAA compliance** guidelines

## 📚 Epic FHIR Documentation

- [Epic FHIR API Documentation](https://fhir.epic.com/)
- [SMART on FHIR Specification](http://hl7.org/fhir/smart-app-launch/)
- [Epic App Orchard](https://apporchard.epic.com/)
- [FHIR R4 Specification](http://hl7.org/fhir/R4/)

## 🆘 Support

If you encounter issues:
1. Check Epic's developer documentation
2. Review the Epic developer forums
3. Ensure your app registration is complete and approved
4. Verify all environment variables are correctly set