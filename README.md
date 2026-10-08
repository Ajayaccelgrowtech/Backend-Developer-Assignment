# CRM Sales Management System - Full Stack Application (Backend API + React Frontend)

Enterprise CRM Sales Management Application featuring a **Node.js/Express REST API Backend** and a **React + TypeScript + Tailwind CSS + RTK Query Frontend**.

Powers the complete sales lifecycle:  
`Lead Generation ➔ Lead Qualification ➔ Customer Conversion (ACID Transaction) ➔ Kanban Deal Pipeline ➔ Sales Analytics & Reports`

---

## 🎨 Frontend Highlights (React + TypeScript + Tailwind CSS + RTK Query)

- **Modern Glassmorphic Dark UI**: Built with Tailwind CSS, custom scrollbars, and sleek dark mode aesthetics.
- **State Management & Caching**: Powered by **Redux Toolkit (RTK) Query** with automatic tag invalidation for instant UI updates.
- **Role-Based Navigation**: Dynamic UI adjustments for `Admin`, `Sales Manager`, and `Sales Executive`.
- **Interactive Deals Kanban Board**: Stage-by-stage pipeline (`Qualification`, `Discovery`, `Proposal`, `Negotiation`, `Won`, `Lost`) with stage validation modals.
- **One-Click Lead Conversion Modal**: Converts qualified leads into Customers and Deals atomically via backend transactions.
- **Quick Demo Auto-Fill**: Login screen includes 1-click credential buttons for `Admin`, `Sales Manager`, and `Sales Executive`.

---

## 🛠️ Technology Stack

### Backend
- **Runtime**: Node.js & Express.js
- **Database**: MongoDB with Mongoose ODM (ACID Transactions & Aggregations)
- **Security**: JWT access & refresh tokens, bcrypt password hashing, Helmet, CORS, Rate Limiting (`express-rate-limit`), Zod validation.

### Frontend
- **Framework**: React 19 + TypeScript (Vite)
- **Styling**: Tailwind CSS
- **State & Data Fetching**: Redux Toolkit (RTK Query)
- **Icons**: Lucide React
- **Routing**: React Router DOM v7

---

## 🚀 Quick Start Guide

### 1. Backend Server Setup
```bash
# Install root backend dependencies
npm install

# Seed sample demo database
npm run seed

# Start backend REST API (Runs at http://localhost:5000/api/v1)
npm run dev
```

### 2. Frontend Application Setup
Open a second terminal window:
```bash
cd frontend

# Install frontend dependencies
npm install

# Start Vite React development server (Runs at http://localhost:3000)
npm run dev
```

---

## 🔐 Seeded Accounts for Quick Demo Testing

- 🛡️ **Admin**: `admin@crm.com` | `AdminPassword123!`
- 👔 **Sales Manager**: `manager@crm.com` | `ManagerPassword123!`
- 💼 **Sales Executive**: `alex.exec@crm.com` | `ExecPassword123!`

---

## 📮 Postman Collection

A pre-configured Postman Collection file is available at:  
📄 **`CRM_Sales_Management_System.postman_collection.json`**
