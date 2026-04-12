const { buildPrompt } = require("../services/chatPrompt");

describe("chatPrompt", () => {
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
