# UniPath Progress Log

## January 2026 - Project Initialization & Planning

* Defined project scope: building a university application support system
* Identified key features:

  * University recommendation
  * Application tracker
  * AI advisory assistant
* Chose technology stack:

  * Frontend: React (Vite)
  * Backend: Node.js + Express
  * Database: PostgreSQL
* Set up initial repository structure
* Designed initial database schema (users, universities, applications)
* Created basic backend server and database connection

---

## February 2026 - Backend Development (Core APIs)

* Implemented core backend structure:

  * Controllers, routes, middleware
* Built university endpoints:

  * GET `/universities`
  * Filtering by GPA, city, program, language
* Implemented application tracker:

  * Add, update, delete applications
  * Status system (Not Started, In Progress, Submitted)
* Designed checklist structure for application requirements
* Added PostgreSQL connection pooling using `pg`
* Implemented error handling middleware
* Created seed data for universities
* Began testing endpoints using curl/Postman

---

## Late February 2026 - Frontend Foundation

* Initialized React frontend using Vite
* Set up routing (React Router)
* Built main pages:

  * Home
  * Recommendations
  * Tracker
* Connected frontend to backend APIs
* Implemented basic UI for displaying universities
* Added filtering UI for recommendations

---

## Early March 2026 - Feature Expansion

* Implemented university details page:

  * Program information
  * Tuition
  * Requirements
  * Deadlines
* Built dashboard page:

  * Overview of applications
* Implemented profile system:

  * Save GPA, preferences (city, program, language)
* Connected profile data to recommendation logic
* Improved UI structure and layout

---

## Mid March 2026 - AI Advisor Integration

* Integrated OpenRouter API for chatbot functionality
* Implemented chat controller:

  * Context-aware responses
  * Message history handling
* Added helper functions:

  * Detect user intent (alternatives, interests)
  * Extract relevant keywords
* Designed prompt structure combining:

  * User profile
  * Candidate universities
* Connected chatbot to frontend chat page

---

## Late March 2026 - System Integration & Improvements

* Integrated all modules:

  * Recommendations + Tracker + Chat
* Added application checklist tracking
* Implemented duplicate prevention for applications
* Added database constraints for data integrity
* Improved API structure and consistency
* Refactored large frontend components into smaller reusable components
* Added scroll behavior and UI improvements

---

## Early April 2026 - Enhancements & Services

* Added email reminder system using node-cron
* Implemented background job for deadline notifications
* Integrated Cloudinary for university images
* Created script to populate university images
* Improved dashboard functionality
* Added activity logging for user actions

---

## Mid April 2026 - Testing & Debugging

* Implemented backend tests using Jest and Supertest
* Tested:

  * Health endpoint
  * University retrieval
* Fixed major bugs:

  * Incorrect API routing issues
  * Duplicate tracker entries
  * Scroll issues in frontend
* Identified and fixed critical issue:

  * Removed hardcoded user_id and implemented proper user resolution

---

## Late April 2026 - Code Cleanup & Optimization

* Removed unused dependencies and duplicate files
* Standardized AI provider usage (OpenRouter)
* Fixed repository structure issues:

  * Removed unnecessary root package.json
* Cleaned .gitignore and removed unwanted files
* Improved code consistency and comments
* Fixed naming issues (progress log, scripts)

---

## Current Status

* Core system fully functional:

  * Recommendation system
  * Application tracker
  * AI advisory assistant
* Backend and frontend integrated
* Basic testing implemented
* Ready for demonstration and evaluation

---

## Future Work

* Expand university dataset
* Improve chatbot grounding using retrieval-based methods
* Add frontend testing
* Implement full authentication system
* Enhance recommendation logic
* Deploy system for production use
