# FinanceFlow | Personal Wealth & Finance Manager

FinanceFlow is a full-stack, personal finance management platform designed to help users track cashflow, set category-based monthly budgets, build savings goals, manage recurring bills, and visualize financial trends.

Built from scratch with a domain-driven architecture, security-first mindset, and responsive UI design.

---

## 📸 Application Preview

### Dashboard

![FinanceFlow Dashboard](Screenshot%202026-09-28%20164802.png)

### Finance Management View

![FinanceFlow Application](Screenshot%202026-09-28%20164812.png)

---

## 🚀 Key Features

### 🔐 Security & Multi-Tenant Authorization
- **HttpOnly Cookie Authentication**: JWT stored safely in HttpOnly, SameSite cookies to mitigate XSS risks.
- **Strict Data Isolation**: Every database query is scoped to the authenticated user ID (`userId`). Cross-user URL manipulation or payload tampering returns 404/403.
- **Password Hashing**: Cryptographic password hashing using `bcryptjs` (salt factor 10).
- **Security Middlewares**: Equipped with `helmet` for HTTP headers security, `cors` configured strictly to allowed origins, and `express-rate-limit` for rate limiting.
- **Request Validation**: Zod schemas validate every API request body and query parameter before hitting controllers.

### 📊 Modern Financial Dashboard
- Real-time aggregation of **Total Balance**, **Monthly Income**, **Monthly Expenses**, **Total Savings**, and **Remaining Budget**.
- Interactive **Income vs. Expense** cashflow chart and **Category Spending** pie chart using Recharts.
- Quick action modal triggers for fast transaction entry, budget creation, and goal setting.
- Upcoming recurring bill reminders and recent activity stream.

### 💳 Complete Transaction Management
- Comprehensive income and expense tracking with category, merchant/source, date, description, and notes.
- Search by keyword and multi-field filters (type, category, date range, amount range).
- Sorting options (Newest, Oldest, Highest Amount, Lowest Amount) with server-side pagination.
- One-click **CSV Transaction Export**.

### 🏷️ Categories & Customization
- Automatic seeding of default income (Salary, Freelance, Business, Investment, Gift, etc.) and expense categories (Housing, Food, Transportation, Utilities, Health, Shopping, Travel, etc.).
- Custom user category creation with custom color badges and icons.
- Protected category deletion (prevents deleting categories linked to existing transactions).

### 🎯 Monthly Budgets & Visual Thresholds
- Set overall or category-specific monthly budget caps.
- Dynamic spending calculations based on actual expense transactions in the active month.
- Visual warning thresholds at **75%**, **90%**, and **100%+** limit warnings.

### 🐷 Savings Goals & Contributions
- Create milestone savings goals (e.g. Emergency Reserve, Home Deposit, Vacation).
- Real-time progress visualization, remaining balance calculations, and target completion flags.
- Dedicated contribution modal to incrementally deposit towards goals.

### 🔄 Recurring Payments & Auto-Processing
- Schedule recurring income or bills (weekly, monthly, yearly).
- One-click or automated background processor to generate actual transactions on due dates without duplicates.

### 📈 Financial Analytics & Reporting
- Dedicated reporting suite supporting year views, current month, previous month, and custom date range filters.
- Breakdown of top expense categories, net cashflow trends, and monthly breakdown tables.

### ⚙️ User Settings & Internationalization Display
- Multi-currency display support (**USD**, **EUR**, **GBP**, **ETB**).
- Dark and Light mode theme toggle with persistent state.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router v6
- **Data Fetching & Caching**: TanStack Query (React Query)
- **Icons**: Lucide React
- **Charts**: Recharts

### Backend
- **Runtime**: Node.js + Express + TypeScript
- **Database & ORM**: MongoDB + Mongoose
- **Authentication**: JWT in HttpOnly Cookies + BcryptJS
- **Validation**: Zod
- **Security**: Helmet, CORS, Express-Rate-Limit
- **Testing**: Jest + Supertest + MongoDB Memory Server

---

## 📁 Project Structure

```text
personal-finance-manager/
├── docker-compose.yml
├── README.md
├── .gitignore
├── Screenshot 2026-09-28 164802.png
├── Screenshot 2026-09-28 164812.png
│
├── backend/
│   ├── src/
│   │   ├── config/          # Environment & MongoDB connection
│   │   ├── controllers/     # Controller handlers
│   │   ├── middleware/      # Auth, Zod validation, rate limiter, error handling
│   │   ├── models/          # Mongoose models
│   │   ├── routes/          # Express REST API routes
│   │   ├── services/        # Core business logic & database queries
│   │   ├── utils/           # JWT & CSV export utilities
│   │   ├── validators/      # Zod validation schemas
│   │   ├── app.ts           # Express app setup
│   │   └── server.ts        # Server entrypoint
│   ├── src/__tests__/
│   ├── Dockerfile
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/
    │   ├── context/
    │   ├── features/
    │   ├── pages/
    │   ├── services/
    │   ├── types/
    │   ├── utils/
    │   ├── App.tsx
    │   └── main.tsx
    ├── Dockerfile
    └── package.json
```

---

## 💻 Local Setup & Execution

### Prerequisites
- **Node.js**: v18+ or v22+
- **MongoDB**: Local MongoDB instance running on `mongodb://127.0.0.1:27017` (or Docker container)

### 1. Backend Setup

```bash
cd backend
npm install
npm run build
npm test
npm run dev
```

Backend runs on:

```text
http://localhost:5000
```

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run build
npm run dev
```

Frontend runs on:

```text
http://localhost:5173
```

---

## 🐳 Docker Deployment

```bash
docker-compose up --build
```

Access:
- **Frontend**: `http://localhost:5173`
- **Backend API**: `http://localhost:5000`

---

## 🔐 Security Protections Summary

1. **HttpOnly Cookie Tokens** — protects authentication tokens from client-side JavaScript access.
2. **Multi-Tenant Ownership Verification** — user-owned records are scoped to the authenticated user.
3. **Request Validation** — Zod schemas validate incoming payloads.
4. **Rate Limiting** — authentication routes are rate limited to reduce brute-force attempts.

---

## 🌐 API Endpoint Reference

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register new user account | No |
| `POST` | `/api/auth/login` | Log in and receive HttpOnly cookie | No |
| `POST` | `/api/auth/logout` | Clear authentication cookie | Yes |
| `GET` | `/api/auth/me` | Fetch active user profile session | Yes |
| `PATCH` | `/api/auth/profile` | Update profile preferences & currency | Yes |
| `GET` | `/api/transactions` | Query & filter transactions | Yes |
| `POST` | `/api/transactions` | Create new transaction record | Yes |
| `GET` | `/api/transactions/export/csv` | Download CSV transaction report | Yes |
| `GET` | `/api/categories` | Get user categories | Yes |
| `POST` | `/api/categories` | Create custom category | Yes |
| `GET` | `/api/budgets` | Fetch monthly budget progress | Yes |
| `POST` | `/api/budgets` | Create monthly category budget cap | Yes |
| `GET` | `/api/savings` | Fetch active savings goals | Yes |
| `POST` | `/api/savings/:id/contribute` | Add deposit contribution to goal | Yes |
| `GET` | `/api/recurring` | Fetch recurring payment schedules | Yes |
| `POST` | `/api/recurring/process` | Trigger process due recurring items | Yes |
| `GET` | `/api/reports/dashboard` | Fetch dashboard overview statistics | Yes |
| `GET` | `/api/reports/analytics` | Fetch detailed analytical reports | Yes |

---

## 📄 License

This project is licensed under the MIT License.
