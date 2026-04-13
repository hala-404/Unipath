const request = require("supertest");
const app = require("../app");

jest.mock("../db/pool", () => ({
  query: jest.fn(),
}));

jest.mock("@clerk/express", () => ({
  clerkMiddleware: jest.fn(() => (req, res, next) => next()),
  getAuth: jest.fn(() => ({
    userId: "test-clerk-user-123",
    sessionClaims: {},
  })),
  requireAuth: jest.fn(() => (req, res, next) => next()),
}));

const pool = require("../db/pool");

describe("Profile endpoint", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return profile data", async () => {
    // ensureLocalUser() - SELECT by clerk_user_id
    pool.query.mockResolvedValueOnce({
      rows: [{ id: 1, email: "test@example.com", clerk_user_id: "test-clerk-user-123" }],
    })
      // getProfile() - SELECT profile data
      .mockResolvedValueOnce({
        rows: [
          {
            full_name: "Test User",
            gpa: 3.6,
            preferred_city: "Shanghai",
            preferred_country: "China",
            preferred_program: "Data Science",
            preferred_language: "English",
            max_tuition: 60000,
            reminders_enabled: true,
          },
        ],
      });

    const res = await request(app).get("/profile");

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("gpa");
  });

  it("should update profile successfully", async () => {
    // ensureLocalUser() - SELECT by clerk_user_id
    pool.query.mockResolvedValueOnce({
      rows: [{ id: 1, email: "test@example.com", clerk_user_id: "test-clerk-user-123" }],
    })
      // updateProfile() - UPDATE with RETURNING
      .mockResolvedValueOnce({
        rows: [
          {
            full_name: "Test User",
            gpa: 3.8,
            preferred_city: "Beijing",
            preferred_country: "China",
            preferred_program: "Computer Science",
            preferred_language: "English",
            max_tuition: 70000,
            reminders_enabled: true,
          },
        ],
      });

    const res = await request(app).put("/profile").send({
      gpa: 3.8,
      preferred_city: "Beijing",
      preferred_program: "Computer Science",
      preferred_language: "English",
    });

    expect([200, 204]).toContain(res.statusCode);
  });
});
