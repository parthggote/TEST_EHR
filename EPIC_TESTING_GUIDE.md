# Epic FHIR Testing Guide

## 🔑 Epic Test Credentials

### Standard Test Accounts
Epic provides these test accounts for sandbox testing:

| Username | Password | Patient Type |
|----------|----------|--------------|
| `fhiruser` | `epicepic1` | General test patient |
| `fhirjason` | `epicepic1` | Jason Argonaut (comprehensive data) |
| `fhirnancy` | `epicepic1` | Nancy Smart (female patient) |
| `fhirderrick` | `epicepic1` | Derrick Lin (pediatric patient) |

### Test Patient IDs
These correspond to the test accounts above:
- `eq081-VQEgP8drUUqCWzHfw3` - Jason Argonaut
- `erXuFYUfucBZaryVksYEcMg3` - Nancy Smart  
- `eRry4-HEd6LlCPNk5wIz8jA3` - Derrick Lin

## 🧪 Complete Testing Flow

### Step 1: Start Your App
```bash
npm run dev
```

### Step 2: Initiate Login
1. Visit `http://localhost:3000`
2. Click "Login with Epic"
3. Your app redirects to Epic's MyChart login page

### Step 3: Login with Test Credentials
On Epic's MyChart login page:
1. Enter username: `fhiruser`
2. Enter password: `epicepic1`
3. Click "Sign In"

### Step 4: Grant Permissions (if prompted)
Epic may show a consent screen asking to:
- Allow access to your health information
- Grant permissions for the requested scopes
- Click "Allow" or "Authorize"

### Step 5: Successful Redirect
Epic redirects back to your app:
```
http://localhost:3000/auth/callback?code=...&state=...
```

### Step 6: Access Patient Data
Your app should now redirect to the dashboard with patient data.

## 🔧 Testing Different Scenarios

### Test 1: Basic Patient Data
```bash
# After login, test these endpoints:
curl "http://localhost:3000/api/fhir/patients?id=eq081-VQEgP8drUUqCWzHfw3"
```

### Test 2: Clinical Data
```bash
# Get patient observations
curl "http://localhost:3000/api/fhir/patients/eq081-VQEgP8drUUqCWzHfw3/clinical?type=observations"
```

### Test 3: Appointments
```bash
# Get patient appointments
curl "http://localhost:3000/api/fhir/patients/eq081-VQEgP8drUUqCWzHfw3/appointments"
```

## 🚨 Troubleshooting Test Credentials

### Issue 1: "Invalid username or password"
**Solutions:**
1. Try different test accounts (fhirjason, fhirnancy, etc.)
2. Check if your Epic app needs approval
3. Verify your app is configured for sandbox access

### Issue 2: "Access denied" after login
**Solutions:**
1. Check your app's scope permissions
2. Verify redirect URI matches exactly
3. Ensure your app is approved for patient data access

### Issue 3: Credentials work but no data
**Solutions:**
1. Check if your app has the right FHIR resource permissions
2. Verify the patient ID matches the test account
3. Check server logs for API errors

## 🔍 Debug Your Test Flow

### Check Auth URL Generation
```bash
# Visit this to see your OAuth parameters
http://localhost:3000/api/epic-test
```

### Monitor Server Logs
```bash
# Watch for auth flow logs
npm run dev
# Look for "Epic Config" and "Generated auth URL" logs
```

### Test Callback Processing
```bash
# Check if callback endpoint works
curl "http://localhost:3000/auth/callback"
# Should return redirect or error page
```

## 📋 Epic App Registration Checklist

Ensure your Epic app has:
- ✅ **App Type:** FHIR R4 / SMART on FHIR
- ✅ **Client ID:** `be416414-856f-43d6-8375-1c3ad3c0b8bc`
- ✅ **Redirect URI:** `http://localhost:3000/auth/callback`
- ✅ **Scopes:** `patient/*.read`, `openid`, `profile`
- ✅ **Sandbox Access:** Enabled
- ✅ **Test Patients:** Assigned or available

## 🎯 Success Indicators

You'll know testing is working when:
1. ✅ Epic login page loads
2. ✅ Test credentials are accepted
3. ✅ Epic redirects back to your app
4. ✅ Your app shows patient dashboard
5. ✅ API calls return patient data

## 📞 Getting Help

If test credentials still don't work:
1. **Check Epic Developer Portal** for app-specific instructions
2. **Contact Epic Support** for sandbox access issues
3. **Verify app approval status** in your developer account
4. **Try creating a new Epic app** if current one has issues

Remember: Test credentials are entered on **Epic's login page**, not in your app code!