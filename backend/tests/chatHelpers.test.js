const { wantsAlternatives, extractMentionedMajors } = require("../utils/chatHelpers");

describe("chatHelpers", () => {
  test("detects alternative intent", () => {
    expect(wantsAlternatives("show me other options")).toBe(true);
  });

  test("extracts majors", () => {
    const result = extractMentionedMajors("I like computer science and AI");
    expect(result).toContain("computer science");
  });
});
