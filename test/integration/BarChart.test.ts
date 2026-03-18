import { describe, it, expect, beforeEach } from "vitest";
import { BarChart, StackedBarChart, StackedPercentBarChart } from "../../src/charts/BarChart";
import { stubSvgLayout, setupContainer } from "../helpers/svg-stubs";

const NO_ANIM = { plotOptions: { animation: { duration: 0 } } };

const data = {
  categories: { format: "%s", data: ["Alpha", "Beta", "Gamma", "Delta"] },
  series: [
    { name: "2023", data: [40, 80, 60, 100] },
    { name: "2024", data: [50, 70, 90, 110] },
  ],
};

beforeEach(() => {
  stubSvgLayout();
  setupContainer();
});

describe("BarChart", () => {
  it("renders without throwing", () => {
    expect(() => new BarChart("#chart", data, NO_ANIM).draw()).not.toThrow();
  });

  it("creates a series group per series", () => {
    new BarChart("#chart", data, NO_ANIM).draw();
    expect(document.querySelector("#serie-0")).not.toBeNull();
    expect(document.querySelector("#serie-1")).not.toBeNull();
  });

  it("creates rect elements for each data point per series", () => {
    new BarChart("#chart", data, NO_ANIM).draw();
    // 2 series × 4 categories = 8 rects minimum
    expect(document.querySelectorAll("rect").length).toBeGreaterThanOrEqual(8);
  });

  it("rect elements have no NaN attributes", () => {
    new BarChart("#chart", data, NO_ANIM).draw();
    document.querySelectorAll<SVGRectElement>("rect").forEach((rect) => {
      ["x", "y", "width", "height"].forEach((attr) => {
        const val = rect.getAttribute(attr);
        if (val !== null) expect(val).not.toContain("NaN");
      });
    });
  });
});

describe("StackedBarChart", () => {
  it("renders without throwing", () => {
    expect(() => new StackedBarChart("#chart", data, NO_ANIM).draw()).not.toThrow();
  });
});

describe("StackedPercentBarChart", () => {
  it("renders without throwing", () => {
    expect(() => new StackedPercentBarChart("#chart", data, NO_ANIM).draw()).not.toThrow();
  });
});
