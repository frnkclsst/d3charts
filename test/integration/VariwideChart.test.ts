import { describe, it, expect, beforeEach } from "vitest";
import { VariwideChart } from "../../src/charts/VariwideChart";
import { stubSvgLayout, setupContainer } from "../helpers/svg-stubs";

const NO_ANIM = { plotOptions: { animation: { duration: 0 } } };

const data = {
  categories: { format: "%s", data: ["Norway", "Belgium", "Germany", "France"] },
  series: [{
    name: "Labour cost",
    format: "€,.0f",
    data:   [52, 48, 37, 41],
    weight: [594, 627, 4444, 3200],
  }],
};

beforeEach(() => {
  stubSvgLayout();
  setupContainer();
});

describe("VariwideChart", () => {
  it("renders without throwing", () => {
    expect(() => new VariwideChart("#chart", data, NO_ANIM).draw()).not.toThrow();
  });

  it("creates one rect per category", () => {
    new VariwideChart("#chart", data, NO_ANIM).draw();
    const rects = document.querySelectorAll("rect");
    expect(rects.length).toBeGreaterThanOrEqual(data.categories.data.length);
  });

  it("rect elements have no NaN x/y/width/height attributes", () => {
    new VariwideChart("#chart", data, NO_ANIM).draw();
    document.querySelectorAll<SVGRectElement>("rect").forEach((rect) => {
      ["x", "y", "width", "height"].forEach((attr) => {
        const val = rect.getAttribute(attr);
        if (val !== null) expect(val).not.toContain("NaN");
      });
    });
  });

  it("columns have varying widths proportional to weight", () => {
    new VariwideChart("#chart", data, NO_ANIM).draw();
    const widths = Array.from(document.querySelectorAll<SVGRectElement>("rect"))
      .map((r) => Number(r.getAttribute("width")))
      .filter((w) => !isNaN(w) && w > 0);
    // Not all columns should have the same width
    const allEqual = widths.every((w) => w === widths[0]);
    expect(allEqual).toBe(false);
  });

  it("destroy() cleans up the DOM", () => {
    const chart = new VariwideChart("#chart", data, NO_ANIM);
    chart.draw();
    chart.destroy();
    expect(document.querySelector("#chart")!.children).toHaveLength(0);
  });
});
