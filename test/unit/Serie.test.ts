import { describe, it, expect } from "vitest";
import { Serie } from "../../src/core/Serie";
import { resolveOptions } from "../../src/core/Options";
import { SymbolTypes } from "../../src/types/enums";

const defaultOpts = resolveOptions();

describe("Serie", () => {
  describe("data fields", () => {
    it("stores data and computes sum", () => {
      const serie = new Serie(defaultOpts, { name: "A", data: [10, 20, 30] }, 0);
      expect(serie.data).toEqual([10, 20, 30]);
      expect(serie.sum).toBe(60);
    });

    it("sum is 0 for an empty data array", () => {
      const serie = new Serie(defaultOpts, { name: "A", data: [] }, 0);
      expect(serie.sum).toBe(0);
    });

    it("defaults min, max, size to empty arrays", () => {
      const serie = new Serie(defaultOpts, { name: "A", data: [1] }, 0);
      expect(serie.min).toEqual([]);
      expect(serie.max).toEqual([]);
      expect(serie.size).toEqual([]);
    });

    it("stores min and max when provided (range series)", () => {
      const serie = new Serie(defaultOpts, { min: [5, 10], max: [15, 20] }, 0);
      expect(serie.min).toEqual([5, 10]);
      expect(serie.max).toEqual([15, 20]);
    });

    it("stores axis name when provided", () => {
      const serie = new Serie(defaultOpts, { name: "A", data: [], axis: "secondary" }, 0);
      expect(serie.axis).toBe("secondary");
    });

    it("axis defaults to empty string when not provided", () => {
      const serie = new Serie(defaultOpts, { name: "A", data: [] }, 0);
      expect(serie.axis).toBe("");
    });

    it("visible is true by default", () => {
      const serie = new Serie(defaultOpts, { name: "A", data: [] }, 0);
      expect(serie.visible).toBe(true);
    });

    it("stores series index", () => {
      const serie = new Serie(defaultOpts, { name: "A", data: [] }, 3);
      expect(serie.index).toBe(3);
    });
  });

  describe("getName()", () => {
    it("returns the name when set", () => {
      const serie = new Serie(defaultOpts, { name: "Revenue", data: [] }, 0);
      expect(serie.getName()).toBe("Revenue");
    });

    it("falls back to axis name when no name is set", () => {
      const serie = new Serie(defaultOpts, { axis: "secondary", data: [] }, 1);
      expect(serie.getName()).toBe("secondary");
    });

    it("generates a label when neither name nor axis is set", () => {
      const serie = new Serie(defaultOpts, { data: [] }, 0);
      expect(serie.getName()).toBe("Serie 1");
    });

    it("generated label uses 1-based index", () => {
      const serie = new Serie(defaultOpts, { data: [] }, 2);
      expect(serie.getName()).toBe("Serie 3");
    });
  });

  describe("marker resolution", () => {
    it("uses a per-series marker override", () => {
      const serie = new Serie(defaultOpts, { data: [], marker: "diamond" }, 0);
      expect(serie.marker).toBe("diamond");
    });

    it("uses the global marker type from options", () => {
      const opts = resolveOptions({ plotOptions: { markers: { type: "square" } } });
      const serie = new Serie(opts, { data: [] }, 0);
      expect(serie.marker).toBe("square");
    });

    it("cycles through SymbolTypes when global type is 'mixed'", () => {
      const opts = resolveOptions({ plotOptions: { markers: { type: "mixed" } } });
      SymbolTypes.forEach((expectedType, i) => {
        const serie = new Serie(opts, { data: [] }, i);
        expect(serie.marker).toBe(expectedType);
      });
    });

    it("wraps around SymbolTypes when index exceeds its length", () => {
      const opts = resolveOptions({ plotOptions: { markers: { type: "mixed" } } });
      const serie = new Serie(opts, { data: [] }, SymbolTypes.length);
      expect(serie.marker).toBe(SymbolTypes[0]);
    });

    it("per-series marker overrides the 'mixed' global type", () => {
      const opts = resolveOptions({ plotOptions: { markers: { type: "mixed" } } });
      const serie = new Serie(opts, { data: [], marker: "cross" }, 0);
      expect(serie.marker).toBe("cross");
    });
  });
});
