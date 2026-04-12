const {
  wantsAlternatives,
  extractMentionedMajors,
} = require("../utils/chatHelpers");

describe("wantsAlternatives", () => {
  test("returns true for clear alternative request", () => {
    expect(wantsAlternatives("show me other options")).toBe(true);
  });

  test("returns false for unrelated sentence", () => {
    expect(wantsAlternatives("tell me about deadlines")).toBe(false);
  });

  test("handles uppercase", () => {
    expect(wantsAlternatives("ANY OTHER CHOICES?")).toBe(true);
  });

  test("handles punctuation", () => {
    expect(wantsAlternatives("Any other choices, please?")).toBe(true);
  });

  test("handles empty string", () => {
    expect(wantsAlternatives("")).toBe(false);
  });

  test("returns false for negative phrasing", () => {
    expect(wantsAlternatives("I do not want other options right now")).toBe(false);
  });
});

describe("extractMentionedMajors", () => {
  test("extracts one major", () => {
    expect(extractMentionedMajors("I like computer science")).toContain("computer science");
  });

  test("extracts multiple majors", () => {
    const result = extractMentionedMajors("I like computer science and data science");
    expect(result).toContain("computer science");
    expect(result).toContain("data science");
  });

  test("returns empty array for no major", () => {
    expect(extractMentionedMajors("I like traveling")).toEqual([]);
  });

  test("handles punctuation", () => {
    expect(extractMentionedMajors("Computer Science, maybe AI?")).toContain("computer science");
  });

  test("handles uppercase", () => {
    const result = extractMentionedMajors("I LIKE DATA SCIENCE AND COMPUTER SCIENCE");
    expect(result).toContain("data science");
    expect(result).toContain("computer science");
  });

  test("handles empty input", () => {
    expect(extractMentionedMajors("")).toEqual([]);
  });

  test("does not return false positives", () => {
    expect(extractMentionedMajors("I enjoy watching cart racing")).toEqual([]);
  });

  test("supports AI and artificial intelligence mentions", () => {
    const result = extractMentionedMajors("AI and artificial intelligence are interesting");
    expect(result).toContain("artificial intelligence");
    expect(result).toContain("ai");
  });
});
