# Epic Login Redirect Troubleshooting Guide

## 🚨 Common Redirect Issues & Solutions

### Issue 1: "redirect_uri_mismatch" Error

**Symptoms:**
- Epic shows "redirect_uri_mismatch" error
- User gets redirected to Epic's error page
- Console shows OAuth error

**Root Cause:**
Your `REDIRECT_URI` in `.env` doesn't exactly match what you registered in your Epic app.

**Solutions:**

1. **Check your current redirect URI:**
   ```bash
   npm run fix-redirect
   ```

2. **Visit the debug console:**
   ```
   http://localhost:3000/debug
   ```

3. **Common mismatches:**
   - ❌ `http://localhost:3000/auth/callback/` (trailing slash)
   - ✅ `http://localhost:3000/auth/callback`
   
   - ❌ `https://localhost:3000/auth/callback` (HTTPS in dev)
   - ✅ `http://localhost:3000/auth/callback`
   
   - ❌ `http://localhost:3001/auth/callback` (wrong port)
   - ✅ `http://localhost:3000/auth/callback`

### Issue 2: "state_mismatch" or "state_expired" Error

**Symptoms:**
- Error page shows "Authentication state doesn't match"
- Error occurs after Epic redirects back

**Root Cause:**
- Session expired (>10 minutes)
- Browser cookies disabled/cleared
- Multiple auth attempts

**Solutions:**

1. **Clear browser data:**
   - Clear cookies for localhost:3000
   - Clear browser cache
   - Try incognito/private mode

2. **Complete auth quickly:**
   - Don't leave Epic auth page open >10 minutes
   - Don't refresh during auth flow

3. **Check cookie settings:**
   - Ensure cookies are enabled
   - Check for cookie-blocking extensions

### Issue 3: "invalid_client" Error

**Symptoms:**
- Epic shows "invalid_client" error
- Auth flow fails immediately

**Root Cause:**
- Wrong `CLIENT_ID` in `.env`
- Client ID not registered with Epic

**Solutions:**

1. **Verify your Client ID:**
   ```bash
   # Check your .env file
   cat .env | grep CLIENT_ID
   ```

2. **Confirm Epic registration:**
   - Visit https://fhir.epic.com/Developer
   - Check your app's Client ID
   - Ensure it matches your `.env` exactly

### Issue 4: Development Server Issues

**Symptoms:**
- "Connection refused" errors
- Redirect fails to load your app

**Root Cause:**
- Dev server not running
- Running on wrong port
- Firewall blocking connections

**Solutions:**

1. **Ensure dev server is running:**
   ```bash
   npm run dev
   ```

2. **Check the correct port:**
   ```bash
   # Should show "ready on http://localhost:3000"
   ```

3. **Test your callback endpoint:**
   ```bash
   curl http://localhost:3000/auth/callback
   # Should return a redirect or error page, not connection refused
   ```

## 🔧 Quick Fixes

### Fix 1: Reset Your Configuration
```bash
# Run the automatic fix script
npm run fix-redirect

# Or manually update .env
REDIRECT_URI=http://localhost:3000/auth/callback
```

### Fix 2: Clear All Auth State
```bash
# Clear browser cookies and try again
# Or use incognito mode
```

### Fix 3: Verify Epic App Settings
1. Go to https://fhir.epic.com/Developer
2. Find your app
3. Check "Redirect URIs" section
4. Ensure it contains: `http://localhost:3000/auth/callback`

## 🔍 Debugging Tools

### 1. Debug Console
Visit: `http://localhost:3000/debug`
- Shows current configuration
- Displays generated auth URL
- Lists common issues

### 2. Browser Developer Tools
1. Open DevTools (F12)
2. Go to Network tab
3. Try login flow
4. Check for failed requests

### 3. Server Logs
```bash
# Start dev server with verbose logging
npm run dev

# Watch for auth-related logs
```

## 📋 Checklist Before Testing

- [ ] Dev server running on port 3000
- [ ] `.env` file has correct `CLIENT_ID`
- [ ] `REDIRECT_URI=http://localhost:3000/auth/callback` (no trailing slash)
- [ ] Epic app registered with same redirect URI
- [ ] Browser cookies enabled
- [ ] No ad blockers interfering

## 🆘 Still Having Issues?

1. **Check the debug console:** `http://localhost:3000/debug`
2. **Run the fix script:** `npm run fix-redirect`
3. **Try incognito mode** to rule out browser issues
4. **Check Epic's status page** for service issues
5. **Review browser console** for JavaScript errors

## 📞 Epic-Specific Help

- **Epic Developer Portal:** https://fhir.epic.com/Developer
- **Epic FHIR Documentation:** https://fhir.epic.com/Documentation
- **SMART on FHIR Spec:** https://docs.smarthealthit.org/

Remember: The redirect URI must match **exactly** between your `.env` file and your Epic app registration. Even a single character difference will cause the auth flow to fail.