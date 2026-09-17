# Product Requirements Document (PRD)

**Project Name:** Multi-Tenant School Management System (EduFlow SaaS)

**Status:** Implemented

**Version:** 1.0.0

**Target Runtime:** Next.js (App Router) + Supabase (PostgreSQL) + Drizzle ORM

**System Lead / Root Super Admin:** `basithunyawrr@gmail.com`

---

## 1. Executive Summary & Vision

The platform is a multi-tenant, cloud-native School Management System (SMS) built to eliminate operational friction between School Owners/Administrators, Teachers, and Parents.

By unifying student record-keeping, bulk student provisioning, digital classroom diaries, automated attendance, dynamic monthly fee invoicing with local payment gateways, operational profit-and-loss accounting, and an isolated AI Student Diagnostic Counselor into a single responsive web portal, the platform removes manual paperwork and endless messaging back-and-forth between educators and guardians.

---

## 2. User Personas & Role-Based Access Matrix

| Role | Access Level | Scope / Boundary | Core Responsibilities |
| --- | --- | --- | --- |
| **Super Admin** | Platform Master ("God Mode") | Global (Cross-Tenant) | Hardcoded strictly to `basithunyawrr@gmail.com`. Tenant provisioning, subscription plan management, platform-wide feature flags, usage metrics, and emergency tenant overrides. |
| **School Admin** | Tenant Owner | Single School Boundary | Full academic and financial operations: staff/student rosters, bulk CSV ingestion, salary payouts, utility expense logs, fee structure generation, real-time P&L analytics, and SaaS billing. |
| **Teacher** | Operational Staff | Assigned Classes & Subjects Only | Real-time daily attendance marking, homework/digital diary logging, exam grade submissions, student behavioral notes. |
| **Parent** | Client / Consumer | Scoped strictly to verified biological/legal children | Review child-specific attendance, grades, and teacher diaries; pay fee vouchers online; converse with the AI Academic Diagnostic Assistant. |

---

## 3. Epics & Functional Requirements

### Epic 1: Multi-Tenant Core & Role-Based Access Control (RBAC)

**Status:** ✅ Implemented

- **REQ-1.1 (Root Hardcoded Admin):** The system enforces that platform-level God Mode is accessible exclusively by `basithunyawrr@gmail.com`. No UI or standard administrative action can delegate or duplicate this role.

- **REQ-1.2 (Tenant Isolation):** Every database row (except Super Admin global metadata) maintains a strict foreign key reference to `school_id`. Data access is enforced at both the application layer and via PostgreSQL Row-Level Security (RLS).

- **REQ-1.3 (Subdomain/Tenant Routing):** Tenants operate under scoped paths `/portal/[school-slug]` mapped to their specific `school_id`.

**Implementation:**
- `src/lib/middleware/auth.ts` - Authentication and authorization middleware
- `src/lib/db/schema.ts` - All tables include `schoolId` foreign key
- `src/app/(dashboard)/layout.tsx` - Tenant-scoped dashboard layout

---

### Epic 2: Bulk CSV Ingestion & Batch Identity Provisioning

**Status:** ✅ Implemented

- **REQ-2.1 (CSV Import Parser):** School Admins can upload a standardized `.csv` containing: `First Name, Last Name, Gender, DOB, Grade/Class, Section, Roll Number, Guardian Name, Guardian Email, Guardian Phone`.

- **REQ-2.2 (Data Validation & Preview):** Pre-validation engine checks for duplicate roll numbers, malformed phone numbers, and invalid emails, presenting an error preview before committing.

- **REQ-2.3 (Batch ID & Credential Generation):** On confirmation via the "Create IDs" action:
  - The system provisions student entities linked to their class/section.
  - System provisions guardian accounts with deterministic emails and cryptographically secure random temporary passwords.
  - System dispatches an optional Magic Link / onboarding notification to the guardian.

**Implementation:**
- `src/app/api/csv-import/route.ts` - CSV import API endpoint
- `src/lib/services/csv-import.ts` - CSV validation and processing service
- `src/app/(dashboard)/school/students/page.tsx` - Student management UI with CSV import

---

### Epic 3: Daily Academic Operations (Attendance, Diaries, Gradebook)

**Status:** ✅ Implemented

- **REQ-3.1 (One-Click Attendance Grid):** Teachers access an attendance roster for their assigned section. Defaults to "All Present" with single-tap toggle to "Absent" or "Late". Submitting locks the timestamp and triggers the notification pipeline.

- **REQ-3.2 (Digital Classroom Diary):** Teachers post daily homework assignments, subject notes, syllabus coverage, and announcement reminders per subject. Parents receive immediate visibility on their dashboard.

- **REQ-3.3 (Gradebook & Term Reports):** Teachers enter scores for quizzes, assignments, midterm, and final examinations. System auto-computes percentage, GPA/letter grades, and class percentiles.

**Implementation:**
- `src/app/api/attendance/route.ts` - Attendance API
- `src/app/(dashboard)/teacher/attendance/page.tsx` - Attendance marking UI
- `src/app/(dashboard)/teacher/diary/page.tsx` - Classroom diary UI
- `src/app/(dashboard)/teacher/grades/page.tsx` - Gradebook UI

---

### Epic 4: Invoicing, Regional Payments & School P&L Ledger

**Status:** ✅ Implemented

- **REQ-4.1 (Recurring Monthly Vouchers):** Automated batch generator produces monthly fee vouchers based on tuition tiers, transportation fees, concessions/scholarships, and dynamic late-fee penalty rules after the due date.

- **REQ-4.2 (Payment Gateway Integration):** Integrated checkout supports local payment rails (1LINK 1BILL voucher numbers, direct bank transfers, Pakistani regional gateways like APPS/PayFast) and standard credit/debit card processing.

- **REQ-4.3 (Automated Reconciliation):** Webhooks reconcile voucher statuses from `PENDING` to `PAID`, issuing instant digital receipts to parents.

- **REQ-4.4 (Expense Tracking & P&L Analytics):** School Admins can log line-item operational expenses (Teacher/Staff Payroll, Building Rent, Utilities/Electricity, Supplies). The dashboard computes real-time gross revenue, operating costs, and net profit/loss.

**Implementation:**
- `src/app/api/invoices/route.ts` - Invoice generation and management API
- `src/app/api/expenses/route.ts` - Expense tracking API
- `src/app/(dashboard)/school/invoices/page.tsx` - Fee management UI
- `src/app/(dashboard)/school/expenses/page.tsx` - Expense tracking UI
- `src/app/(dashboard)/school/reports/page.tsx` - P&L analytics dashboard

---

### Epic 5: AI Student Diagnostic Counselor (Parent Portal)

**Status:** ✅ Implemented

- **REQ-5.1 (Isolated Context Retrieval):** Parents can converse with an embedded AI Assistant that queries exclusively that child's performance metrics:
  - Attendance history (% present, consecutive leaves).
  - Grade trends per subject (historical dips or improvements).
  - Teacher diary entries and behavioral notes.

- **REQ-5.2 (Guardrails & Privacy):** The LLM pipeline is strictly isolated:
  - Prompt templates enforce context compaction containing only sanitized JSON summaries of the verified child.
  - Strict prohibition against disclosing other students' names, class-wide grades, teacher contact details, or school financial records.

- **REQ-5.3 (Persona & Tone):** The AI acts as an empathetic, constructive academic counselor offering actionable study schedules, revision techniques, and focus areas based on the child's weakest subject areas.

**Implementation:**
- `src/app/api/ai-counselor/route.ts` - AI counselor API endpoint
- `src/lib/services/ai-counselor.ts` - Context building and AI integration
- `src/app/(dashboard)/parent/ai-counselor/page.tsx` - AI counselor chat UI

---

### Epic 6: Multi-Channel Automated Notification Pipeline

**Status:** ✅ Implemented

- **REQ-6.1 (Event-Driven Triggers):** Automated dispatches occur upon:
  - Daily attendance marking (immediate alert for absences or late arrivals).
  - Digital diary/homework publishing.
  - Monthly fee voucher generation and payment overdue alerts.
  - Exam report card publishing.

- **REQ-6.2 (Delivery Channels):** Multi-channel engine fans out via WhatsApp Cloud API / Workers messaging queues, SMS gateways, and web push notifications.

**Implementation:**
- `src/lib/services/notifications.ts` - Multi-channel notification service
- Integration points in attendance, diary, and invoice services

---

## 4. Non-Functional Requirements & Security Guardrails

### Edge Latency & Performance
- Core dashboard views achieve sub-150ms Time to First Byte (TTFB) via Cloudflare Edge network caching and serverless execution.

### Zero Data Leakage
- Supabase Row-Level Security (RLS) policies enabled on every table.
- Unit and integration tests actively assert that queries using Tenant A credentials return empty result sets for Tenant B records.

### Rate Limiting & Threat Boundary
- All public edge entry points, authentication handlers, and AI chat endpoints protected with boundary rate limits (token bucket/sliding window algorithms).
- Bot-detection heuristics via Arcjet (planned integration).

### Audit Logging
- Every administrative mutation (bulk imports, fee adjustments, grade modifications, expense additions) logs an immutable entry containing `timestamp`, `user_id`, `school_id`, `action`, and `diff_payload`.

**Implementation:**
- `src/lib/services/audit.ts` - Comprehensive audit logging service

---

## 5. Success Metrics & Key Performance Indicators (KPIs)

1. **Parent Engagement:** >80% of registered parents actively check the digital diary or attendance weekly.

2. **Fee Collection Velocity:** Reduction in average monthly fee collection turnaround from 18 days to under 5 days via online payment rails and automated WhatsApp reminders.

3. **Admin Administrative Efficiency:** Reduction in student onboarding and ID generation time from hours to under 60 seconds for a 500-student batch.

4. **AI Helpfulness Rate:** >75% positive parent feedback on AI diagnostic study tips without any privacy or security violation reports.

---

## 6. Technical Architecture

### Database Schema

The system uses PostgreSQL with Drizzle ORM, featuring:

- **Multi-tenant isolation** via `school_id` foreign keys on all tables
- **Comprehensive indexing** for query performance
- **Enum types** for data consistency
- **JSON fields** for flexible metadata storage

### API Design

RESTful API endpoints following Next.js App Router conventions:

- Authentication via NextAuth.js with JWT
- Role-based middleware for endpoint protection
- Zod validation for all inputs
- Consistent error handling

### Frontend Architecture

- **Component-based UI** with reusable components
- **Responsive design** with Tailwind CSS
- **Role-specific dashboards** with appropriate navigation
- **Real-time updates** (planned with Supabase Realtime)

---

## 7. Deployment & Infrastructure

### Recommended Stack

- **Frontend Hosting:** Vercel (Next.js optimized)
- **Database:** Supabase (PostgreSQL)
- **Edge Runtime:** Cloudflare Workers
- **File Storage:** Supabase Storage
- **Email:** Resend
- **SMS/WhatsApp:** Twilio / WhatsApp Cloud API

### Environment Variables

See `.env.local.example` for required configuration.

---

## 8. Future Enhancements

- [ ] Mobile app (React Native)
- [ ] Parent-teacher meeting scheduler
- [ ] Student performance analytics with ML
- [ ] Multi-language support (Urdu, Arabic)
- [ ] Offline mode for attendance marking
- [ ] Integration with Google Classroom
- [ ] Student behavior tracking
- [ ] Transport management module
- [ ] Inventory management
- [ ] Alumni network module

---

## 9. Support & Maintenance

For technical support or feature requests, contact the development team.

---

**Document Version:** 1.0.0  
**Last Updated:** September 2024  
**Status:** Production Ready
