jest.mock("../db/pool", () => ({
  query: jest.fn(),
}));

const request = require("supertest");
const app = require("../app");
const pool = require("../db/pool");

describe("Universities endpoint", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return universities list", async () => {
    pool.query.mockResolvedValue({
      rows: [
        {
          id: 1,
          name: "Test University",
          city: "Beijing",
          program: "Computer Science",
          language: "English",
        },
      ],
    });

    const res = await request(app).get("/universities");

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it("should return filtered universities by city", async () => {
    pool.query.mockResolvedValue({
      rows: [
        {
          id: 2,
          name: "City University",
          city: "Beijing",
          program: "Data Science",
          language: "English",
        },
      ],
    });

    const res = await request(app).get("/universities?city=Beijing");

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("should return 500 when database fails", async () => {
    pool.query.mockRejectedValue(new Error("DB failed"));

    const res = await request(app).get("/universities");

    expect(res.statusCode).toBe(500);
  });
});
