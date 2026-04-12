jest.mock("../db/pool", () => ({
  query: jest.fn(),
}));

const request = require("supertest");
const app = require("../app");
const pool = require("../db/pool");

describe("Health endpoint", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return 200 and backend status", async () => {
    pool.query.mockResolvedValue({
      rows: [{ now: "2026-04-12T10:00:00.000Z" }],
    });

    const res = await request(app).get("/health");

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("ok", true);
    expect(res.body).toHaveProperty("db_time");
    expect(pool.query).toHaveBeenCalledWith("SELECT NOW() as now");
  });

  it("should return 500 if database query fails", async () => {
    pool.query.mockRejectedValue(new Error("Database down"));

    const res = await request(app).get("/health");

    expect(res.statusCode).toBe(500);
    expect(res.body).toHaveProperty("error");
    expect(res.body.error).toBe("Internal server error");
  });
});
