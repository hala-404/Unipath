# UNIPATH

**AI-assisted university application support system for prospective students.**

UNIPATH helps students discover universities that fit their academic profile, track their applications, compare programs side by side, and get conversational guidance from an LLM-powered advisor — all from a single web app.

> Undergraduate graduation project — College of Software Engineering, Sichuan University.

---

## Features

- 🎓 **University search & filtering** — filter by GPA eligibility, city, program, and language of instruction.
- 🤖 **AI advisor (chat)** — conversational guidance powered by an LLM, with context awareness over the chat history (tracks mentioned majors, detects when the user wants alternatives, extracts interests).
- ⭐ **Personalized recommendations** — programs and universities matched to the student's profile (GPA, interests, preferred city, language, target program).
- 📋 **Application tracker** — track deadlines, required documents, and application status across multiple universities.
- 🔀 **Side-by-side comparison** — compare multiple universities on key attributes.
- 👤 **Student profile** — persisted academic profile that feeds both recommendations and the advisor.
- 📊 **Dashboard** — overview of saved universities, tracked applications, and upcoming deadlines.
- ⏰ **Deadline reminders** — scheduled email reminders via a background job.
- 🔐 **Authentication** — handled via Clerk.

---

## Tech Stack

**Frontend**
- React 18 + Vite
- Tailwind CSS
- Clerk (authentication)
- ESLint

**Backend**
- Node.js + Express
- PostgreSQL (via `pg` connection pool)
- Clerk SDK for Express (`@clerk/express`)
- Axios (for LLM API calls)
- Cloudinary (image hosting for university photos)
- Node-cron / scheduled jobs (deadline reminders)
- Nodemailer (email service)

**AI / LLM**
- OpenRouter API
- Model: `meta-llama/llama-3-8b-instruct`

**Testing**
- Smoke tests for `/health` and `/universities` endpoints

---

## Repository Structure

```
Unipath/
├── backend/
│   ├── app.js                    # Express app setup
│   ├── server.js                 # Entry point
│   ├── config/
│   │   ├── env.js                # Environment loading
│   │   └── cloudinary.js         # Cloudinary client
│   ├── controllers/
│   │   ├── chat.controller.js            # AI advisor logic
│   │   ├── recommendation.controller.js  # Matching logic
│   │   ├── tracker.controller.js         # Application tracker
│   │   ├── dashboard.controller.js
│   │   ├── profile.controller.js
│   │   └── university.controller.js
│   ├── routes/                   # Express route definitions
│   ├── middleware/
│   │   ├── asyncHandler.js
│   │   └── errorHandler.js
│   ├── services/
│   │   └── email.service.js      # Reminder emails
│   ├── jobs/
│   │   └── reminder.job.js       # Scheduled deadline reminders
│   ├── db/
│   │   ├── pool.js               # PostgreSQL connection pool
│   │   ├── migrations/           # Schema migrations
│   │   └── seeds/                # Seed data (universities)
│   ├── scripts/                  # Utility scripts (image population, etc.)
│   ├── utils/
│   └── tests/                    # Jest / supertest smoke tests
│
├── frontend/
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       ├── pages/
│       │   ├── Home.jsx
│       │   ├── Dashboard.jsx
│       │   ├── Profile.jsx
│       │   ├── Recommendations.jsx
│       │   ├── Tracker.jsx
│       │   ├── Compare.jsx
│       │   ├── ChatPage.jsx
│       │   └── UniversityDetails.jsx
│       ├── components/
│       │   ├── AppLayout.jsx
│       │   ├── Navbar.jsx
│       │   ├── AIAdvisorPage.jsx
│       │   ├── UniversityRecommendationCard.jsx
│       │   └── university-details/
│       ├── api/                  # Frontend → backend API clients
│       ├── hooks/
│       └── utils/
│
└── docs/
    ├── progress_log.md           # Development progress log
    └── experiment-results.md
```

---

## Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **PostgreSQL** ≥ 14 (developed and tested on PostgreSQL 16)
- A **Clerk** account (for authentication keys)
- An **OpenRouter** API key (for the AI advisor)
- *(Optional)* **Cloudinary** account if you want to populate university images
- *(Optional)* SMTP credentials if you want deadline reminder emails to actually send

### 1. Clone the repository

```bash
git clone https://github.com/hala-404/Unipath.git
cd Unipath
```

### 2. Set up the database

```bash
# Create the database
createdb unipath_db

# Run migrations
psql unipath_db -f backend/db/migrations/001_add_profile_columns.sql

# Load seed universities
psql unipath_db -f backend/db/seeds/universities_seed.sql
```

### 3. Configure backend environment

Create `backend/.env`:

```env
# Server
PORT=5000
NODE_ENV=development

# Database
DATABASE_URL=postgresql://<user>:<password>@localhost:5432/unipath_db

# Auth (Clerk)
CLERK_PUBLISHABLE_KEY=pk_test_xxx
CLERK_SECRET_KEY=sk_test_xxx

# AI
OPENROUTER_API_KEY=sk-or-xxx

# Email (optional — required for deadline reminders)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
EMAIL_FROM="UniPath <noreply@unipath.app>"

# Cloudinary (optional — required for image population scripts)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

### 4. Install and run the backend

```bash
cd backend
npm install
npm start
```

The API will be available at `http://localhost:5000`. You can verify it's up by hitting `http://localhost:5000/health`.

### 5. Configure frontend environment

Create `frontend/.env`:

```env
VITE_API_BASE_URL=http://localhost:5000
VITE_CLERK_PUBLISHABLE_KEY=pk_test_xxx
```

### 6. Install and run the frontend

```bash
cd frontend
npm install
npm run dev
```

The app will be available at `http://localhost:5173` (default Vite port).

---

## API Overview

| Method | Endpoint              | Purpose                                  |
|--------|-----------------------|------------------------------------------|
| GET    | `/health`             | Health check                             |
| GET    | `/universities`       | List/filter universities                 |
| GET    | `/universities/:id`   | University details                       |
| GET    | `/profile`            | Get current user's profile               |
| PUT    | `/profile`            | Update profile                           |
| GET    | `/recommendations`    | Personalized university recommendations  |
| GET    | `/tracker`            | List tracked applications                |
| POST   | `/tracker`            | Add application to tracker               |
| PATCH  | `/tracker/:id`        | Update tracked application               |
| DELETE | `/tracker/:id`        | Remove from tracker                      |
| GET    | `/dashboard`          | Dashboard summary                        |
| POST   | `/chat`               | Send a message to the AI advisor         |

> Routes are defined in `backend/routes/`. Authenticated routes require a valid Clerk session.

---

## Running Tests

```bash
cd backend
npm test
```

Current coverage is limited to smoke tests for the health endpoint and the universities endpoint.

---

## How the AI Advisor Works

The chat advisor (`backend/controllers/chat.controller.js`) is **not** a trained model — it is an LLM wrapper with rule-based routing around it:

1. The user message and recent conversation history are normalized.
2. Helper functions (`wantsAlternatives`, `extractMentionedMajors`, `extractInterestsFromHistory`) inspect the conversation for intent and context.
3. The user's profile and a filtered set of candidate universities from PostgreSQL are injected into the system prompt.
4. The prompt is sent to `meta-llama/llama-3-8b-instruct` via OpenRouter.
5. The model's response is parsed (with `safeJsonParse` for structured outputs) and returned to the frontend.

This is an intentional design choice for the prototype: it keeps inference costs low and behavior predictable, while still providing a natural-language interface for students.

---

## Known Limitations

- **Small dataset.** The seed contains a curated set of universities; this is a prototype, not a production catalog.
- **Filter-based recommendations.** Matching is rule-based (GPA threshold + city/program/language filters), not learned from data.
- **Smoke-test coverage only.** Backend tests verify availability, not full controller behavior.
- **No real-time data ingestion.** University information is static seed data.
- **Email reminders require SMTP configuration** to actually send.

---

## Roadmap

- [ ] Real-time data ingestion (web scraping + scheduled refresh)
- [ ] Document storage for application materials
- [ ] Scholarship and financial aid recommendations
- [ ] Expanded AI advisor (personal statement feedback, CV tips)
- [ ] Community features (forums, Q&A)
- [ ] Expand test coverage to controller-level
- [ ] Larger university dataset

---

## Author

**Hala Serbouti** — Undergraduate, College of Software Engineering, Sichuan University

GitHub: [@hala-404](https://github.com/hala-404)

---

## License

This project is part of an undergraduate graduation thesis at Sichuan University. All rights to the code and associated thesis materials belong to Sichuan University in accordance with the College's graduation project policy.