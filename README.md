# Epic FHIR Integration Dashboard

A secure, HIPAA-compliant web application built with **Next.js** for integrating with Epic's FHIR API using SMART on FHIR OAuth2 standards.
This project provides separate dashboards for **patients** and **clinicians**, supports **bulk data import**, and includes a **MongoDB cache layer** for faster queries.

> GitHub Repo: [https://github.com/parthgote/EHR_Dashboard](https://github.com/parthgote/EHR_Dashboard)

---

## ✨ Features

### Highlights
- 🔑 Secure SMART on FHIR OAuth2 login
- 🧑‍⚕️ Clinician and 👩‍💻 Patient-facing dashboards
- 📦 Bulk data import (FHIR `Patient/$everything`)
- 💾 MongoDB caching for improved performance
- 🌗 Dark/Light mode UI with shadcn/ui + Tailwind
- 🔐 PHI-safe handling with HIPAA compliance in mind

### Core Modules
- **Patient Management**: Search, view demographics, manage records
- **Appointments**: Schedule, view, manage visits
- **Clinical Data**: Access vitals, lab results, observations, conditions
- **Medications**: Current & past medications with dosage
- **Allergies**: Allergy and intolerance tracking
- **Reports**: Diagnostic reports, procedures, immunizations, documents

---

## 🚀 Getting Started

### Prerequisites
- Node.js (>=18.x)
- MongoDB (local or Atlas)
- Epic FHIR Sandbox credentials

### Easy Setup (Recommended)
```bash
git clone [https://github.com/parthgote/EHR_Dashboard.git](https://github.com/parthgote/EHR_Dashboard.git)
cd EHR_Dashboard
npm install
npm run setup:epic
```

### Manual Setup
Create a `.env.local` file in the root:

```ini
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret

EPIC_CLIENT_ID=your-epic-client-id
EPIC_CLIENT_SECRET=your-epic-client-secret
EPIC_ISSUER=[https://fhir.epic.com/interconnect-fhir-oauth](https://fhir.epic.com/interconnect-fhir-oauth)
EPIC_FHIR_BASE_URL=[https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4](https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4)

MONGODB_URI=mongodb://localhost:27017/ehr_dashboard
```
Run the app:
```bash
npm run dev
```

---

## 📊 Features in Detail

### Patient Dashboard
- Login via Epic OAuth
- View demographics, medications, conditions
- Manage upcoming appointments
- Export/download FHIR data

### Clinician Dashboard
- Search patients across Epic
- Manage patient panels
- View lab results, conditions, immunizations
- Prescribe/view medication requests
- Access diagnostic reports

### Bulk Import Workflow
1. Clinician logs in.
2. Search/select a patient.
3. Fetch FHIR bundle (`Patient/$everything`).
4. Parse/store resources in MongoDB.
5. Cache data for faster querying.

---

## 🛠️ Technology Stack
- **Next.js 14** (React framework)
- **TypeScript** (type safety)
- **shadcn/ui + Tailwind CSS** (UI components & styling)
- **MongoDB** (local/Atlas)
- **lucide-react** (icons)
- **NextAuth.js** (OAuth2, Epic integration)

---

## 📂 Project Structure
```bash
/EHR_Dashboard
  /app
    /api
      /auth        # NextAuth routes
      /clinician   # Clinician APIs
      /fhir        # Epic FHIR endpoints
    /auth          # Login/logout pages
    /dashboard
      /patient     # Patient dashboard
      /clinician   # Clinician dashboard
    /resource-tables # Shared UI for FHIR resources
  /lib
    mongodb.ts     # MongoDB client config
    auth.ts        # NextAuth config
```

---

## 🔐 Authentication & Security Flow

### Patients
1. Patient clicks "Login with Epic".
2. Redirect → Epic OAuth2 authorization.
3. Access token & ID token received.
4. NextAuth validates the token.
5. The patient is redirected to the patient dashboard.

### Clinicians
1. Clinician clicks "Clinician Login".
2. Redirect → Epic OAuth2 (with clinical scope).
3. The token is stored securely (HTTP-only cookie).
4. API requests use the cached token.
5. The clinician dashboard is unlocked.

### Security Features
- PKCE + state validation
- HTTP-only secure cookies for session management
- MongoDB stores only FHIR resource IDs, not raw PHI
- Audit logging for clinician actions
- Role-based access control (RBAC)

---

## 🧪 Testing

### Epic Sandbox
- **Test Patient**: Jason Fhir (epic:12345)
- **Demo Users**:
  - `fhircamila` → Epic sandbox patient
  - Clinician test accounts (`epic_clinician_*`)

### Quick Check
- `/api/status` → API health
- `/api/fhir/metadata` → FHIR server capability statement
- `/dashboard/patient` → Patient UI
- `/dashboard/clinician` → Clinician UI

---

## 🌐 Deployment

### Vercel (Recommended)
1. Connect the GitHub repo to Vercel.
2. Add environment variables in the Vercel dashboard.
3. Deploy → Vercel auto-builds with Next.js 14.

### Manual Deployment
```bash
npm run build
npm run start
```

---

## 🤝 Contributing
We welcome contributions!
1. Fork the repo.
2. Create a feature branch (`git checkout -b feature/xyz`).
3. Commit your changes (`git commit -m "feat: add xyz"`).
4. Push your branch (`git push origin feature/xyz`).
5. Open a Pull Request.

---

## 📜 License
This project is MIT licensed. See `LICENSE` for details.

---

## ⚠️ Disclaimer
This project is for demo and educational purposes only. For production, you must:
- Sign a Business Associate Agreement (BAA).
- Undergo Epic App Orchard certification.
- Ensure full HIPAA compliance.