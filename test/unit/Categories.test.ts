import { describe, it, expect } from "vitest";
import { Categories } from "../../src/core/Categories";

describe("Categories", () => {
  it("stores items and reports correct length", () => {
    const cats = new Categories(["A", "B", "C"], "%s");
    expect(cats.length).toBe(3);
  });

  it("labels getter returns all items in order", () => {
    const cats = new Categories(["Jan", "Feb", "Mar"], "%s");
    expect(cats.labels).toEqual(["Jan", "Feb", "Mar"]);
  });

  it("getItem returns the item at the given index", () => {
    const cats = new Categories(["X", "Y", "Z"], "%s");
    expect(cats.getItem(0)).toBe("X");
    expect(cats.getItem(2)).toBe("Z");
  });

  describe("parseFormat", () => {
    it("returns the string unchanged for %s format", () => {
      const cats = new Categories(["hello"], "%s");
      expect(cats.parseFormat("hello")).toBe("hello");
    });

    it("returns the string unchanged for %n format", () => {
      const cats = new Categories(["42"], "%n");
      expect(cats.parseFormat("42")).toBe("42");
    });

    it("returns a Date for a valid time-format string", () => {
      const cats = new Categories(["2024-06-15"], "%Y-%m-%d");
      const result = cats.parseFormat("2024-06-15");
      expect(result).toBeInstanceOf(Date);
      expect((result as Date).getFullYear()).toBe(2024);
      expect((result as Date).getMonth()).toBe(5);   // June (0-indexed)
      expect((result as Date).getDate()).toBe(15);
    });

    it("returns a Date for a month/year format", () => {
      const cats = new Categories(["Jan 2024"], "%b %Y");
      const result = cats.parseFormat("Jan 2024");
      expect(result).toBeInstanceOf(Date);
    });

    it("falls back to the original string when parsing fails", () => {
      const cats = new Categories(["not-a-date"], "%Y-%m-%d");
      expect(cats.parseFormat("not-a-date")).toBe("not-a-date");
    });
  });
});
