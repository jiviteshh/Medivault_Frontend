# 🏥 Medivault Frontend

A modern, responsive frontend for the **Medivault system**, enabling secure interaction between **patients, doctors, and admins** with a clean UI and role-based workflows.

Built using **React, TypeScript, Tailwind CSS, and Vite**, this application provides an intuitive interface for managing medical records and access control.

---

## 📌 Project Overview

The Medivault Frontend is designed to:

- Provide role-based dashboards (Patient, Doctor, Admin)
- Enable secure authentication and session handling
- Allow patients to manage medical records
- Enable doctors to request and access patient data
- Deliver a smooth, responsive, and modern user experience

---

## 🚀 Core Features

### 🔐 Authentication UI
- Login & Registration pages
- Role-based navigation
- JWT-based session handling (via backend)

---

### 👤 Role-Based Dashboards

#### 🧑 Patient
- Upload and manage medical records
- View personal health data
- Approve/reject doctor access requests

#### 🧑‍⚕️ Doctor
- Request access to patient records
- View records after approval
- Manage active sessions

#### 🛡️ Admin
- Approve/reject doctor registrations
- Monitor system activity

---

### 📁 Medical Records UI
- Upload interface for documents
- List view of records
- Download & delete actions

---

### 🔑 Access Control Interface
- Request access flow
- Approval/rejection UI
- Session status tracking

---

### 🎨 UI/UX Highlights
- Fully responsive design
- Clean dashboard layout
- Reusable component system
- Loading states and feedback components
- Modern UI using Tailwind + component library

---

## 🛠️ Tech Stack

### Frontend
- React (with Vite)
- TypeScript
- Tailwind CSS
- Shadcn/UI components

### State Management
- React Context API

### API Communication
- Axios / Fetch (via `services/api.ts`)

---

## 📦 Project Structure

```
medivault-frontend/
│
├── public/                    # Static assets
├── components/               # UI components (buttons, cards, etc.)
│   ├── ui/                   # Reusable UI components
│   └── common components
│
├── context/                  # Global state (AuthContext)
├── pages/                    # Page-level components
│   ├── auth/                 # Login & Register
│   ├── patient/
│   ├── doctor/
│   └── admin/
│
├── services/                 # API integration
│   └── api.ts
│
├── App.tsx                   # Main app
├── main.tsx                  # Entry point
├── index.css                 # Global styles
│
├── tailwind.config.js
├── vite.config.ts
└── README.md
```

---

## ⚙️ Setup & Installation

### 1️⃣ Clone Repository

```bash
git clone https://github.com/your-username/medivault-frontend.git
cd medivault-frontend
```

---

### 2️⃣ Install Dependencies

```bash
npm install
```

---

### 3️⃣ Configure Backend URL

Update API base URL in:

```
src/services/api.ts
```

Example:

```ts
export const API_BASE_URL = "http://localhost:8080/api/v1";
```

---

### 4️⃣ Run Development Server

```bash
npm run dev
```

Application runs at:

```
http://localhost:5173
```

---

## 🔗 Backend Integration

This frontend connects with:

👉 **Medivault Backend (Spring Boot API)**

Ensure backend is running before using the frontend.

---

## 🎯 Key Highlights

✔ Role-based UI architecture  
✔ Clean component-based design  
✔ Scalable folder structure  
✔ Type-safe development using TypeScript  
✔ API-driven architecture  
✔ Modern UI with Tailwind + reusable components  

---

## 📈 Future Enhancements

- Dark mode support  
- File preview for medical records  
- Notifications system  
- Better error handling & validation  
- PWA support  

---

## 👥 Contributors

- **Kolli Jayanth Eswar**
- **@jiviteshh**

> Both contributors collaborated on **frontend and backend development**, system design, and overall architecture of the Medivault platform.

---

## 📄 License

This project is for educational and demonstration purposes.
