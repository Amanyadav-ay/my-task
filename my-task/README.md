# 🎯 MY TASK — Complete Full-Stack Productivity Platform

> **"Plan Your Day. Track Your Progress. Achieve Your Goals."**

MY TASK is an intelligent, full-stack productivity, task management, goal tracking, calendar planning, and productivity analytics web platform built with **React 18, Vite, Tailwind CSS, Node.js, Express.js, Prisma ORM, and PostgreSQL**.

---

## 📑 Table of Contents

1. [Features Overview](#-features-overview)
2. [Technology Stack](#-technology-stack)
3. [Architecture & Folder Structure](#-architecture--folder-structure)
4. [Prerequisites](#-prerequisites)
5. [Quick Start Installation (Windows & VS Code)](#-quick-start-installation-windows--vs-code)
6. [Database Setup & Prisma Migrations](#-database-setup--prisma-migrations)
7. [Default Demo Credentials](#-default-demo-credentials)
8. [REST API Documentation](#-rest-api-documentation)
9. [Automated Testing](#-automated-testing)
10. [AI Integration & Fallback Engine](#-ai-integration--fallback-engine)
11. [Production Deployment Guide (Vercel & Render)](#-production-deployment-guide)

---

## ✨ Features Overview

### 1. Personalized User Profiles
- **Student Dashboard**: Study planner, course assignments tracker, subject management, and exam countdowns.
- **Working Professional**: Sprint tasks, project milestones, meeting planner, and weekly performance matrices.
- **Freelancer**: Client deliverables, client-wise tasks, project milestones, and invoicing to-dos.
- **Personal Use**: Daily routine, habit tracker, personal health & fitness goals, and household reminders.

### 2. Comprehensive Task Management
- Full CRUD operations with priority tags (High, Medium, Low) and status transitions (*Pending, In Progress, Completed, Overdue*).
- Interactive subtask checklists with auto-calculated task progress percentages.
- Recurrence engine: Never, Daily, Weekly, Monthly, or Custom repeat intervals without duplicate recurrence errors.
- Categorization, estimated focus duration, date and time pickers, personal notes, and file attachments.
- Bulk task operations: Bulk completion, bulk deletion, and bulk rescheduling.

### 3. Interactive FullCalendar
- FullCalendar view featuring Month, Week, and Day views.
- **Drag-and-Drop Task Rescheduling**: Moving an event on the calendar automatically updates `dueDate` and `dueTime` in the PostgreSQL database.
- Priority-based color coding (High: Crimson, Medium: Purple, Low: Emerald).

### 4. Goal & Milestone Tracking
- Create long-term targets (e.g. *"Become a Full-Stack Web Developer"*).
- Milestone checklists that dynamically update overall goal progress percentages.
- Visual milestone celebration with confetti effects upon reaching 100% completion.

### 5. Pomodoro Focus Timer
- 25-minute Deep Work sprint, 5-minute Short Break, and 15-minute Long Break intervals (or custom durations).
- **Timestamp-Based Precision**: The countdown never pauses or skews when browser tabs become inactive.
- Link timer directly to tasks; automatically logs completed focus sessions to the database.
- Optional audible finish chime.

### 6. Productivity Analytics (Recharts)
- 7-Day Velocity Bar Chart (Tasks created vs. tasks completed).
- Daily Focus Minutes Line Chart.
- Category-wise task distribution Pie Chart.
- Real database calculations—no hardcoded numbers or deceptive metrics.

### 7. AI Productivity Assistant
- **AI Task Breakdown**: Deconstructs high-level goals (e.g. *"Learn React in 7 days"*) into structured daily milestones with subtasks. Review and edit before saving to your schedule.
- **AI Smart Scheduling**: Analyzes pending/overdue tasks and optimizes your daily slots based on peak productivity windows.
- **Productivity Suggestions**: Context-aware recommendations.
- **Heuristic Engine Fallback**: Functions 100% out of the box even when no third-party AI API key is configured.

### 8. Smart Rescheduling
- Dedicated modal for missed deadlines: Select new deadlines, shift pending subtasks, and resolve scheduling conflicts without manual data entry.

### 9. Motivational Achievement Badges
- Real database-driven badges (Bronze, Silver, Gold, Platinum): *First Step Forward*, *Productive Momentum*, *Master of Execution*, *Visionary*, *Milestone Conqueror*, *Goal Champion*, *Deep Work Initiate*, and *Focus Champion*.

### 10. Smart Notifications & Background Jobs
- In-app notification center with real-time unread badges.
- Web Push API integration with background Service Worker.
- Background `node-cron` jobs running every 5 minutes checking for deadlines (2 days, 1 day, 3 hours, 1 hour before) with duplicate prevention.
- Weekly productivity reports generated automatically every Sunday.

---

## 🛠 Technology Stack

### Frontend
- **Framework**: React 18
- **Tooling & Bundler**: Vite
- **Styling**: Tailwind CSS (with Light & Dark mode support)
- **Routing**: React Router DOM v6
- **Icons**: Lucide React
- **Analytics Charts**: Recharts
- **Calendar**: FullCalendar (daygrid, timegrid, interaction)
- **HTTP Client**: Axios with credentials & automatic 401 token refresh
- **State Management**: Context API (Auth, Theme, Notifications)
- **Effects**: Canvas Confetti

### Backend
- **Runtime**: Node.js (ES Modules)
- **Framework**: Express.js
- **Database ORM**: Prisma ORM
- **Database**: PostgreSQL
- **Authentication**: JWT stored in secure `HttpOnly` cookies + bcrypt password hashing (12 rounds)
- **Security**: Helmet, CORS, Express Rate Limit, Express Validator
- **Scheduled Jobs**: Node Cron
- **File Uploads**: Multer with file type and size validation
- **Notifications**: Web Push API, Nodemailer
- **Testing**: Jest & Supertest

---

## 📁 Architecture & Folder Structure

```
my-task/
├── client/                     # Frontend Application
│   ├── public/
│   │   ├── logo.svg
│   │   └── sw.js               # Service Worker for Web Push
│   ├── src/
│   │   ├── assets/
│   │   ├── components/         # Reusable UI Components
│   │   │   ├── AIModal.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── NotificationDropdown.jsx
│   │   │   ├── QuickTaskModal.jsx
│   │   │   ├── RescheduleModal.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── StatCard.jsx
│   │   │   └── TaskModal.jsx
│   │   ├── context/            # Global State Providers
│   │   │   ├── AuthContext.jsx
│   │   │   ├── NotificationContext.jsx
│   │   │   └── ThemeContext.jsx
│   │   ├── layouts/
│   │   │   ├── AuthLayout.jsx
│   │   │   └── MainLayout.jsx
│   │   ├── pages/              # Application Pages
│   │   │   ├── AchievementsPage.jsx
│   │   │   ├── AnalyticsPage.jsx
│   │   │   ├── CalendarPage.jsx
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── FocusPage.jsx
│   │   │   ├── ForgotPasswordPage.jsx
│   │   │   ├── GoalsPage.jsx
│   │   │   ├── LandingPage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── MyDayPage.jsx
│   │   │   ├── OnboardingPage.jsx
│   │   │   ├── ResetPasswordPage.jsx
│   │   │   ├── SettingsPage.jsx
│   │   │   ├── SignupPage.jsx
│   │   │   └── TasksPage.jsx
│   │   ├── services/
│   │   │   └── api.js          # Centralized Axios client
│   │   ├── styles/
│   │   │   └── index.css       # Tailwind & FullCalendar overrides
│   │   ├── App.jsx             # Route definitions & ProtectedRoute
│   │   └── main.jsx            # React root mount
│   ├── index.html
│   ├── package.json
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── server/                     # Backend API Server
│   ├── prisma/
│   │   ├── schema.prisma       # 20 Normalized PostgreSQL models
│   │   └── seed.js             # Realistic demo data seed script
│   ├── src/
│   │   ├── config/             # Configuration modules
│   │   │   ├── database.js     # PrismaClient singleton
│   │   │   ├── env.js          # Environment variables
│   │   │   ├── mailer.js       # Nodemailer
│   │   │   └── webpush.js      # Web Push VAPID setup
│   │   ├── controllers/        # Request handlers
│   │   ├── jobs/               # Background scheduled jobs
│   │   │   ├── reminderCron.js
│   │   │   └── weeklyReportCron.js
│   │   ├── middleware/         # Auth, Upload, Rate Limiting, Validation
│   │   ├── routes/             # REST API routers
│   │   ├── services/           # Business logic layer
│   │   ├── utils/              # JWT, Date math, Response formatters
│   │   ├── validators/         # Express-validator validation rules
│   │   ├── app.js              # Express app setup
│   │   └── server.js           # Server bootstrap & port listener
│   ├── tests/
│   │   └── api.test.js         # Automated Jest/Supertest suite
│   ├── uploads/                # Task attachment files
│   ├── package.json
│   └── .env
│
├── .gitignore
├── .env.example
├── package.json
└── README.md
```

---

## ⚡ Quick Start Installation (Windows & VS Code)

### Step 1: Clone or Open in VS Code
Open the project directory in VS Code:
```powershell
cd c:\Users\amany\OneDrive\Desktop\AMAN-TASKS\my-task
code .
```

### Step 2: Install Dependencies
Open a PowerShell terminal in VS Code:
```powershell
# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

---

## 🗄 Database Setup & Prisma Migrations

### Option A: Local PostgreSQL (pgAdmin or Windows Service)
1. Ensure your PostgreSQL service is running on `localhost:5432`.
2. Create a database named `mytask_db`:
   ```sql
   CREATE DATABASE mytask_db;
   ```
3. Set your connection string in `my-task/server/.env`:
   ```env
   DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/mytask_db?schema=public"
   ```

### Option B: Free Cloud PostgreSQL (Neon / Supabase / Render)
1. Create a free PostgreSQL database at [Neon.tech](https://neon.tech) or [Supabase.com](https://supabase.com).
2. Copy your pooled connection string into `my-task/server/.env`:
   ```env
   DATABASE_URL="postgresql://user:password@ep-sample-1234.us-east-2.aws.neon.tech/mytask_db?sslmode=require"
   ```

### Step 3: Run Database Migrations & Seed Data
Inside `my-task/server`:
```powershell
# Push schema to PostgreSQL database
npx prisma db push

# Generate fresh Prisma Client
npx prisma generate

# Seed realistic demo data (Students, Professionals, Badges, Tasks, Goals)
npm run prisma:seed
```

---

## 🚀 Running the Application

### 1. Start Backend Server
In terminal 1:
```powershell
cd server
npm run dev
```
Backend will start on `http://localhost:5000`.
Health check: `http://localhost:5000/api/health`.

### 2. Start Frontend Client
In terminal 2:
```powershell
cd client
npm run dev
```
Frontend will start on `http://localhost:5173`. Open your browser and navigate to `http://localhost:5173`.

---

## 👤 Default Demo Credentials

You can log in immediately using any of the pre-seeded accounts:

| Role | Email | Password | Included Demo Content |
| :--- | :--- | :--- | :--- |
| **Student** | `student@mytask.local` | `Password123!` | Courses, Calculus & CS assignments, GPA goals, exam countdowns |
| **Professional** | `pro@mytask.local` | `Password123!` | Architecture slides, Cloud migration goals, sprint milestones |
| **Custom / New** | Register via `/signup` | Min 8 chars | Full onboarding quiz, automatic default category generation |

---

## 📡 REST API Documentation

All protected endpoints require an authenticated JWT session (provided automatically via `HttpOnly` cookie or `Authorization: Bearer <token>`).

### Authentication
- `POST /api/auth/register` — Register a new account
- `POST /api/auth/login` — Sign in and issue `accessToken` & `refreshToken` cookies
- `POST /api/auth/refresh` — Refresh access token
- `POST /api/auth/logout` — Revoke session and clear cookies
- `POST /api/auth/forgot-password` — Dispatch password reset link
- `POST /api/auth/reset-password` — Set new password using reset token

### User & Preferences
- `GET /api/users/me` — Retrieve logged-in user profile
- `PATCH /api/users/me` — Update name, userType, or avatar
- `GET /api/users/preferences` — Get notification and focus timer preferences
- `PATCH /api/users/preferences` — Update theme and pomodoro settings
- `GET /api/users/categories` — Get task categories
- `POST /api/users/categories` — Create custom category

### Tasks Management
- `GET /api/tasks` — Filtered tasks query (`status`, `priority`, `categoryId`, `search`, `dueDate`, `isToday`)
- `POST /api/tasks` — Create task with subtasks, recurrence, and reminders
- `GET /api/tasks/:id` — Retrieve task details
- `PATCH /api/tasks/:id` — Update task details
- `DELETE /api/tasks/:id` — Delete task
- `PATCH /api/tasks/:id/complete` — Toggle completed state
- `POST /api/tasks/:id/subtasks` — Add a new subtask
- `PATCH /api/tasks/:id/subtasks/:subtaskId` — Toggle subtask completion
- `POST /api/tasks/:id/attachments` — Upload file attachment
- `POST /api/tasks/bulk` — Perform bulk complete, delete, or reschedule

### Goals & Milestones
- `GET /api/goals` — List goals with progress percentages
- `POST /api/goals` — Create long-term goal with milestones
- `GET /api/goals/:id` — Goal details
- `PATCH /api/goals/:id` — Update goal
- `DELETE /api/goals/:id` — Delete goal
- `PATCH /api/goals/:id/milestones/:milestoneId` — Toggle milestone completion

### Calendar
- `GET /api/calendar/events` — Fetch scheduled events
- `POST /api/calendar/events` — Create calendar event
- `PATCH /api/calendar/events/:id` — Reschedule event (syncs linked task due date)
- `DELETE /api/calendar/events/:id` — Delete event

### Focus Sessions
- `GET /api/focus` — Retrieve session history and total minutes
- `POST /api/focus` — Log completed Pomodoro session

### Productivity Analytics
- `GET /api/analytics/dashboard` — High-level metric summary
- `GET /api/analytics/weekly` — 7-day created vs completed bar chart data
- `GET /api/analytics/monthly` — Category and priority breakdown

### AI Assistant
- `POST /api/ai/breakdown` — Generate structured daily task plan for complex goals
- `POST /api/ai/schedule` — Analyze deadlines and propose optimized schedule
- `GET /api/ai/suggestions` — Retrieve contextual productivity suggestions

### Notifications & Push
- `GET /api/notifications` — In-app notifications list
- `PATCH /api/notifications/:id/read` — Mark notification read
- `PATCH /api/notifications/read-all` — Mark all as read
- `POST /api/notifications/subscribe` — Register Web Push subscription
- `DELETE /api/notifications/subscribe` — Unsubscribe from Web Push

---

## 🧪 Automated Testing

To run the automated Jest and Supertest test suite:
```powershell
cd server
npm test
```
The test suite validates:
1. API Health check endpoint (200 OK)
2. Strict route protection on private endpoints (401 Unauthorized)
3. Input validation and password strength enforcement (400 Bad Request)
4. AI Heuristic Breakdown engine execution without external API keys
5. Goal progress percentage math across milestones and linked tasks
6. Recurrence calculation accuracy (Daily, Weekly, Monthly)

---

## 🌐 Production Deployment Guide

### Deploy Backend to Render
1. Create a **Web Service** on [Render.com](https://render.com) connected to your GitHub repository.
2. Set Root Directory to `my-task/server`.
3. Set Build Command to:
   ```bash
   npm install && npx prisma generate
   ```
4. Set Start Command to:
   ```bash
   npm start
   ```
5. Add Environment Variables:
   - `DATABASE_URL`: Your managed PostgreSQL connection URL
   - `JWT_ACCESS_SECRET`: A long random secret string
   - `JWT_REFRESH_SECRET`: A long random secret string
   - `CLIENT_URL`: `https://your-app.vercel.app`
   - `NODE_ENV`: `production`

### Deploy Frontend to Vercel
1. Import the repository on [Vercel](https://vercel.com).
2. Set Root Directory to `my-task/client`.
3. Framework Preset: **Vite**.
4. Set Build Command: `npm run build`.
5. Set Output Directory: `dist`.
6. Add Environment Variable:
   - `VITE_API_BASE_URL`: `https://your-backend.onrender.com`

---

## 📄 License

This project is licensed under the MIT License.
Designed and developed for high-performance productivity management.
