const { buildAnswerPrompt, buildPrompt } = require("../services/chatPrompt");

describe("buildAnswerPrompt", () => {
  test("includes GPA, preferred city, and university name in prompt", () => {
    const prompt = buildAnswerPrompt({
      profile: { gpa: 3.5, preferred_city: "Beijing" },
      extracted: {},
      userWantsAlternatives: false,
      recommendedMajorsText: "1. Computer Science",
      universityList: "1. Test University | Beijing | Computer Science",
    });

    expect(prompt).toMatch(/3\.5/);
    expect(prompt).toMatch(/Beijing/);
    expect(prompt).toMatch(/Test University/);
  });

  test("handles empty university list", () => {
    const prompt = buildAnswerPrompt({
      profile: { gpa: 3.2 },
      extracted: {},
      userWantsAlternatives: false,
      recommendedMajorsText: "",
      universityList: "",
    });

    expect(typeof prompt).toBe("string");
    expect(prompt.length).toBeGreaterThan(0);
    expect(prompt).toMatch(/AVAILABLE UNIVERSITIES/);
  });

  test("handles missing optional profile fields", () => {
    const prompt = buildAnswerPrompt({
      profile: {},
      extracted: {},
      userWantsAlternatives: false,
      recommendedMajorsText: "",
      universityList: "",
    });

    expect(prompt).toMatch(/Not set/);
    expect(prompt).toMatch(/STUDENT PROFILE/);
  });

  test("includes extracted request details in prompt", () => {
    const prompt = buildAnswerPrompt({
      profile: { gpa: 3.8, preferred_city: "Shanghai" },
      extracted: { program: "Data Science", city: "Shanghai" },
      userWantsAlternatives: true,
      recommendedMajorsText: "1. Data Science",
      universityList: "1. Sample University | Shanghai | Data Science",
    });

    expect(prompt).toMatch(/3\.8/);
    expect(prompt).toMatch(/Shanghai/);
    expect(prompt).toMatch(/Data Science/);
    expect(prompt).toMatch(/YES - they asked for different\/other options/);
  });
});

describe("buildPrompt", () => {
  test("includes user profile in prompt", () => {
    const prompt = buildPrompt({ gpa: 3.5 }, []);
    expect(prompt).toMatch(/3\.5/);
  });

  test("includes universities in prompt", () => {
    const prompt = buildPrompt({ gpa: 3.5 }, ["Test University", "Sample Institute"]);
    expect(prompt).toMatch(/Test University/);
    expect(prompt).toMatch(/Sample Institute/);
  });
});
