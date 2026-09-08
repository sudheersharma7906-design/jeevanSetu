# 🏥 JivanSetu (जीवनसेतु) — Healthcare Platform

> **Rural-to-Specialist Telemedicine & Emergency Dispatch Bridge**
> Connecting rural patients, Rural Medical Practitioners (RMPs), specialist doctors, and district emergency health administrators.

📘 **Full Architectural Specification**: See [JeevanSetu Master MVP Plan](file:///d:/jivanSetu%20Web/docs/JeevanSetu_MVP_Plan.md) for detailed technical specifications, clinical scoring formulas, state diagrams, and deployment guides.

---

## 📁 9. Suggested Repo Structure

```text
jeevansetu/
├── frontend/                # React app (located in root / src)
│   ├── src/
│   │   ├── pages/           # Patient, RMP, Doctor, Admin Dashboards & Login
│   │   ├── components/      # Modular UI components
│   │   │   ├── emergency/   # SOSButton.jsx, VoiceSOSListener.jsx, MapPin.jsx, PatientLiveSosTracker.jsx
│   │   │   ├── consult/     # ConsultRoom.jsx, PrescriptionView.jsx
│   │   │   ├── triage/      # TriageForm.jsx, TriageResult.jsx
│   │   │   ├── records/     # RecordTimeline.jsx
│   │   │   └── common/      # Navbar.jsx, SMS Simulator, Modals, Status Badges
│   │   ├── context/         # Auth, Socket, Emergency, Language, MedicalData Contexts
│   │   ├── services/        # API clients & hardware wrappers
│   │   │   ├── api.js       # Centralized REST API client
│   │   │   ├── geolocationService.js # High-accuracy GPS & distance calculations
│   │   │   ├── socket.js    # Socket.io client connector
│   │   │   └── webrtcService.js # WebRTC audio/video peer connection
│   │   └── utils/           # Mock data generators & sound effects
│   ├── index.html           # HTML5 Entry point with SEO meta tags
│   └── vite.config.js       # Vite build configuration
├── backend/                 # Node.js + Express (located in server/)
│   ├── server/
│   │   ├── modules/         # 9 Domain micro-modules
│   │   │   ├── auth/        # OTP generation/verification & JWT issuance
│   │   │   ├── user/        # Users & RMP geospatial distance queries
│   │   │   ├── triage/      # Clinical rule engine & urgency scoring
│   │   │   ├── consult/     # Teleconsultation queue & session lifecycle
│   │   │   ├── prescription/# Cryptographic SHA-256 digital prescriptions
│   │   │   ├── record/      # Append-only EHR timeline ledger
│   │   │   ├── emergency/   # 45s countdown timer & 3-tier auto-escalation
│   │   │   ├── notification/# Multi-channel alerts (SMS, WhatsApp, Push)
│   │   │   └── admin/       # Platform analytics & emergency audit logs
│   │   ├── sockets/         # Socket.io handlers & WebRTC signaling
│   │   │   └── socketHandler.js
│   │   ├── models/          # Mongoose database models with 2dsphere indexing
│   │   ├── middleware/      # JWT auth, RBAC guards, and error handling
│   │   ├── config/          # Database connection & clinical constants
│   │   └── tests/           # Automated test suites
├── docs/
│   └── JeevanSetu_MVP_Plan.md # Comprehensive MVP Plan & Architecture
└── README.md
```

---

## 👥 10. Layer Ownership Summary (for team splitting)

| Layer | Suggested Team Size | Core Skill | Primary Responsibilities |
|---|---|---|---|
| **Frontend** | 1–2 | React, WebRTC basics, Web Speech API | Multi-role dashboards, Voice SOS, panic button, Leaflet live map, WebRTC video/audio consult room. |
| **Backend** | 1–2 | Node.js/Express, Socket.io | 9 domain REST services, WebRTC signaling relay, 45s auto-escalation state machine, JWT auth. |
| **Database** | shared with backend | MongoDB, geospatial indexing | Mongoose schemas, 2dsphere geospatial queries (`$nearSphere`), indexing, synthetic seed dataset. |
| **AI/Triage** | 1 | Basic logic/rules, can pair with backend dev | Clinical symptom-weight rule engine, vital sign abnormality scoring, red flag overrides. |
| **DevOps** | 1 (part-time) | Deployment, CI/CD basics | GitHub Actions workflows, Docker containers, MongoDB Atlas provisioning, Vercel/Render deploys. |

---

## ⚙️ Backend Architecture (Node.js + Express + Socket.io)

The backend is built as a clean, modular monolith with high cohesion and loose coupling across 9 dedicated service modules.

### Service Modules

| Module | Location | Responsibility |
|---|---|---|
| **auth-service** | `server/modules/auth/` | OTP generation/verification, JWT issuance, session validation |
| **user-service** | `server/modules/user/` | CRUD for Patients, RMPs, Specialist Doctors; live GPS updates |
| **triage-service** | `server/modules/triage/` | Clinical rule engine for symptom scoring, red flag alerts, urgency classification |
| **consult-service** | `server/modules/consult/` | Teleconsultation queue, escalation from RMP to Specialist, session completion |
| **prescription-service**| `server/modules/prescription/` | Digital prescription issuance with cryptographic SHA-256 digital signature hash |
| **record-service** | `server/modules/record/` | Append-only EHR timeline connecting vitals, consults, triage reports, and prescriptions |
| **emergency-service** | `server/modules/emergency/` | Geo-matched SOS triggering, 45s countdown timer, auto-escalation to tertiary trauma care / 108 |
| **notification-service**| `server/modules/notification/` | Multi-channel alert dispatch (SMS, WhatsApp, Push, In-App) |
| **admin-service** | `server/modules/admin/` | Platform metrics, emergency audit logs, user verification |

---

## 📡 REST Endpoints

### 1. Authentication (`/api/auth`)
- `POST /api/auth/otp/request` — Request 6-digit OTP for mobile login
- `POST /api/auth/otp/verify` — Verify OTP and receive JWT access token
- `GET  /api/auth/me` — Retrieve current authenticated user profile

### 2. User & Provider Management (`/api/users` & `/api/patients`)
- `GET  /api/patients/:id` — Retrieve patient profile & medical summary
- `GET  /api/users/:id` — Retrieve user profile by ID
- `PUT  /api/users/:id` — Update profile metadata
- `PUT  /api/users/:id/location` — Update live GPS coordinates
- `GET  /api/users/rmps/nearby?lat=...&lng=...&radius=30` — Haversine distance-sorted nearby RMPs
- `GET  /api/users/doctors/list?specialty=...` — Available specialist doctors

### 3. Clinical Triage (`/api/triage`)
- `POST /api/triage` — Evaluate symptoms, vitals, and red flags; returns urgency score (0-100) & recommendation
- `GET  /api/triage/:id` — Get triage report by ID
- `GET  /api/triage/history/:patientId` — Historical triage evaluations for patient

### 4. Teleconsultation (`/api/consult`)
- `POST /api/consult/escalate` — Escalate case from RMP to specialist consult queue
- `GET  /api/consult/queue` — Active consultation queue (filterable by specialty, doctorId, status)
- `GET  /api/consult/:id` — Get consultation details & room ID
- `POST /api/consult/:id/complete` — Complete consultation session with diagnosis & advice
- `POST /api/consult/:id/prescribe` — Issue digital prescription directly from consultation

### 5. Digital Prescriptions (`/api/prescriptions`)
- `POST /api/prescriptions` — Create prescription with SHA-256 digital signature
- `GET  /api/prescriptions/:id` — Fetch prescription details
- `GET  /api/prescriptions/patient/:patientId` — Fetch all prescriptions for patient
- `GET  /api/prescriptions/:id/verify` — Verify cryptographic signature & authenticity

### 6. Append-Only Health Records (`/api/records`)
- `GET  /api/records/:patientId` — Full chronological EHR timeline
- `POST /api/records/:patientId` — Append verified clinical record/event

### 7. Emergency SOS (`/api/emergency`)
- `POST /api/emergency/sos` — Trigger emergency via Button or Voice; geo-matches nearest RMP
- `GET  /api/emergency/:id/status` — Real-time SOS status & assigned RMP details
- `POST /api/emergency/:id/accept` — RMP accepts emergency assignment
- `POST /api/emergency/:id/escalate` — Escalate to Tier 2 (Hospital) or Tier 3 (108 Ambulance)
- `GET  /api/emergency/active` — Active unresolved emergencies
- `GET  /api/emergency/all` — Full emergency log history

### 8. Notifications (`/api/notifications`)
- `POST /api/notifications/send` — Dispatch SMS, WhatsApp, and push alerts
- `GET  /api/notifications/:userId` — Retrieve in-app notification inbox
- `PUT  /api/notifications/:id/read` — Mark notification as read

### 9. Administration & Analytics (`/api/admin`)
- `GET  /api/admin/stats` — Platform KPI statistics & average emergency response times
- `GET  /api/admin/emergency-logs` — Comprehensive emergency response audit logs
- `GET  /api/admin/users` — User management and provider listing
- `POST /api/admin/users/:id/verify` — Verify/approve provider accounts

---

## ⚡ Real-Time Layer (Socket.io)

- **Namespace / Port**: Shared on port `5000` (or configured `PORT`).
- **WebRTC Signaling**:
  - `webrtc:join` — Join teleconsultation video room
  - `webrtc:offer`, `webrtc:answer`, `webrtc:ice-candidate` — Media signaling relay
  - `webrtc:leave` — Peer disconnection event
- **Emergency Dispatch**:
  - `sos:trigger` — Immediate socket alert trigger
  - `sos:alert` — Broadcast to nearby RMPs and district command
  - `sos:accept` — RMP acceptance event
  - `sos:status-update` — Real-time lifecycle push to patient (`NOTIFIED` → `ACCEPTED` → `EN_ROUTE` → `ARRIVED` → `RESOLVED`)
- **Live Consultation Chat**:
  - `consult:message` — Real-time text messaging inside active consultation room

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run the Backend Server
```bash
npm run server
```
Server runs at `http://localhost:5000` with WebSocket support.

### 3. Run Frontend Development Server
```bash
npm run dev
```
Client runs at `http://localhost:5173`.

### 4. Run Automated Test Suites
- REST API Test Suite:
  ```bash
  node server/tests/verify-api.js
  ```
- Real-Time WebSocket & WebRTC Test Suite:
  ```bash
  node server/tests/verify-sockets.js
  ```
- Notification System Test Suite:
  ```bash
  node server/tests/verify-notifications.js
  ```
- Third-Party Integrations Suite:
  ```bash
  node server/tests/test_integrations.js
  ```
