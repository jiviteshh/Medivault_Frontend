# 🎨 Medivault Frontend

A modern, secure, and user-friendly interface for managing medical records with strict patient-controlled access.

---

# 📌 Project Overview

Medivault Frontend is a React-based application that connects with the Medivault backend to provide:

* Secure authentication
* Role-based dashboards
* Controlled access to medical records
* Real-time session and access management

It ensures:

* Patients control their data visually and interactively
* Doctors request and receive controlled access
* Admins verify and manage system trust

---

# 🚀 Core Features

## 🔐 Authentication & Authorization

* JWT-based login system
* Secure token storage (localStorage/session)
* Role-based routing:

  * PATIENT
  * DOCTOR
  * ADMIN

---

## 👤 User Management UI

* Registration (Patient / Doctor)
* Doctor registration includes:

  * ICMR ID (mandatory for verification)
* Login system
* Profile setup pages:

  * Patient Profile
  * Doctor Profile

---

## 🧑‍⚕️ Doctor Workflow

* View patients (search/list)
* Request access to patient records
* See request status (Pending / Approved / Rejected)
* Wait for admin verification before access to system
* Generate access key (after approval)
* Start session to view records

---

## 👨‍👩‍👧 Patient Workflow

* Upload and manage medical records
* View access requests from doctors
* Approve / Reject requests
* Set time-bound access duration (patient-controlled)
* View active sessions
* Revoke access instantly

---

## 🧑‍💼 Admin Dashboard (Verification Layer)

* View pending doctor registrations

* See doctor details:

  * Name
  * Email
  * ICMR ID

* Perform verification:

  * Search ICMR ID manually via official portal
  * Validate authenticity of doctor credentials

* Approve / Reject doctors

👉 Only **verified doctors** are approved into the system

---

## 📁 Medical Records UI

* Upload files
* View records list
* Download securely
* Delete records

---

## 🔑 Access Control UI

* Doctor → Request access
* Patient → Approve with duration
* System → Generates access key
* Doctor → Starts session
* Access expires automatically

---

## ⏳ Session Management UI

* Display active sessions

* Show:

  * Doctor name
  * Start time
  * Expiry time

* Patient can revoke anytime

---

## 📜 Activity Feedback (Audit UX)

* Show status messages:

  * Request sent
  * Access approved
  * Session started
  * Access expired
  * Doctor verification pending

---

# 🏗️ Frontend Architecture

```text
Pages → Components → Services (API) → Backend API
                     ↓
                Auth Layer (JWT)
                     ↓
                State Management
```

---

# 🛠️ Tech Stack

| Layer      | Technology               |
| ---------- | ------------------------ |
| Framework  | React.js                 |
| Styling    | Tailwind CSS             |
| Routing    | React Router             |
| API Calls  | Axios                    |
| Animations | Framer Motion (optional) |
| State      | React Hooks / Context    |

---

# 📂 Folder Structure

```text
FrontEnd/
│
├── src/
│   ├── pages/
│   │   ├── auth/ (Login, Register)
│   │   ├── patient/
│   │   ├── doctor/
│   │   ├── admin/
│   │
│   ├── components/
│   ├── services/ (API calls)
│   ├── utils/
│   ├── App.tsx
│
└── public/
```

---

# 🔄 Full User Flow

## 👤 Patient Flow

```text
Register → Login
   ↓
Create Profile
   ↓
Upload Records
   ↓
Receive Doctor Requests
   ↓
Approve + Set Duration
   ↓
View Active Sessions
   ↓
Revoke Access (if needed)
```

---

## 🧑‍⚕️ Doctor Flow (WITH VERIFICATION)

```text
Register (with ICMR ID)
   ↓
System marks as PENDING
   ↓
Admin reviews ICMR ID
   ↓
✔ Verified → APPROVED
✖ Invalid → REJECTED
   ↓
Login (only if approved)
   ↓
Create Profile
   ↓
Request Access
   ↓
Wait for Patient Approval
   ↓
Generate Access Key
   ↓
Start Session
   ↓
Access Records
```

---

## 🧑‍💼 Admin Flow (VERIFICATION FLOW)

```text
Login
   ↓
View Pending Doctors
   ↓
Select Doctor
   ↓
Check ICMR ID manually (ICMR portal)
   ↓
If valid → Approve
If invalid → Reject
```

---

# 🔐 Security Features

* Role-based route protection
* JWT token validation
* Restricted UI access based on role
* Doctor access blocked until verification
* Time-bound session enforcement
* Patient-controlled access duration

---

# ⚙️ Setup & Installation

## 1️⃣ Install Dependencies

```bash
cd FrontEnd
npm install
```

---

## 2️⃣ Configure API Base URL

```js
// src/services/api.js
baseURL: "http://localhost:8080/api/v1"
```

---

## 3️⃣ Run Application

```bash
npm run dev
```

Runs at:

```text
http://localhost:5173
```

---

# 🧪 Testing

* Use backend with Postman
* Test frontend via browser
* Validate flows:

  * Auth
  * Doctor verification
  * Access requests
  * Sessions

---

# 🔄 Example Workflow (REALISTIC)

```text
Doctor registers with ICMR ID
Admin verifies doctor credentials
Doctor gets approved
Doctor requests access
Patient approves with time
System generates access key
Doctor starts session
Doctor views records
Session expires automatically
```

---

# 🚨 Important Notes

* Doctor cannot access records without:

  * Admin verification
  * Patient approval
  * Access key
  * Active session

* ICMR ID is mandatory for doctor registration

* Verification is manual via admin

---

# 📈 Future Enhancements

* Automated ICMR verification (if API available)
* Document upload (license proof)
* Email notifications for approvals
* Real-time session updates
* Mobile-first UI improvements

---

# 👥 Contributors

Jivitesh (Owner)
@KOLLIJAYANTHESWAR(Key Contributor)

---

# 📄 License

This project is for educational and demonstration purposes.

---
