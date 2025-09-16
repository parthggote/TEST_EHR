# EHR_Dashboard: An Epic FHIR Integration Platform

EHR_Dashboard is a secure, HIPAA-compliant web application built with Next.js that demonstrates a robust integration with Epic's FHIR API. It provides separate, feature-rich dashboards for both patients and clinicians, leveraging the SMART on FHIR OAuth2 standard for secure authentication and data access.

## ✨ Key Features

-   **Dual Dashboards**: Separate, tailored experiences for patients and clinicians.
-   **SMART on FHIR**: Secure OAuth2 authentication for both user types.
-   **Bulk Data Import**: A sophisticated workflow for clinicians to import data for an entire group of patients from the Epic sandbox.
-   **MongoDB Caching**: Caches bulk data to improve performance and reduce redundant API calls.
-   **Dynamic UI**: Built with shadcn/ui, featuring a dark/light mode theme toggle.
-   **Secure by Design**: Implements best practices for handling Protected Health Information (PHI), including token encryption and secure cookie storage.

---

## 🚀 Getting Started

### Prerequisites

-   Node.js 18+ and npm/pnpm
-   MongoDB instance (local or cloud-based)
-   Epic FHIR application credentials (for real API) OR use mock mode for development

### 1. Clone and Install

```bash
git clone <repository-url>
cd ehr-dashboard
npm install
```

### 2. Environment Setup

Run the interactive setup script to configure your environment:

```bash
npm run setup:epic
```

This script will guide you through:
-   Choosing between Mock Data or the Real Epic API.
-   Generating secure keys for session and data encryption.
-   Creating your `.env.local` file with the necessary credentials, including your MongoDB connection string.

### 3. Run the Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

---

## 🏥 Features in Detail

### Patient-Facing Dashboard (`/dashboard`)

A patient-centric portal where users can:
-   Log in using their Epic MyChart credentials.
-   View their personal health information, including appointments, conditions, medications, and allergies.
-   The UI is designed to be simple, secure, and easy to navigate.

### Clinician-Facing Dashboard (`/dashboard/clinician`)

A powerful tool for healthcare providers. The standout feature is the **Bulk Data Import** workflow.

**Bulk Import Workflow:**
1.  **Initiate Export**: The clinician clicks "Start Bulk Import" to trigger a request to the Epic FHIR API for a predefined group of patients.
2.  **Monitor Progress**: The UI provides real-time status updates on the export job (e.g., "In-progress", "Complete").
3.  **Load Data on Demand**: Once the export is complete, a manifest of available data files is shown. The clinician can then click "Load" for any resource type (e.g., Patient, Appointment, Condition).
4.  **Cache & Display**:
    -   The first time a data file is loaded, it's fetched from the Epic server, parsed, and **cached in MongoDB**.
    -   The data is then displayed in a clean, tabular format on the dashboard.
    -   On subsequent requests, the data is served instantly from the MongoDB cache, significantly improving performance.

---

## 🛠️ Technology Stack

-   **Framework**: Next.js 14 (App Router)
-   **Language**: TypeScript
-   **UI**: React, shadcn/ui, Tailwind CSS
-   **Authentication**: SMART on FHIR (OAuth2)
-   **Database**: MongoDB (for caching)
-   **Styling**: CSS-in-JS with PostCSS
-   **Icons**: lucide-react

---

## 📁 Project Structure

```
├── app/
│   ├── api/
│   │   ├── auth/           # Authentication routes (patient & clinician)
│   │   ├── clinician/      # Clinician-specific API routes (including bulk data)
│   │   └── fhir/           # Patient-specific FHIR API routes
│   ├── dashboard/
│   │   ├── clinician/      # Clinician dashboard page & layout
│   │   └── page.tsx        # Patient dashboard page
│   └── layout.tsx          # Root layout
├── components/
│   ├── resource-tables/    # Reusable components for displaying FHIR data
│   ├── ui/                 # shadcn/ui components
│   └── dashboard-layout.tsx # Shared layout for the clinician portal
├── lib/
│   ├── epic-client.ts      # Epic FHIR client for API interactions
│   └── mongodb.ts          # MongoDB connection utility
└── hooks/                  # Custom React hooks
```

---

## 🔐 Authentication Flow

1.  **Login**: User selects either the patient or clinician login path.
2.  **Redirect to Epic**: The user is redirected to the Epic OAuth2 authorization server.
3.  **Grant Permissions**: The user logs in with their Epic credentials and grants the application access.
4.  **Callback**: Epic redirects back to the application with an authorization code.
5.  **Token Exchange**: The application's backend securely exchanges the code for an access token.
6.  **Secure Session**: The access token is encrypted and stored in a secure, HTTP-only cookie, establishing a session.
7.  **Dashboard Access**: The user is redirected to their respective dashboard and can now make authenticated requests to the backend.

---

## 🧪 Testing

The application is configured for testing with the Epic on FHIR sandbox.

-   **Clinician Users**: The documentation provides test clinician accounts (`FHIR`, `FHIRTWO`).
-   **Patient Users**: Test patients with MyChart credentials (e.g., `fhircamila`) are available.
-   **Bulk Data Group**: The clinician dashboard is hardcoded to use the test group ID for bulk exports: `e3iabhmS8rsueyz7vaimuiaSmfGvi.QwjVXJANlPOgR83`.

---

## 🤝 Contributing

1.  Fork the repository.
2.  Create a feature branch (`git checkout -b feature/AmazingFeature`).
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4.  Push to the branch (`git push origin feature/AmazingFeature`).
5.  Open a Pull Request.

## 📄 License

This project is licensed under the MIT License. See the `LICENSE` file for details.