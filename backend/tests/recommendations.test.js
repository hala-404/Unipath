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

describe("Recommendations endpoint", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return recommendation payload structure", async () => {
    // ensureLocalUser() - SELECT by clerk_user_id
    pool.query.mockResolvedValueOnce({
      rows: [{ id: 1, email: "test@example.com", clerk_user_id: "test-clerk-user-123" }],
    })
      // getRecommendations() - SELECT profile
      .mockResolvedValueOnce({
        rows: [
          {
            gpa: 3.5,
            preferred_city: "Beijing",
            preferred_program: "Computer Science",
            preferred_language: "English",
            preferred_country: "China",
            max_tuition: 50000,
          },
        ],
      })
      // getRecommendations() - SELECT universities
      .mockResolvedValueOnce({
        rows: [
          {
            id: 10,
            name: "Test University",
            city: "Beijing",
            country: "China",
            program: "Computer Science",
            language: "English",
            min_gpa: 3.0,
            tuition_fee: 30000,
            deadline: "2027-03-01",
            acceptance_rate: 25,
            world_ranking: 100,
          },
        ],
      });

    const res = await request(app).get("/universities/recommendations");

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("exactMatches");
    expect(res.body).toHaveProperty("alternativeRecommendations");
    expect(Array.isArray(res.body.exactMatches)).toBe(true);
    expect(Array.isArray(res.body.alternativeRecommendations)).toBe(true);
  });

  it("should return 500 when database fails", async () => {
    pool.query.mockRejectedValueOnce(new Error("DB failed"));

    const res = await request(app).get("/universities/recommendations");

    expect(res.statusCode).toBe(500);
  });
});

