jest.mock("../db/pool", () => ({
  query: jest.fn(),
}));

jest.mock("../utils/ensureLocalUser", () => ({
  ensureLocalUser: jest.fn(),
}));

jest.mock("../utils/logActivity", () => ({
  logActivity: jest.fn(),
}));

const pool = require("../db/pool");
const { ensureLocalUser } = require("../utils/ensureLocalUser");
const {
  createApplication,
  listApplications,
} = require("../controllers/tracker.controller");

function createMockRes() {
  return {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  };
}

describe("tracker controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    ensureLocalUser.mockResolvedValue({ id: 7 });
  });

  test("prevents duplicate application", async () => {
    pool.query
      .mockResolvedValueOnce({
        rows: [{ id: 1, user_id: 7, university_id: 11, status: "Not Started" }],
      })
      .mockResolvedValueOnce({
        rows: [{ name: "Test University" }],
      })
      .mockRejectedValueOnce(Object.assign(new Error("duplicate key"), { code: "23505" }));

    const firstReq = { body: { university_id: 11, status: "Not Started" } };
    const firstRes = createMockRes();

    await createApplication(firstReq, firstRes);

    expect(firstRes.status).toHaveBeenCalledWith(201);
    expect(firstRes.json).toHaveBeenCalledWith({
      id: 1,
      user_id: 7,
      university_id: 11,
      status: "Not Started",
    });

    const secondReq = { body: { university_id: 11, status: "Not Started" } };
    const secondRes = createMockRes();

    await createApplication(secondReq, secondRes);

    expect(secondRes.status).toHaveBeenCalledWith(400);
    expect(secondRes.json).toHaveBeenCalledWith({
      error: "University already added to tracker",
    });
  });

  test("keeps tracker data isolated by user", async () => {
    ensureLocalUser
      .mockResolvedValueOnce({ id: 1 })
      .mockResolvedValueOnce({ id: 2 });

    pool.query
      .mockResolvedValueOnce({
        rows: [{ id: 10, user_id: 1, university_id: 99, status: "Not Started" }],
      })
      .mockResolvedValueOnce({
        rows: [{ name: "User A University" }],
      })
      .mockResolvedValueOnce({
        rows: [
          {
            application_id: 22,
            status: "In Progress",
            user_id: 2,
            checklist: [],
            university_id: 55,
            name: "User B University",
            city: "Shanghai",
            country: "China",
            program: "Data Science",
            deadline: "2026-06-01",
          },
        ],
      });

    const addReq = { body: { university_id: 99, status: "Not Started" } };
    const addRes = createMockRes();

    await createApplication(addReq, addRes);

    expect(addRes.status).toHaveBeenCalledWith(201);

    const listReq = {};
    const listRes = createMockRes();

    await listApplications(listReq, listRes);

    expect(pool.query).toHaveBeenNthCalledWith(
      3,
      expect.stringContaining("WHERE a.user_id = $1"),
      [2]
    );
    expect(listRes.json).toHaveBeenCalledWith([
      {
        application_id: 22,
        status: "In Progress",
        user_id: 2,
        checklist: [],
        university_id: 55,
        name: "User B University",
        city: "Shanghai",
        country: "China",
        program: "Data Science",
        deadline: "2026-06-01",
      },
    ]);
  });
});
