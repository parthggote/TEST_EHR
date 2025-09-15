# Epic FHIR Integration Dashboard

A secure, HIPAA-compliant Next.js dashboard for integrating with Epic's FHIR API using SMART on FHIR OAuth2 standards.

## 🏥 Features

### Core Modules
- **Patient Management**: Search, view demographics, and manage patient data
- **Appointments**: Schedule, view, and manage appointments
- **Clinical Data**: Access vitals, lab results, observations, and conditions
- **Medications**: View current and past medications with dosage information
- **Allergies**: Track known allergies and adverse reactions
- **Reports**: Generate clinical reports and analytics

### Security & Compliance
- ✅ SMART on FHIR OAuth2 Authorization Code Flow with PKCE
- ✅ AES-256 encryption for PHI data
- ✅ HTTP-only secure cookies for token storage
- ✅ Comprehensive audit logging
- ✅ HIPAA-compliant architecture
- ✅ Token refresh handling
- ✅ Rate limiting and retry logic

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm/pnpm
- Epic FHIR application credentials (for real API) OR use mock mode for development

### 1. Clone and Install
```bash
git clone <repository-url>
cd epic-fhir-dashboard
npm install
```

### 2. Easy Setup (Recommended)
Run the interactive setup script:

```bash
npm run setup:epic
```

This will guide you through:
- Choosing between Mock Data or Real Epic API
- Generating secure keys
- Creating the proper .env configuration

### 3. Manual Setup (Alternative)

#### Option A: Mock Data Mode (No Epic Registration Required)
```env
CLIENT_ID=
USE_MOCK_DATA=true
NEXTAUTH_SECRET=your_secure_random_string
ENCRYPTION_KEY=your_32_character_key
```

#### Option B: Real Epic API Mode
1. Register at [Epic Developer Portal](https://fhir.epic.com/Developer)
2. Get your Client ID
3. Configure:
```env
CLIENT_ID=your_epic_client_id
USE_MOCK_DATA=false
REDIRECT_URI=http://localhost:3000/auth/callback
NEXTAUTH_SECRET=your_secure_random_string
ENCRYPTION_KEY=your_32_character_key
```

### 4. Run Development Server
```bash
npm run dev
```

### 5. Test the Integration
- **Status Check**: Visit `http://localhost:3000/status`
- **Mock Demo**: Visit `http://localhost:3000/demo` (mock mode)
- **Real Integration**: Click "Connect to Epic MyChart" (real API mode)

## 📋 Epic App Registration (For Real API)

### Required Settings:
- **App Type**: Public Client (SMART on FHIR)
- **Redirect URI**: `http://localhost:3000/auth/callback`
- **Scopes**: `patient/*.read`, `user/*.read`, `launch`, `openid`, `profile`
- **FHIR Version**: R4

### Test Credentials:
Epic provides test patient data:
- **Test Patient**: Jason Fhir (ID: eq081-VQEgP8drUUqCWzHfw3)
- **Sandbox URL**: https://fhir.epic.com/

## 📁 Project Structure

```
├── app/
│   ├── api/
│   │   ├── auth/           # Authentication routes
│   │   └── fhir/           # FHIR API routes
│   ├── auth/               # Auth pages
│   ├── dashboard/          # Main dashboard
│   └── page.tsx           # Landing page
├── components/
│   ├── ui/                # shadcn/ui components
│   └── dashboard-layout.tsx
├── lib/
│   ├── types/
│   │   └── fhir.ts        # FHIR type definitions
│   ├── epic-client.ts     # Epic FHIR client
│   └── utils.ts
├── hooks/                 # Custom React hooks
└── public/               # Static assets
```

## 🔐 Authentication Flow

1. **Login**: User clicks "Login with Epic" → redirects to Epic OAuth2
2. **Authorization**: User grants permissions in Epic MyChart
3. **Callback**: Epic redirects back with authorization code
4. **Token Exchange**: Server exchanges code for access token using PKCE
5. **Secure Storage**: Tokens encrypted and stored in HTTP-only cookies
6. **Dashboard Access**: User can now access FHIR data

## 🛡️ Security Features

### Data Protection
- All PHI data encrypted at rest and in transit
- Tokens stored in HTTP-only, secure cookies
- CSRF protection with state parameter validation
- Input validation and sanitization

### Audit Logging
- All FHIR API calls logged with timestamps
- Authentication events tracked
- Error events recorded for monitoring
- No PHI data in logs (HIPAA compliant)

### Error Handling
- Graceful handling of Epic API errors
- Retry logic with exponential backoff
- User-friendly error messages
- Automatic token refresh

## 📊 API Endpoints

### Authentication
- `GET /api/auth/login` - Initiate Epic OAuth2 flow
- `GET /api/auth/callback` - Handle OAuth2 callback
- `POST /api/auth/logout` - Clear session and tokens
- `GET /api/auth/session` - Get current session info

### FHIR Data
- `GET /api/fhir/patients` - Search patients
- `GET /api/fhir/patients/[id]/appointments` - Patient appointments
- `GET /api/fhir/patients/[id]/clinical` - Clinical data
- `POST /api/fhir/patients/[id]/appointments` - Create appointment

## 🧪 Testing

### Unit Tests
```bash
pnpm test
```

### E2E Tests
```bash
pnpm test:e2e
```

### Epic Sandbox Testing
1. Use Epic's sandbox environment for testing
2. Test patient: Fhir, Jason (ID: eq081-VQEgP8drUUqCWzHfw3)
3. Available test scenarios in Epic's documentation

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Update `REDIRECT_URI` to your production domain
4. Deploy with automatic SSL

### Manual Deployment
1. Build the application: `pnpm build`
2. Start production server: `pnpm start`
3. Ensure SSL certificate is configured
4. Update Epic app registration with production URLs

### Environment-Specific Configuration
- **Development**: Use Epic sandbox endpoints
- **Staging**: Use Epic sandbox with production-like setup
- **Production**: Use Epic production endpoints with proper SSL

## 📋 Epic Integration Checklist

- [ ] Epic App Orchard registration completed
- [ ] Client ID and redirect URI configured
- [ ] SSL certificate installed (production)
- [ ] FHIR scopes properly requested
- [ ] Error handling implemented
- [ ] Audit logging configured
- [ ] Token refresh handling
- [ ] HIPAA compliance review

## 🔧 Configuration Options

### Scopes
Configure required FHIR scopes in the login flow:
- `patient/*.read` - Read patient data
- `user/*.read` - Read user data
- `launch` - Launch context
- `openid profile` - User identity

### Rate Limiting
Epic enforces rate limits:
- 1000 requests per hour per client
- Automatic retry with exponential backoff implemented

### Token Management
- Access tokens expire in 1 hour
- Refresh tokens valid for 30 days
- Automatic refresh before expiration

## 🆘 Troubleshooting

### Common Issues

**"Invalid client" error**
- Verify CLIENT_ID matches Epic registration
- Check redirect URI exactly matches registration

**"Scope not granted" error**
- Ensure requested scopes are approved in Epic
- Check user has necessary permissions

**Token expired errors**
- Implement proper token refresh logic
- Check system clock synchronization

**CORS errors**
- Verify domain is registered with Epic
- Check SSL certificate is valid

### Debug Mode
Enable debug logging:
```env
NODE_ENV=development
DEBUG=epic:*
```

## 📚 Resources

- [Epic FHIR Documentation](https://fhir.epic.com/)
- [SMART on FHIR Specification](http://hl7.org/fhir/smart-app-launch/)
- [Epic App Orchard](https://apporchard.epic.com/)
- [FHIR R4 Specification](http://hl7.org/fhir/R4/)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## ⚠️ Disclaimer

This is a demonstration application. For production use:
- Conduct thorough security review
- Implement additional monitoring
- Follow your organization's HIPAA compliance procedures
- Test extensively with Epic's sandbox environment