import { describe, it, expect, beforeEach } from "vitest";
import {
  ColumnChart,
  StackedColumnChart,
  StackedPercentColumnChart,
} from "../../src/charts/ColumnChart";
import { stubSvgLayout, setupContainer } from "../helpers/svg-stubs";

const NO_ANIM = { plotOptions: { animation: { duration: 0 } } };

const data = {
  categories: { format: "%s", data: ["Q1", "Q2", "Q3", "Q4"] },
  series: [
    { name: "Product A", data: [100, 150, 120, 200] },
    { name: "Product B", data: [80,  110,  90, 160] },
  ],
};

beforeEach(() => {
  stubSvgLayout();
  setupContainer();
});

describe("ColumnChart", () => {
  it("renders without throwing", () => {
    expect(() => new ColumnChart("#chart", data, NO_ANIM).draw()).not.toThrow();
  });

  it("creates a series group per series", () => {
    new ColumnChart("#chart", data, NO_ANIM).draw();
    expect(document.querySelector("#serie-0")).not.toBeNull();
    expect(document.querySelector("#serie-1")).not.toBeNull();
  });

  it("creates rect elements for each data point per series", () => {
    new ColumnChart("#chart", data, NO_ANIM).draw();
    const rects = document.querySelectorAll("rect");
    // 2 series × 4 categories = 8 rects minimum
    expect(rects.length).toBeGreaterThanOrEqual(8);
  });

  it("rect elements have no NaN x/y/width/height attributes", () => {
    new ColumnChart("#chart", data, NO_ANIM).draw();
    document.querySelectorAll<SVGRectElement>("rect").forEach((rect) => {
      ["x", "y", "width", "height"].forEach((attr) => {
        const val = rect.getAttribute(attr);
        if (val !== null) expect(val).not.toContain("NaN");
      });
    });
  });

  it("destroy() cleans up the DOM", () => {
    const chart = new ColumnChart("#chart", data, NO_ANIM);
    chart.draw();
    chart.destroy();
    expect(document.querySelector("#chart")!.children).toHaveLength(0);
  });
});

describe("StackedColumnChart", () => {
  it("renders without throwing", () => {
    expect(() => new StackedColumnChart("#chart", data, NO_ANIM).draw()).not.toThrow();
  });

  it("creates one series group per series", () => {
    new StackedColumnChart("#chart", data, NO_ANIM).draw();
    expect(document.querySelector("#serie-0")).not.toBeNull();
    expect(document.querySelector("#serie-1")).not.toBeNull();
  });
});

describe("StackedPercentColumnChart", () => {
  it("renders without throwing", () => {
    expect(() =>
      new StackedPercentColumnChart("#chart", data, NO_ANIM).draw(),
    ).not.toThrow();
  });
});
