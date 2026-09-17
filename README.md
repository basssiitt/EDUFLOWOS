# EduFlow - Multi-Tenant School Management System

A comprehensive, cloud-native School Management System built with Next.js, Supabase, and Drizzle ORM.

## 🚀 Features

### Multi-Tenant Architecture
- **Tenant Isolation**: Strict data isolation per school using PostgreSQL Row-Level Security
- **Role-Based Access Control**: Super Admin, School Admin, Teacher, Parent roles
- **Subdomain/Tenant Routing**: Each school gets its own portal path

### Core Modules

#### 1. Student Management
- **Bulk CSV Import**: Import hundreds of students with validation and preview
- **Batch Identity Provisioning**: Auto-generate student IDs and parent credentials
- **Guardian Linking**: Automatic parent account creation and student linking

#### 2. Academic Operations
- **One-Click Attendance**: Quick attendance marking with "All Present" default
- **Digital Classroom Diary**: Homework, assignments, and announcements
- **Gradebook**: Comprehensive grade management with auto GPA calculation

#### 3. Financial Management
- **Fee Voucher Generation**: Automated monthly invoice generation
- **Payment Gateway Integration**: Support for local payment rails (1LINK, PayFast, etc.)
- **Expense Tracking**: Categorized expense management
- **P&L Analytics**: Real-time profit and loss reporting

#### 4. AI Academic Counselor
- **Isolated Context**: AI only accesses verified child's data
- **Privacy-First**: No cross-student data leakage
- **Actionable Insights**: Study schedules, focus areas, attendance analysis

#### 5. Notification Pipeline
- **Multi-Channel**: WhatsApp, SMS, Email, Push notifications
- **Event-Driven**: Attendance alerts, diary updates, fee reminders
- **Automated Workflows**: Trigger-based notification dispatch

## 🛠 Tech Stack

- **Frontend**: Next.js 14 (App Router), React, Tailwind CSS
- **Backend**: Next.js API Routes, Server Actions
- **Database**: Supabase (PostgreSQL) with Drizzle ORM
- **Authentication**: NextAuth.js with JWT
- **Edge Runtime**: Cloudflare Edge (planned)
- **Rate Limiting**: Arcjet (planned)
- **AI**: OpenAI / Anthropic integration

## 📁 Project Structure

```
eduflowos/
├── src/
│   ├── app/
│   │   ├── (auth)/           # Auth pages (login, register)
│   │   ├── (dashboard)/      # Dashboard layouts and pages
│   │   │   ├── admin/        # Super Admin dashboard
│   │   │   ├── school/       # School Admin dashboard
│   │   │   ├── teacher/      # Teacher dashboard
│   │   │   └── parent/       # Parent dashboard
│   │   └── api/              # API routes
│   │       ├── auth/         # Authentication endpoints
│   │       ├── students/     # Student CRUD
│   │       ├── attendance/   # Attendance management
│   │       ├── invoices/     # Fee management
│   │       └── ai-counselor/ # AI chat endpoint
│   ├── components/
│   │   ├── ui/               # Reusable UI components
│   │   ├── layout/           # Layout components (sidebar, header)
│   │   └── dashboard/        # Dashboard-specific components
│   ├── lib/
│   │   ├── db/               # Database schema and connection
│   │   ├── auth/             # Authentication configuration
│   │   ├── middleware/       # Auth middleware
│   │   ├── services/         # Business logic services
│   │   ├── utils/            # Utility functions
│   │   └── validators/       # Zod schemas
│   ├── hooks/                # Custom React hooks
│   └── types/                # TypeScript type definitions
├── drizzle/                  # Database migrations
└── public/                   # Static assets
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL database (or Supabase account)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/eduflowos.git
   cd eduflowos
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.local.example .env.local
   ```
   
   Edit `.env.local` with your database and service credentials.

4. **Set up the database**
   ```bash
   # Generate migrations
   npm run db:generate
   
   # Run migrations
   npm run db:migrate
   
   # Seed the database with demo data
   npm run db:seed
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open the application**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

### Demo Credentials

After seeding the database, you can use these credentials:

| Role | Email | Password |
|------|-------|----------|
| Super Admin | basithunyawrr@gmail.com | Admin@123 |
| School Admin | admin@demoacademy.com | password123 |
| Teacher | teacher@demoacademy.com | password123 |
| Parent | ali.khan@email.com | password123 |

## 📊 Database Schema

### Core Tables

- **schools**: Tenant information and subscription details
- **users**: All users (admins, teachers, parents) with role-based access
- **students**: Student records linked to sections
- **parent_students**: Parent-student relationships
- **classes/sections**: Academic structure
- **subjects**: Subject catalog
- **teacher_assignments**: Teacher-subject-section mappings

### Academic Tables

- **attendance**: Daily attendance records
- **diary_entries**: Homework and announcements
- **exams/exam_subjects**: Exam definitions
- **grades**: Student grade records

### Financial Tables

- **fee_structures**: Fee definitions per class
- **invoices**: Monthly fee vouchers
- **payments**: Payment records
- **student_concessions**: Scholarships and discounts
- **expenses**: Operational expense tracking

### System Tables

- **notifications**: Multi-channel notification queue
- **audit_logs**: Immutable audit trail
- **ai_conversations/ai_messages**: AI counselor chat history

## 🔒 Security Features

### Row-Level Security (RLS)

Every table enforces tenant isolation:
```sql
-- Example RLS policy
CREATE POLICY tenant_isolation ON students
  USING (school_id = current_setting('app.current_school_id')::uuid);
```

### Audit Logging

All administrative mutations are logged:
- Bulk imports
- Fee adjustments
- Grade modifications
- Expense additions

### Data Privacy

- AI counselor only accesses verified child's data
- No cross-student information leakage
- Strict prompt template isolation

## 🎯 Key Features Implementation

### Bulk CSV Import

1. Upload CSV with student data
2. Pre-validation checks:
   - Duplicate roll numbers
   - Malformed phone numbers
   - Invalid emails
   - Class/section existence
3. Preview with error highlighting
4. Batch creation with transaction rollback
5. Automatic parent account provisioning
6. Credential generation and notification

### Attendance System

1. Teachers select class and date
2. "All Present" default with tap-to-toggle
3. Status options: Present, Absent, Late, Excused
4. Submission locks the record
5. Automatic parent notifications for absences

### Fee Management

1. Define fee structures per class
2. Set concessions/scholarships per student
3. Generate monthly invoices in bulk
4. Automatic late fee calculation
5. Payment reconciliation via webhooks
6. Digital receipt generation

### AI Academic Counselor

1. Parent selects their child
2. System builds sanitized context:
   - Attendance history
   - Grade trends
   - Recent diary entries
   - Subject performance
3. LLM generates empathetic, actionable advice
4. Conversation history maintained
5. Privacy guardrails enforced

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/[...nextauth]` - NextAuth endpoints

### Students
- `GET /api/students` - List students
- `POST /api/students` - Create student
- `POST /api/csv-import` - Bulk import from CSV

### Attendance
- `GET /api/attendance` - Get attendance records
- `POST /api/attendance` - Submit attendance

### Invoices
- `GET /api/invoices` - List invoices
- `POST /api/invoices` - Generate monthly invoices

### Expenses
- `GET /api/expenses` - List expenses
- `POST /api/expenses` - Add expense

### AI Counselor
- `GET /api/ai-counselor` - Get conversation history
- `POST /api/ai-counselor` - Send message

## 📈 Performance Targets

- **Edge Latency**: Sub-150ms TTFB via Cloudflare Edge
- **Batch Processing**: 500 students in under 60 seconds
- **Real-time Updates**: Instant notification dispatch
- **Concurrent Users**: Support for 1000+ simultaneous users

## 🚀 Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project in Vercel
3. Configure environment variables
4. Deploy

### Docker

```bash
docker build -t eduflowos .
docker run -p 3000:3000 eduflowos
```

### Manual Deployment

```bash
npm run build
npm start
```

## 📝 License

This project is proprietary software. All rights reserved.

## 🤝 Support

For support, email support@eduflow.com or join our Slack channel.

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Supabase for the backend infrastructure
- Drizzle team for the excellent ORM
- All contributors and testers

---

**Built with ❤️ for modern education**
