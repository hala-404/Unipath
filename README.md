# UNIPATH

**AI-assisted university application support system for prospective students.**

UNIPATH helps students discover universities that fit their academic profile, track their applications, compare programs side by side, and get conversational guidance from an LLM-powered advisor — all from a single web app.

> Undergraduate graduation project — College of Software Engineering, Sichuan University.

---

## Features

- 🎓 **University search & filtering** — filter by GPA eligibility, city, program, and language of instruction.
- 🤖 **AI advisor (chat)** — conversational guidance powered by an LLM, with context awareness over the chat history (tracks mentioned majors, detects when the user wants alternatives, extracts interests).
- ⭐ **Rule-based recommendations** — universities matched to the student's profile using transparent matching logic based on GPA eligibility, preferred city, program, language, and budget constraints.
- 📋 **Application tracker** — track deadlines, required documents, and application status across multiple universities.
- 🔀 **Side-by-side comparison** — compare multiple universities on key attributes.
- 👤 **Student profile** — persisted academic profile that feeds both recommendations and the advisor.
- 📊 **Dashboard** — overview of saved universities, tracked applications, and upcoming deadlines.
- ⏰ **Deadline reminders** — scheduled email reminders via a background job.
- 🔐 **Authentication** — handled via Clerk for secure user sessions.

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
- Native `fetch` (for LLM API calls)
- Cloudinary (image hosting for university photos)
- Node-cron / scheduled jobs (deadline reminders)
- Resend (transactional email service)

**AI / LLM**
- OpenRouter API
- Model: `meta-llama/llama-3-8b-instruct`

**Testing**
- Jest + Supertest (endpoint and unit tests with coverage)

---

## Repository Structure

```
Unipath/
├── backend/
│   ├── app.js                    # Express app setup
│   ├── server.js                 # Entry point
│   ├── .env.example
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
│   │   ├── email.service.js
│   │   └── chatPrompt.js
│   ├── jobs/
│   │   └── reminder.job.js       # Scheduled deadline reminders
│   ├── db/
│   │   ├── pool.js               # PostgreSQL connection pool
│   │   ├── migrations/           # Schema migrations
│   │   └── seeds/                # Seed data (universities)
│   ├── scripts/                  # Utility scripts (image population, etc.)
│   ├── utils/
│   │   ├── chatHelpers.js
│   │   ├── ensureLocalUser.js
│   │   └── logActivity.js
│   └── tests/
│       ├── health.test.js
│       ├── universities.test.js
│       ├── chatHelpers.test.js
│       ├── chatPrompt.test.js
│       └── tracker.test.js

├── frontend/
│   ├── index.html
│   ├── vite.config.js
│   ├── .env.example
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
psql unipath_db -f backend/db/migrations/000_init_schema.sql
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

| Method | Endpoint                       | Purpose                                  |
|--------|--------------------------------|------------------------------------------|
| GET    | `/health`                      | Health check                             |
| GET    | `/universities`                | List/filter universities                 |
| GET    | `/universities/:id`            | University details                       |
| GET    | `/universities/recommendations`| Personalized recommendations             |
| GET    | `/profile`                     | Get current user's profile               |
| PUT    | `/profile`                     | Update profile                           |
| GET    | `/applications`                | List tracked applications                |
| POST   | `/applications`                | Add application to tracker               |
| PUT    | `/applications/:id`            | Update application status                |
| PUT    | `/applications/:id/checklist`  | Update application checklist             |
| DELETE | `/applications/:id`            | Remove application                       |
| GET    | `/dashboard`                   | Dashboard summary                        |
| GET    | `/api/chat/suggestions`        | Get chat suggestions                     |
| POST   | `/api/chat`                    | Send a message to the AI advisor         |

> Routes are defined in `backend/routes/`. Protected routes require a valid Clerk-authenticated session in normal runtime configuration.

---

## Recommendation Design

The recommendation component uses a **rule-based matching approach** rather than learned models from historical user data.

**How it works:**
- Explicit matching logic across multiple attributes (GPA eligibility, preferred city, program alignment, language, and budget constraints)
- Each recommendation includes a transparency score showing how many user preferences were matched
- Recommendations can be explained clearly to the user (e.g., "matches your GPA", "fits your budget")

**Design rationale:**
This approach was chosen for the prototype because:
- Small curated dataset (not sufficient for collaborative filtering)
- Inference is deterministic and low-cost
- Clear explanations build user trust in a prototype environment
- Easy to iterate on matching criteria based on user feedback

**Future work** could extend this with content-based similarity metrics, retrieval-based methods, or learned recommendation techniques once sufficient user interaction data becomes available.

---

## Running Tests

```bash
cd backend
npm test
```

Current coverage is limited to smoke tests for the health endpoint and the universities endpoint.
The suite also covers chat helper logic, chat prompt construction, and duplicate tracker protection.

## Testing & Quality

- Backend tests use Jest and Supertest
- Coverage is enabled in the backend test script
- Endpoint tests cover health, universities, and tracker behavior
- Unit tests cover chat helpers and prompt logic
- CI runs backend tests plus the frontend build

---

## Docker (Backend)

The backend is containerized and can be built and run with Docker:

```bash
cd backend
docker build -t unipath-backend .
docker run -p 5050:5050 --env-file .env unipath-backend
```

The container exposes port `5050`, matching the backend's default `PORT`. Environment variables (database URL, OpenRouter key, etc.) should be supplied via `--env-file` or `-e` flags as shown above.

---

## Deployment

The system is designed for cloud deployment, with each layer mapped to a standard managed service:

- **Frontend:** Vercel or Netlify (static Vite build)
- **Backend:** Railway or Render (Node.js service, deployable directly from the included `Dockerfile`)
- **Database:** any managed PostgreSQL provider (Railway, Render, Supabase, Neon, etc.)

All configuration is environment-variable driven (see `backend/.env` template above), so no code changes are required to move between local, staging, and production environments. Continuous integration runs on every push via GitHub Actions (`.github/workflows/backend-tests.yml`), which executes the backend test suite and a frontend production build.

Due to the scope and timeframe of the graduation project, a live deployment was not finalized; the focus was on backend logic, recommendation quality, and the AI advisor pipeline. The architecture and packaging support direct deployment to the services listed above without modification.

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

- **Small curated dataset.** The seed contains approximately 50 curated universities; this is a prototype, not a production catalog.
- **Rule-based recommendations (not learned).** Matching uses explicit attribute matching (GPA threshold + city/program/language/budget filters), rather than models trained on user interaction data. Recommendation quality depends on dataset coverage and the accuracy of user-provided preferences.
- **Static data.** University information, rankings, and deadlines are loaded from seed data, not updated in real-time from external sources.
- **Smoke-test coverage only.** Backend tests verify endpoint availability and basic logic, not full controller behavior and edge cases.
- **Email reminders require SMTP configuration** to actually send notifications.

Future versions could improve recommendation quality by incorporating collaborative filtering, content-based similarity, or retrieval-augmented generation once sufficient user interaction data is available.

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