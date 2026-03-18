import { describe, it, expect } from "vitest";
import { Series } from "../../src/core/Series";
import { resolveOptions } from "../../src/core/Options";
import { StackType } from "../../src/types/enums";

const opts = resolveOptions();

// Shared two-series dataset used across most tests.
const twoSeries = [
  { name: "A", data: [10, 20, 30] },
  { name: "B", data: [5,  15, 25] },
];

describe("Series", () => {
  describe("basics", () => {
    it("length matches the number of raw series", () => {
      expect(new Series(twoSeries, opts, StackType.None).length).toBe(2);
    });

    it("getLabel returns the series name", () => {
      const s = new Series(twoSeries, opts, StackType.None);
      expect(s.getLabel(0)).toBe("A");
      expect(s.getLabel(1)).toBe("B");
    });

    it("getLabels returns all names in order", () => {
      const s = new Series(twoSeries, opts, StackType.None);
      expect(s.getLabels()).toEqual(["A", "B"]);
    });
  });

  describe("matrix structure", () => {
    it("getMatrixItem returns a datum row with the correct length", () => {
      const s = new Series([{ name: "A", data: [10, 20, 30] }], opts, StackType.None);
      expect(s.getMatrixItem(0)).toHaveLength(3);
    });

    it("y values match the raw data", () => {
      const s = new Series([{ name: "A", data: [10, 20] }], opts, StackType.None);
      const row = s.getMatrixItem(0);
      expect(row[0].y).toBe(10);
      expect(row[1].y).toBe(20);
    });

    it("y1 equals y for plain (non-range) series", () => {
      const s = new Series([{ name: "A", data: [10, 20] }], opts, StackType.None);
      const row = s.getMatrixItem(0);
      expect(row[0].y1).toBe(10);
      expect(row[1].y1).toBe(20);
    });

    it("y0 is 0 for plain series", () => {
      const s = new Series([{ name: "A", data: [10, 20] }], opts, StackType.None);
      const row = s.getMatrixItem(0);
      row.forEach((d) => expect(d.y0).toBe(0));
    });
  });

  describe("range series", () => {
    it("y is NaN when only min/max are supplied", () => {
      const s = new Series([{ name: "R", min: [5, 10], max: [15, 20] }], opts, StackType.None);
      const row = s.getMatrixItem(0);
      expect(isNaN(row[0].y)).toBe(true);
      expect(isNaN(row[1].y)).toBe(true);
    });

    it("y0 and y1 reflect min/max", () => {
      const s = new Series([{ name: "R", min: [5, 10], max: [15, 20] }], opts, StackType.None);
      const row = s.getMatrixItem(0);
      expect(row[0].y0).toBe(5);
      expect(row[0].y1).toBe(15);
      expect(row[1].y0).toBe(10);
      expect(row[1].y1).toBe(20);
    });
  });

  describe("perc values", () => {
    it("each datum's perc is its share of the column total", () => {
      const s = new Series(twoSeries, opts, StackType.None);
      // column 0: A=10, B=5  → total=15
      expect(s.getMatrixItem(0)[0].perc).toBeCloseTo(10 / 15);
      expect(s.getMatrixItem(1)[0].perc).toBeCloseTo(5  / 15);
    });

    it("perc is 0 when the column total is 0", () => {
      const s = new Series([{ name: "A", data: [0, 0] }], opts, StackType.None);
      s.getMatrixItem(0).forEach((d) => expect(d.perc).toBe(0));
    });
  });

  describe("min / max helpers", () => {
    it("max returns the largest value in a single series", () => {
      const s = new Series([{ name: "A", data: [10, 20, 5] }], opts, StackType.None);
      expect(s.max()).toBe(20);
    });

    it("min returns the smallest value, including negatives", () => {
      const s = new Series([{ name: "A", data: [10, -5, 20] }], opts, StackType.None);
      expect(s.min()).toBe(-5);
    });

    it("max (stacked) returns the largest column total", () => {
      const s = new Series(twoSeries, opts, StackType.Normal);
      // col totals: 15, 35, 55
      expect(s.max(undefined, StackType.Normal)).toBe(55);
    });

    it("min (stacked with negatives) returns the lowest stack endpoint", () => {
      // B has negative values — the bottom of the negative stack should be below 0
      const mixedSeries = [
        { name: "A", data: [10, 20] },
        { name: "B", data: [-5, -8] },
      ];
      const s = new Series(mixedSeries, opts, StackType.Normal);
      expect(s.min(undefined, StackType.Normal)).toBeLessThan(0);
    });
  });

  describe("Normal stacking", () => {
    it("sum values accumulate across series within each column", () => {
      const s = new Series(twoSeries, opts, StackType.Normal);
      // col 0: A contributes 10 → sum=10; B contributes 5 → sum=15
      expect(s.getMatrixItem(0)[0].sum).toBe(10);
      expect(s.getMatrixItem(1)[0].sum).toBe(15);
    });
  });

  describe("Percent stacking", () => {
    it("y0 of the first series is 0 in every column", () => {
      const s = new Series(twoSeries, opts, StackType.Percent);
      s.getMatrixItem(0).forEach((d) => expect(d.y0).toBe(0));
    });

    it("y1 of the last series equals 1 (100%) in every column", () => {
      const s = new Series(twoSeries, opts, StackType.Percent);
      s.getMatrixItem(1).forEach((d) => expect(d.y1).toBeCloseTo(1));
    });

    it("segments within a column are contiguous (y0 of series N = y1 of series N-1)", () => {
      const s = new Series(twoSeries, opts, StackType.Percent);
      const rowA = s.getMatrixItem(0);
      const rowB = s.getMatrixItem(1);
      rowA.forEach((dA, i) => {
        expect(rowB[i].y0).toBeCloseTo(dA.y1);
      });
    });
  });

  describe("axis filtering", () => {
    const multiAxisData = [
      { name: "A", data: [1, 2], axis: "left"  },
      { name: "B", data: [3, 4], axis: "right" },
      { name: "C", data: [5, 6], axis: "left"  },
    ];

    it("getMatricesByAxis returns only series bound to that axis", () => {
      const s = new Series(multiAxisData, opts, StackType.None);
      expect(s.getMatricesByAxis("left")).toHaveLength(2);
      expect(s.getMatricesByAxis("right")).toHaveLength(1);
    });

    it("max filtered by axis name returns the correct maximum", () => {
      const s = new Series(multiAxisData, opts, StackType.None);
      // "right" axis has values [3, 4]
      expect(s.max("right")).toBe(4);
    });
  });
});
