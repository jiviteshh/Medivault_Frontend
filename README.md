# 🎨 Medivault Frontend

A modern, secure, and role-based frontend application for managing medical records with **patient-controlled access and real-time authorization workflows**.

---

## 📌 Project Overview

Medivault Frontend is a **React-based client application** that integrates with the Medivault backend to deliver a secure and intuitive user experience.

It enables:

- Patients to manage and control their medical data
- Doctors to request and access records with approval
- Admins to verify and maintain system integrity

---

## 🚀 Core Features

### 🔐 Authentication & Authorization
- JWT-based authentication
- Secure token handling
- Role-based routing:
  - `PATIENT`
  - `DOCTOR`
  - `ADMIN`

---

### 👤 User Management Interface
- Registration for Patients and Doctors
- Doctor onboarding includes **ICMR ID verification**
- Profile creation and management

---

### 🧑‍⚕️ Doctor Workflow
- Browse/search patients
- Request access to records
- Track request status (Pending / Approved / Rejected)
- Access system only after admin verification
- Generate access key
- Start session to view records

---

### 👨‍👩‍👧 Patient Workflow
- Upload and manage medical records
- View incoming doctor requests
- Approve or reject requests
- Define **time-bound access duration**
- Monitor active sessions
- Revoke access instantly

---

### 🧑‍💼 Admin Dashboard (Verification Layer)
- View pending doctor registrations
- Inspect doctor details:
  - Name
  - Email
  - ICMR ID
- Manually verify credentials via official portal
- Approve or reject doctors

👉 Only **verified doctors** can access the system

---

### 📁 Medical Records UI
- Upload files securely
- View records list
- Download records
- Delete records

---

### 🔑 Access Control System
- Doctor → Request access  
- Patient → Approve with duration  
- System → Generate access key  
- Doctor → Start session  
- Session → Auto expire  

---

### ⏳ Session Management
- Display active sessions
- Show:
  - Doctor name
  - Start time
  - Expiry time
- Patient can revoke access anytime

---

### 📜 Activity Feedback (UX Layer)
Real-time feedback for actions:

- Request sent
- Access approved/rejected
- Session started
- Access expired
- Doctor verification status

---

## 🏗️ Frontend Architecture

```
Pages → Components → Services (API Layer)
                     ↓
                Auth Layer (JWT)
                     ↓
              State Management (Context)
```

---

## 🛠️ Tech Stack

| Layer        | Technology               |
|-------------|------------------------|
| Framework    | React (Vite)            |
| Language     | TypeScript              |
| Styling      | Tailwind CSS            |
| Routing      | React Router            |
| State        | Context API             |
| API Calls    | Axios                   |
| UI System    | Shadcn/UI Components    |

---

## 📂 Project Structure

```
src/
│
├── pages/
│   ├── auth/
│   ├── patient/
│   ├── doctor/
│   ├── admin/
│
├── components/
├── context/
├── services/
├── lib/
│
├── App.tsx
├── main.tsx
└── index.css
```

---

## 🔄 Full User Flow

### 👤 Patient Flow
```
Register → Login
   ↓
Create Profile
   ↓
Upload Records
   ↓
Receive Requests
   ↓
Approve + Set Duration
   ↓
Monitor Sessions
   ↓
Revoke Access
```

---

### 🧑‍⚕️ Doctor Flow
```
Register (ICMR ID)
   ↓
Pending Verification
   ↓
Admin Approval
   ↓
Login
   ↓
Request Access
   ↓
Patient Approval
   ↓
Generate Access Key
   ↓
Start Session
   ↓
Access Records
```

---

### 🧑‍💼 Admin Flow
```
Login
   ↓
View Pending Doctors
   ↓
Verify ICMR ID
   ↓
Approve / Reject
```

---

## 🔐 Security Highlights

- Role-based UI protection
- JWT-based session validation
- Restricted access per role
- Doctor access blocked until verification
- Time-limited sessions
- Patient-controlled permissions

---

## ⚙️ Setup & Installation

### 1️⃣ Install Dependencies

```bash
npm install
```

---

### 2️⃣ Configure API Base URL

```ts
// src/services/api.ts
baseURL: "http://localhost:8080/api/v1"
```

---

### 3️⃣ Run Development Server

```bash
npm run dev
```

Runs at:

```
http://localhost:5173
```

---

## 🔗 Backend Dependency

This frontend requires:

👉 **Medivault Backend (Spring Boot API)**

Ensure backend is running before using the application.

---

## 🧪 Testing

- Test via browser UI
- Validate flows:
  - Authentication
  - Doctor verification
  - Access control
  - Session lifecycle

---

## 🚨 Important Notes

- Doctors require:
  - Admin verification  
  - Patient approval  
  - Access key  
  - Active session  

- ICMR ID is mandatory for doctor onboarding  
- Verification is handled manually by admin  

---

## 📈 Future Enhancements

- Automated ICMR verification  
- Email notifications  
- Real-time session updates  
- File preview system  
- Mobile-first UI improvements  

---

## 👥 Contributors

- **Jivitesh**
- **@KOLLIJAYANTHESWAR**

> Both contributors collaborated on **frontend and backend development**, system design, and overall architecture of the Medivault platform.

---

## 📄 License

This project is for educational and demonstration purposes.
