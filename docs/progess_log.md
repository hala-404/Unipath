UniPath Development Progress Log
Date: February 23, 2026
1. Database Setup

 PostgreSQL (v16) installed and configured via Homebrew.

 Created project database: unipath_db.

 Designed and implemented three core relational tables:

   - users

   - universities

   - applications

 Defined primary keys and foreign key relationships to maintain relational integrity.

 Inserted 30 structured university records as seed data for prototype testing.

2. Backend Initialization

 Initialized backend using Node.js and Express.

 Installed required backend dependencies:

   - express

   - pg

   - cors

   - dotenv

 Configured environment variables using .env.

 Implemented PostgreSQL connection pool using the pg library.

 Successfully established database connectivity between Express server and PostgreSQL.

3. Core API Endpoints Implemented

 Implemented /health endpoint to verify server and database connectivity.

 Implemented /universities endpoint to retrieve university records.

 Implemented dynamic filtering using query parameters:

   - GPA eligibility (min_gpa <= user_gpa)

   - City filtering using case-insensitive search

   - Program filtering using partial matching (ILIKE)

   - Language filtering using partial matching (ILIKE)

1. Search Optimization

 Enhanced filtering using wildcard pattern matching (%value%) to enable flexible search behavior.

 Implemented partial string matching allowing queries such as "Data" to match "Data Science" programs.

 Improved search usability for user queries.

5. Recommendation Engine (Prototype)

 Implemented a rule-based recommendation scoring algorithm.

 Scoring logic:

   +2 points if user GPA satisfies university GPA requirement

   +1 point for city match

   +1 point for program match

   +1 point for language match

 Developed /recommendations endpoint to return ranked universities.

 Results sorted by descending score.

6. System Status

   Backend server operational on port 5050.

   Database connection verified.

   Filtering and recommendation logic tested successfully.

   Core backend functionality stable.

  Next Planned Tasks

 Implement application tracker (CRUD operations)

 Add user profile management

 Implement authentication

 Begin frontend integration

 Demo User Created

 Email: demo@unipath.com

 User ID: 1

Date: February 24, 2026
1. Authentication System Implementation

 Implemented secure authentication using JWT (JSON Web Tokens).

 Created /auth/register endpoint with:

   - Email validation

   - Password length validation

   - Password hashing using bcrypt

 Duplicate email prevention

 Secure insertion into the users table.

 Created /auth/login endpoint with:

 Credential verification

 Password comparison using bcrypt

 JWT token generation

 Token expiration handling.

 Configured JWT secret through environment variables.

2. Application Tracker Security Upgrade

 Protected all application tracker routes using JWT authentication middleware.

Removed insecure user_id fields from client request payloads.

Implemented server-side user ownership validation for:

POST /applications

GET /applications

PUT /applications/:id

DELETE /applications/:id

Ensured users can only access and modify their own applications.

3. User Profile Module

Implemented GET /profile endpoint (JWT protected).

Implemented PUT /profile endpoint for updating user preferences.

Implemented GPA validation (range 0–4).

Enabled partial updates using SQL COALESCE.

Stored the following user preference attributes:

GPA

preferred_city

preferred_program

preferred_language

Verified profile persistence and retrieval through testing.

4. Recommendation Engine Integration

Refactored recommendation logic to automatically use saved user profile preferences.

Allowed optional query parameter overrides.

Secured /universities/recommendations endpoint using JWT authentication.

Confirmed scoring algorithm:

+2 GPA eligibility

+1 city match

+1 program match

+1 language match

Results sorted by descending recommendation score.

5. Backend Architecture Refactor (Major Milestone)

Refactored monolithic server.js into a modular architecture.

Project structure:

backend
server.js
db/pool.js
config/env.js
routes/
controllers/
middleware/

Separated responsibilities across layers:

Routes → HTTP routing layer
Controllers → business logic
Middleware → authentication and error handling
Database → connection pooling and query handling

Created route files:

auth.routes.js

profile.routes.js

tracker.routes.js

university.routes.js

Created controller files:

auth.controller.js

profile.controller.js

tracker.controller.js

university.controller.js

recommendation.controller.js

6. Centralized Error Handling

Implemented asyncHandler middleware to simplify asynchronous route handling.

Implemented global errorHandler middleware.

Standardized JSON error responses across the API.

Removed repetitive try/catch blocks from controllers.

7. Environment Validation

Implemented runtime validation through config/env.js.

Required environment variables enforced:

PORT

DB_HOST

DB_PORT

DB_NAME

DB_USER

DB_PASSWORD

JWT_SECRET

Implemented fail-fast startup behavior when configuration variables are missing.

8. System Status

Backend architecture fully modular.

Authentication system operational.

Secure user-based data isolation verified.

Recommendation engine integrated with user profiles.

All endpoints tested successfully using curl.

Server stable on port 5050.

PostgreSQL connection verified.

Demo User

Email: test@unipath.com

User ID: 2

Backend Completion Status

Functional completeness: 100%
Architectural completeness: 100%
Backend ready for system testing and frontend integration.

Date: March 14, 2026
1. Recommendation Engine Behavior Testing

Conducted functional testing of the recommendation module using authenticated API requests.

Verified correct evaluation of user profile attributes:

GPA

preferred city

preferred program

preferred language

Implemented structured output format:

exactMatches

alternativeRecommendations

This allows the system to prioritize strict matches while still providing fallback recommendations.

2. Recommendation System Test Cases
Test Case 1 — Exact Match Scenario

Profile configuration:

GPA: 3.8

Preferred city: Beijing

Preferred program: Data Science

Preferred language: English

Result:
Exact match identified:

Beijing Data Institute (score: 5)

Alternative recommendations were generated based on partial preference matches.

Observation:
The system correctly prioritized universities satisfying all user constraints.

Test Case 2 — No Exact Match Scenario

Profile configuration:

GPA: 2.8

Preferred city: Beijing

Preferred program: Computer Science

Preferred language: Chinese

Result:

No universities satisfied all constraints simultaneously.

exactMatches returned an empty list.

Alternative recommendations returned based on partial matches.

Observation:
The system successfully handled situations where exact matches are unavailable while still providing useful alternatives.

3. Application Tracker Functional Testing

Performed full CRUD testing of the application tracker module.

Create
Added Beijing Data Institute to the tracker with status "Not Started".

Read
Retrieved saved applications via GET /applications.
Response included joined university metadata such as:

university name

city

country

program

deadline.

Update
Updated application status from "Not Started" to "Submitted".

Delete
Removed the application successfully and verified that the application list became empty.

Observation
Tracker module correctly supports authenticated CRUD operations and relational joins.

4. System Integration Testing

Verified stable interaction between major system modules:

authentication system

user profile module

recommendation engine

application tracker.

Confirmed correct JWT authentication flow and protected endpoint behavior.

5. Current System Status

The UniPath backend now supports the complete workflow:

User authentication

User preference configuration

University recommendation generation

Application tracking and status management

All core backend components have been successfully implemented and validated through manual testing.
6. Frontend Interface Implementation and UI Enhancement

Implemented the initial frontend interface using React with Tailwind CSS to provide a clean and responsive user experience.

Configured the frontend project structure including:

pages
components
api service modules

Integrated the frontend with the backend API endpoints using fetch requests and JWT authentication stored in localStorage.

Implemented the following frontend pages:

Home page
Login page
Register page
Profile preferences page
University recommendations page
Application tracker page

Added a responsive navigation bar with authentication-aware behavior:

Logged-out users see Login and Register options.
Authenticated users see Recommendations, Tracker, Profile, and Logout options.

Implemented the full application workflow through the user interface:

User authentication (login and register)
Profile preference management (GPA, city, program, language)
University recommendation generation
Adding universities to the application tracker
Updating and deleting tracked applications

Enhanced the user interface with Tailwind CSS styling including:

Section-based layout structure
Card-based design for recommendations and tracker items
Interactive hover effects for UI elements
Improved spacing and typography for readability

Added status badges to the application tracker to visually represent application states:

Not Started (gray)
In Progress (yellow)
Submitted (blue)
Accepted (green)
Rejected (red)

Implemented improved homepage layout including:

Hero section introducing the UniPath platform
Feature overview cards explaining the system functionality
Call-to-action buttons for onboarding new users

Verified frontend and backend integration by performing complete end-to-end testing of the system workflow.

Current System Status

The UniPath system now provides a fully functional prototype including both backend services and frontend interface.

The platform currently supports the following workflow:

User registration and authentication
User preference configuration
University recommendation generation based on profile data
Application tracking and status updates
Interactive user interface for managing the entire application process

The system prototype is operational and ready for further interface refinement and usability improvements.