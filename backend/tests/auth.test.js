// Verifies that protected endpoints reject requests with no Clerk session.
// clerkMiddleware itself is bypassed in NODE_ENV=test (see app.js), so the
// rejection happens inside ensureLocalUser(), which calls getAuth() and throws
// a 401 when there is no userId. We mock getAuth() here to simulate the
// unauthenticated case.

const request = require("supertest");

jest.mock("../db/pool", () => ({
  query: jest.fn(),
}));

jest.mock("@clerk/express", () => ({
  clerkMiddleware: jest.fn(() => (req, res, next) => next()),
  getAuth: jest.fn(() => ({ userId: null, sessionClaims: null })),
  requireAuth: jest.fn(() => (req, res, next) => next()),
}));

const app = require("../app");
const pool = require("../db/pool");

describe("Authentication enforcement", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("rejects unauthenticated GET /profile with 401", async () => {
    const res = await request(app).get("/profile");

    expect(res.statusCode).toBe(401);
    expect(pool.query).not.toHaveBeenCalled();
  });

  it("rejects unauthenticated POST /api/chat with 401", async () => {
    const res = await request(app)
      .post("/api/chat")
      .send({ message: "hello" });

    expect(res.statusCode).toBe(401);
    expect(pool.query).not.toHaveBeenCalled();
  });
});
