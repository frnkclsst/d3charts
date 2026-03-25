import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { validateData } from "../../src/core/Validate";
import type { IChartData } from "../../src/types/interfaces";

// ─── helpers ──────────────────────────────────────────────────────────────────

const cats3: IChartData["categories"] = { format: "%s", data: ["A", "B", "C"] };

function make(series: IChartData["series"]): IChartData {
  return { categories: cats3, series };
}

// ─── suite ────────────────────────────────────────────────────────────────────

describe("validateData()", () => {
  let warn: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    warn = vi.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    warn.mockRestore();
  });

  // ── valid data ─────────────────────────────────────────────────────────────

  describe("valid data", () => {
    it("does not warn for clean plain series", () => {
      validateData(make([{ name: "A", data: [1, 2, 3] }]));
      expect(warn).not.toHaveBeenCalled();
    });

    it("does not warn for multiple series with matching lengths", () => {
      validateData(make([
        { name: "A", data: [1, 2, 3] },
        { name: "B", data: [4, 5, 6] },
      ]));
      expect(warn).not.toHaveBeenCalled();
    });

    it("does not warn for a valid range series", () => {
      validateData(make([{ name: "R", min: [1, 2, 3], max: [4, 5, 6] }]));
      expect(warn).not.toHaveBeenCalled();
    });
  });

  // ── empty / missing ────────────────────────────────────────────────────────

  describe("empty / missing data", () => {
    it("warns when series array is empty", () => {
      validateData({ categories: cats3, series: [] });
      expect(warn).toHaveBeenCalledWith(expect.stringContaining("No series provided"));
    });

    it("warns when categories array is empty", () => {
      validateData({ categories: { format: "%s", data: [] }, series: [{ name: "X", data: [1] }] });
      expect(warn).toHaveBeenCalledWith(expect.stringContaining("Categories array is empty"));
    });

    it("warns when a series has no data, min, or max", () => {
      validateData(make([{ name: "Empty" }]));
      expect(warn).toHaveBeenCalledWith(expect.stringContaining('Series "Empty" has no data'));
    });

    it("does not emit further warnings for that series after the 'no data' warning", () => {
      validateData(make([{ name: "Empty" }]));
      expect(warn).toHaveBeenCalledTimes(1);
    });
  });

  // ── length mismatches ──────────────────────────────────────────────────────

  describe("length mismatches", () => {
    it("warns when data is shorter than categories", () => {
      validateData(make([{ name: "Sales", data: [1, 2] }]));
      expect(warn).toHaveBeenCalledWith(
        expect.stringContaining('Series "Sales": data length (2) does not match categories length (3)')
      );
    });

    it("warns when data is longer than categories", () => {
      validateData(make([{ name: "Sales", data: [1, 2, 3, 4] }]));
      expect(warn).toHaveBeenCalledWith(
        expect.stringContaining('data length (4) does not match categories length (3)')
      );
    });

    it("warns when range min and max lengths differ", () => {
      validateData(make([{ name: "R", min: [1, 2, 3], max: [4, 5] }]));
      expect(warn).toHaveBeenCalledWith(
        expect.stringContaining("min length (3) does not match max length (2)")
      );
    });

    it("warns when range data length does not match categories", () => {
      validateData(make([{ name: "R", min: [1, 2], max: [3, 4] }]));
      expect(warn).toHaveBeenCalledWith(
        expect.stringContaining("range data length (2) does not match categories length (3)")
      );
    });

    it("warns independently for each mismatched series", () => {
      validateData(make([
        { name: "A", data: [1, 2] },
        { name: "B", data: [1, 2] },
      ]));
      expect(warn).toHaveBeenCalledTimes(2);
      expect(warn).toHaveBeenCalledWith(expect.stringContaining('"A"'));
      expect(warn).toHaveBeenCalledWith(expect.stringContaining('"B"'));
    });
  });

  // ── null / undefined / NaN in data ────────────────────────────────────────

  describe("null / undefined / NaN values", () => {
    it("warns when data contains a null value", () => {
      validateData(make([{ name: "X", data: [1, null as unknown as number, 3] }]));
      expect(warn).toHaveBeenCalledWith(expect.stringContaining("null/undefined/NaN"));
    });

    it("warns when data contains an undefined value", () => {
      validateData(make([{ name: "X", data: [1, undefined as unknown as number, 3] }]));
      expect(warn).toHaveBeenCalledWith(expect.stringContaining("null/undefined/NaN"));
    });

    it("warns when data contains a NaN value", () => {
      validateData(make([{ name: "X", data: [1, NaN, 3] }]));
      expect(warn).toHaveBeenCalledWith(expect.stringContaining("null/undefined/NaN"));
    });

    it("reports the correct count of bad values", () => {
      validateData(make([{ name: "X", data: [NaN, 2, null as unknown as number] }]));
      expect(warn).toHaveBeenCalledWith(expect.stringContaining("2 null/undefined/NaN value(s)"));
    });

    it("reports the correct indices of bad values", () => {
      validateData(make([{ name: "X", data: [NaN, 2, null as unknown as number] }]));
      expect(warn).toHaveBeenCalledWith(expect.stringContaining("[0, 2]"));
    });

    it("does not warn when all data values are valid numbers", () => {
      validateData(make([{ name: "X", data: [0, -1, 999] }]));
      expect(warn).not.toHaveBeenCalled();
    });
  });

  // ── series name fallback ───────────────────────────────────────────────────

  describe("series name in warnings", () => {
    it("uses the series name in the warning message", () => {
      validateData(make([{ name: "Revenue", data: [1, 2] }]));
      expect(warn).toHaveBeenCalledWith(expect.stringContaining('"Revenue"'));
    });

    it("falls back to axis name when series has no name", () => {
      validateData(make([{ axis: "secondary", data: [1, 2] }]));
      expect(warn).toHaveBeenCalledWith(expect.stringContaining('"secondary"'));
    });

    it("generates a 1-based label when neither name nor axis is set", () => {
      validateData(make([{ data: [1, 2] }]));
      expect(warn).toHaveBeenCalledWith(expect.stringContaining('"Serie 1"'));
    });

    it("generated label uses the correct 1-based index for each series", () => {
      validateData(make([{ data: [1, 2] }, { data: [1, 2] }]));
      expect(warn).toHaveBeenCalledWith(expect.stringContaining('"Serie 1"'));
      expect(warn).toHaveBeenCalledWith(expect.stringContaining('"Serie 2"'));
    });
  });
});
