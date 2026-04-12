# UniPath Backend Test Report

## 1. Test Plan

The purpose of testing is to verify that core backend functionalities work correctly, including:

- API endpoint correctness
- Error handling
- Data validation
- System stability under expected use

Testing was performed using Jest and Supertest.

---

## 2. Test Environment

- Backend: Node.js + Express
- Database: PostgreSQL
- Testing tools: Jest, Supertest
- OS: macOS

---

## 3. Test Cases

### 3.1 Health Endpoint

**Endpoint:** GET /health

- Input: No parameters
- Expected Output:
  - Status: 200
  - JSON: `{ ok: true, db_time: ... }`

---

### 3.2 Universities Endpoint

**Endpoint:** GET /universities

- Input: No parameters
- Expected Output:
  - Status: 200
  - Returns array of universities

---

### 3.3 Filter Universities

**Endpoint:** GET /universities?city=Beijing

- Input: city filter
- Expected Output:
  - Status: 200
  - Filtered results

---

### 3.4 Invalid Login

**Endpoint:** POST /auth/login

- Input: invalid credentials
- Expected Output:
  - Status: 400 or 401
  - Error message returned

---

## 4. Test Results

| Test Case | Result |
|----------|--------|
| Health Endpoint | Passed |
| Universities List | Passed |
| Filter Query | Passed |
| Invalid Login | Passed |

---

## 5. Error Handling Validation

The system correctly handles:
- Invalid credentials
- Missing parameters
- Database errors (mocked)

---

## 6. Conclusion

The backend system passed all core functional tests.  
Endpoints respond correctly, error handling is stable, and the system is suitable for deployment and further extension.
