# Epic FHIR Integration Dashboard

A secure, HIPAA-compliant **Next.js dashboard** for integrating with Epic's FHIR API using **SMART on FHIR OAuth2 standards**.

GitHub Repository: [https://github.com/parthggote/TEST_EHR](https://github.com/parthggote/TEST_EHR)

---

## 🏥 Features

### Core Modules
| Module | Description |
|--------|-------------|
| **Patient Management** | Search, view demographics, and manage patient data |
| **Appointments** | Schedule, view, and manage appointments |
| **Clinical Data** | Access vitals, lab results, observations, and conditions |
| **Medications** | View current and past medications with dosage information |
| **Allergies** | Track known allergies and adverse reactions |
| **Reports** | Generate clinical reports and analytics |

### Security & Compliance
- ✅ SMART on FHIR OAuth2 Authorization Code Flow with PKCE  
- ✅ AES-256 encryption for PHI data  
- ✅ HTTP-only secure cookies for token storage  
- ✅ Comprehensive audit logging  
- ✅ HIPAA-compliant architecture  
- ✅ Token refresh handling  
- ✅ Rate limiting and retry logic  

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm/pnpm  
- Epic FHIR application credentials (for real API) OR use **mock mode** for development  

### 1. Clone and Install
```bash
git clone https://github.com/parthggote/TEST_EHR
cd TEST_EHR
npm install
2. Easy Setup (Recommended)
Run the interactive setup script:

bash
Copy code
npm run setup:epic
This guides you through:

Choosing between Mock Data or Real Epic API

Generating secure keys

Creating the proper .env configuration

3. Manual Setup (Alternative)
Option A: Mock Data Mode (No Epic Registration Required)

ini
Copy code
CLIENT_ID=
USE_MOCK_DATA=true
NEXTAUTH_SECRET=your_secure_random_string
ENCRYPTION_KEY=your_32_character_key
Option B: Real Epic API Mode

Register at Epic Developer Portal

Get your Client ID

Configure .env:

ini
Copy code
CLIENT_ID=your_epic_client_id
USE_MOCK_DATA=false
REDIRECT_URI=http://localhost:3000/auth/callback
NEXTAUTH_SECRET=your_secure_random_string
ENCRYPTION_KEY=your_32_character_key
4. Run Development Server
bash
Copy code
npm run dev
5. Test the Integration
Status Check: http://localhost:3000/status

Mock Demo: http://localhost:3000/demo (mock mode)

Real Integration: Click Connect to Epic MyChart

📋 Epic App Registration (For Real API)
Required Settings

Setting	Value
App Type	Public Client (SMART on FHIR)
Redirect URI	http://localhost:3000/auth/callback
Scopes	patient/*.read, user/*.read, launch, openid, profile
FHIR Version	R4

Test Credentials

Test Patient: Jason Fhir (ID: eq081-VQEgP8drUUqCWzHfw3)

Sandbox URL: https://fhir.epic.com/

📁 Project Structure
csharp
Copy code
├── app/
│   ├── api/
│   │   ├── auth/           # Authentication routes
│   │   └── fhir/           # FHIR API routes
│   ├── auth/               # Auth pages
│   ├── dashboard/          # Main dashboard
│   └── page.tsx            # Landing page
├── components/
│   ├── ui/                # shadcn/ui components
│   └── dashboard-layout.tsx
├── lib/
│   ├── types/
│   │   └── fhir.ts        # FHIR type definitions
│   ├── epic-client.ts     # Epic FHIR client
│   └── utils.ts
├── hooks/                 # Custom React hooks
└── public/                # Static assets
🔐 Authentication Flow
Login: User clicks "Login with Epic" → redirects to Epic OAuth2

Authorization: User grants permissions in Epic MyChart

Callback: Epic redirects back with authorization code

Token Exchange: Server exchanges code for access token using PKCE

Secure Storage: Tokens encrypted and stored in HTTP-only cookies

Dashboard Access: User can now access FHIR data

🛡️ Security Features
Data Protection
PHI encrypted at rest and in transit

Tokens stored in HTTP-only, secure cookies

CSRF protection with state parameter validation

Input validation and sanitization

Audit Logging
All FHIR API calls logged with timestamps

Authentication events tracked

Error events recorded (no PHI in logs)

Error Handling
Graceful handling of Epic API errors

Retry logic with exponential backoff

User-friendly error messages

Automatic token refresh

📊 API Endpoints
Authentication
Method	Endpoint	Description
GET	/api/auth/login	Initiate Epic OAuth2 flow
GET	/api/auth/callback	Handle OAuth2 callback
POST	/api/auth/logout	Clear session and tokens
GET	/api/auth/session	Get current session info

FHIR Data
Method	Endpoint	Description
GET	/api/fhir/patients	Search patients
GET	/api/fhir/patients/[id]/appointments	Get patient appointments
GET	/api/fhir/patients/[id]/clinical	Fetch patient clinical data
POST	/api/fhir/patients/[id]/appointments	Create appointment

🧪 Testing
Unit Tests
bash
Copy code
pnpm test
E2E Tests
bash
Copy code
pnpm test:e2e
Epic Sandbox Testing
Use Epic's sandbox environment for testing

Test patient: Jason Fhir (ID: eq081-VQEgP8drUUqCWzHfw3)

🚀 Deployment
Vercel (Recommended)
Connect GitHub repository to Vercel

Configure environment variables in Vercel dashboard

Update REDIRECT_URI to production domain

Deploy with automatic SSL

Manual Deployment
bash
Copy code
pnpm build
pnpm start
Ensure SSL certificate is configured

Update Epic app registration with production URLs

Environment-Specific Configuration
Environment	Endpoint
Development	Epic sandbox
Staging	Epic sandbox with production-like setup
Production	Epic production endpoints with proper SSL

📋 Epic Integration Checklist
Epic App Orchard registration completed

Client ID and redirect URI configured

SSL certificate installed (production)

FHIR scopes properly requested

Error handling implemented

Audit logging configured

Token refresh handling

HIPAA compliance review

🔧 Configuration Options
Scopes
patient/*.read - Read patient data

user/*.read - Read user data

launch - Launch context

openid profile - User identity

Rate Limiting
Epic enforces 1000 requests/hour per client

Automatic retry with exponential backoff implemented

Token Management
Access tokens expire in 1 hour

Refresh tokens valid for 30 days

Automatic refresh before expiration

🆘 Troubleshooting
Issue	Solution
"Invalid client" error	Verify CLIENT_ID and redirect URI
"Scope not granted" error	Ensure requested scopes are approved in Epic
Token expired errors	Implement token refresh logic
CORS errors	Verify domain registration and SSL certificate

Debug Mode

bash
Copy code
NODE_ENV=development
DEBUG=epic:*
📚 Resources
Epic FHIR Documentation

SMART on FHIR Specification

Epic App Orchard

FHIR R4 Specification

🤝 Contributing
Fork the repository

Create a feature branch

Make changes and add tests

Submit a pull request

📄 License
This project is licensed under the MIT License – see LICENSE file for details.

⚠️ Disclaimer
This is a demonstration application. For production use:

Conduct thorough security review

Implement additional monitoring

Follow HIPAA compliance procedures

Test extensively with Epic's sandbox environment
