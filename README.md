# CRM Sales Management System - RESTful Backend API

Production-ready, highly secure RESTful Backend for a **CRM Sales Management System** built with **Node.js, Express.js, MongoDB, and Mongoose**.

This backend powers the complete sales lifecycle:  
`Lead Generation ➔ Lead Qualification ➔ Customer Conversion (ACID Transaction) ➔ Deal Pipeline Management ➔ Deal Closure & Sales Analytics`

---

## 🚀 Key Features & Highlights

- **Authentication & Authorization**: Secure JWT access & refresh token flow, bcrypt password hashing, and Role-Based Access Control (**RBAC**) across `Admin`, `Sales Manager`, and `Sales Executive`.
- **Lead Lifecycle Management**: Full CRUD, status transitions, priority handling, source tracking, user assignment/re-assignment, and date-range filtering.
- **Lead Conversion Engine (ACID Transaction)**: Safe MongoDB transactions (`session.withTransaction`) converting qualified leads into Customers and Deals atomically without data corruption.
- **Deal Management & Business Rules**: Rigorous backend validation for deal transitions (e.g., stage locks on closed deals, mandatory loss reasons for Lost deals, value > 0, probability bounds 0-100%, automated expected revenue calculations).
- **Activity & Follow-up Tracker**: Dynamic overdue status evaluation for calls, meetings, demos, and follow-ups.
- **Audit History / Event Timeline**: Automatic event logging for lead creation, assignment, status change, customer creation, conversion, deal creation, deal stage change, deal won/lost.
- **Dashboard & Sales Analytics Pipeline**: Aggregation pipelines for overview metrics, stage-by-stage sales pipeline breakdown, and manager team performance analytics.
- **Production Security & Optimization**: Helmet security headers, CORS origin enforcement, API rate limiting (`express-rate-limit`), input validation (`Zod`), and indexed MongoDB queries.

---

## 🛠️ Technology Stack

- **Runtime Environment**: Node.js (v18+)
- **Web Framework**: Express.js
- **Database Engine**: MongoDB with Mongoose ODM
- **Authentication**: JSON Web Token (`jsonwebtoken`), `bcryptjs`
- **Request Validation**: `Zod`
- **Security & Middleware**: `helmet`, `cors`, `express-rate-limit`
- **Logging**: `morgan`
- **Database Utilities**: MongoDB ACID Transactions, Aggregation Framework

---

## 📁 Project Structure

```
d:\crm_sales_management_system
├── .env.example
├── .env
├── package.json
├── README.md
├── CRM_Sales_Management_System.postman_collection.json
└── src/
    ├── app.js                          # Express app configuration & middleware
    ├── server.js                       # Server startup & DB connection
    ├── config/
    │   ├── db.js                       # Mongoose database connection
    │   └── environment.js              # Centralized environment variables
    ├── constants/
    │   ├── roles.js                    # Admin, Sales Manager, Sales Executive
    │   ├── leadEnums.js                # Lead sources, statuses, priorities
    │   ├── dealEnums.js                # Deal stages (Qualification -> Won/Lost)
    │   └── activityEnums.js            # Activity types & statuses
    ├── controllers/
    │   ├── auth.controller.js          # Authentication endpoints
    │   ├── user.controller.js          # User management (Admin)
    │   ├── lead.controller.js          # Lead CRUD & conversion
    │   ├── customer.controller.js      # Customer management
    │   ├── deal.controller.js          # Deal management & business logic
    │   ├── activity.controller.js      # Activities & follow-ups
    │   ├── timeline.controller.js      # Audit log timelines
    │   └── analytics.controller.js     # Sales analytics & reports
    ├── middleware/
    │   ├── auth.middleware.js          # JWT verification & req.user attachment
    │   ├── rbac.middleware.js          # Role-based authorization & query scoping
    │   ├── validate.middleware.js      # Zod validation handler
    │   ├── rateLimiter.middleware.js   # Rate limiting security
    │   └── error.middleware.js         # Centralized error handler
    ├── models/
    │   ├── User.js                     # User schema & password hashing
    │   ├── Lead.js                     # Lead schema & indexes
    │   ├── Customer.js                 # Customer schema
    │   ├── Deal.js                     # Deal schema & expected revenue pre-save
    │   ├── Activity.js                 # Activity schema & dynamic overdue status
    │   └── Timeline.js                 # Timeline audit log schema
    ├── routes/
    │   ├── index.js                    # Master API router (/api/v1)
    │   ├── auth.routes.js
    │   ├── user.routes.js
    │   ├── lead.routes.js
    │   ├── customer.routes.js
    │   ├── deal.routes.js
    │   ├── activity.routes.js
    │   ├── timeline.routes.js
    │   └── analytics.routes.js
    ├── services/
    │   └── timeline.service.js         # Centralized event logger
    ├── utils/
    │   ├── apiError.js                 # Operational error builder
    │   ├── apiResponse.js              # Standard response wrapper
    │   ├── asyncHandler.js             # Async controller error catcher
    │   └── pagination.js               # Pagination & sorting helper
    ├── validators/
    │   ├── auth.validator.js
    │   ├── user.validator.js
    │   ├── lead.validator.js
    │   ├── customer.validator.js
    │   ├── deal.validator.js
    │   └── activity.validator.js
    └── scripts/
        └── seed.js                     # Database demo seeder
```

---

## 🔐 User Roles & Permissions Matrix

| Resource / Action | Admin | Sales Manager | Sales Executive |
| :--- | :---: | :---: | :---: |
| **User Management (CRUD)** | ✅ Full | ❌ No Access | ❌ No Access |
| **View Leads** | ✅ All Leads | ✅ All / Team Leads | 🔒 Assigned Leads Only |
| **Create Lead** | ✅ | ✅ | ✅ |
| **Assign / Reassign Lead** | ✅ | ✅ (Team Leads) | ❌ |
| **Convert Lead** | ✅ | ✅ | 🔒 Assigned Leads Only |
| **Delete Lead / Customer / Deal** | ✅ | ✅ | ❌ |
| **Deal Stage Updates** | ✅ | ✅ | 🔒 Assigned Deals Only |
| **Reopen Closed Deal (Won/Lost)** | ✅ | ✅ | ❌ |
| **Sales Analytics & Reports** | ✅ Full | ✅ Full / Team | 🔒 Personal Performance |

---

## ⚡ Quick Start & Installation

### 1. Prerequisites
- **Node.js**: v18.x or higher
- **MongoDB**: Local MongoDB instance running on `mongodb://localhost:27017` or a MongoDB Atlas URI.

### 2. Installation
```bash
# Clone or navigate to the project directory
cd d:\crm_sales_management_system

# Install dependencies
npm install
```

### 3. Environment Setup
Create a `.env` file in the root directory (or copy from `.env.example`):
```ini
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/crm_sales_db
JWT_SECRET=crm_jwt_access_secret_key_change_in_production_2026
JWT_EXPIRES_IN=1d
JWT_REFRESH_SECRET=crm_jwt_refresh_secret_key_change_in_production_2026
JWT_REFRESH_EXPIRES_IN=7d
CORS_ORIGIN=*
```

### 4. Seed Database (Sample Accounts & Records)
Populate your database with realistic demo users, leads, customers, deals, and activities:
```bash
npm run seed
```

**Seed Demo Credentials:**
- 🛡️ **Admin**: `admin@crm.com` | `AdminPassword123!`
- 👔 **Sales Manager**: `manager@crm.com` | `ManagerPassword123!`
- 💼 **Sales Executive 1**: `alex.exec@crm.com` | `ExecPassword123!`
- 💼 **Sales Executive 2**: `michael.exec@crm.com` | `ExecPassword123!`

### 5. Start the Server
```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```
The server will run at: `http://localhost:5000/api/v1`

---

## 📑 Postman Collection & API Documentation

A complete, pre-configured **Postman Collection v2.1** file is included at the project root:  
📄 **`CRM_Sales_Management_System.postman_collection.json`**

### Postman Integration Features:
1. **Auto-Auth Script**: Logging in via any account (Admin, Manager, Exec) automatically updates the `{{authToken}}` collection variable!
2. **Auto-ID Saving**: Lead conversion automatically populates `{{customerId}}` and `{{dealId}}` variables for downstream requests.
3. **Structured Folders**:
   - `1. Authentication` (Login, Register, Profile, Refresh Token, Logout)
   - `2. User Management` (Create, Get All with filters, Get by ID, Update, Deactivate)
   - `3. Lead Management` (Create, Filtered List, Get by ID, Update Status, Convert)
   - `4. Customer Management` (Get Customers, Get by ID, Update)
   - `5. Deal Management` (Get Deals, Get by ID, Update Stage - Won/Lost rules)
   - `6. Sales Activities & Follow-ups` (Create, Get All, Complete Activity)
   - `7. Audit History Timeline` (Get Entity Timeline)
   - `8. Dashboard & Analytics` (Overview, Sales Pipeline, Team Performance)

---

## 📈 MongoDB Design & Performance Indexing

### Collections & Schema Relationships
```
User
├── Leads (assignedTo -> User)
├── Customers (assignedTo -> User)
├── Deals (assignedTo -> User)
└── Activities (assignedTo, createdBy -> User)

Lead
├── Customer (originalLeadId -> Lead)
├── Deal (leadId -> Lead)
├── Activities (relatedId -> Lead)
└── Timeline (entityId -> Lead)
```

### Strategic Compound & Field Indexes:
- `User`: `{ email: 1 }` (unique), `{ role: 1, isActive: 1 }`, `{ name: "text", email: "text" }`
- `Lead`: `{ status: 1, priority: 1, assignedTo: 1 }`, `{ source: 1 }`, `{ createdAt: -1 }`
- `Customer`: `{ originalLeadId: 1 }` (unique), `{ assignedTo: 1 }`, `{ email: 1 }`
- `Deal`: `{ stage: 1, assignedTo: 1 }`, `{ value: 1 }`, `{ expectedClosingDate: 1 }`
- `Activity`: `{ assignedTo: 1, status: 1, dueDate: 1 }`, `{ relatedModel: 1, relatedId: 1 }`
- `Timeline`: `{ entityType: 1, entityId: 1, createdAt: -1 }`

---

## 🔒 Business Rules Implemented

1. **Lead Conversion Transaction**: Converting a Lead creates a Customer and Deal record simultaneously inside an ACID transaction (`mongoose.startSession`). If any step fails, changes are completely rolled back.
2. **Deal Stage Locks**: Deals in closed stages (`Won` / `Lost`) cannot be moved back to an active stage by a Sales Executive; requires Admin/Manager authority.
3. **Lost Deal Reason Requirement**: Any deal marked with stage `Lost` must include a non-empty `lossReason`.
4. **Calculated Expected Revenue**: Mongoose `pre-save` middleware automatically calculates `expectedRevenue = (value * probability) / 100`.
5. **Dynamic Overdue Evaluation**: Activities with `status = 'Pending'` and `dueDate < current_time` are dynamically returned as `Overdue`.
6. **Immutable Conversion**: Converted leads cannot be re-converted.

---

## 📋 Response Structure

### Success Response
```json
{
  "success": true,
  "message": "Lead converted successfully to Customer and Deal",
  "data": { ... },
  "pagination": {
    "currentPage": 1,
    "pageSize": 10,
    "totalRecords": 42,
    "totalPages": 5,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "A deal marked as Lost must include a valid loss reason"
}
```

---

## 📜 License
This project is licensed under the MIT License.
