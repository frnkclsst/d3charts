import { describe, it, expect, beforeEach } from "vitest";
import { HeatmapChart } from "../../src/charts/HeatmapChart";
import { stubSvgLayout, setupContainer } from "../helpers/svg-stubs";

const NO_ANIM = { plotOptions: { animation: { duration: 0 } } };

const data = {
  categories: { format: "%s", data: ["Mon", "Tue", "Wed", "Thu", "Fri"] },
  series: [
    { name: "Morning",   data: [10, 20, 30, 25, 15] },
    { name: "Afternoon", data: [40, 55, 60, 45, 30] },
    { name: "Evening",   data: [5,  10, 15, 20, 10] },
  ],
};

beforeEach(() => {
  stubSvgLayout();
  setupContainer();
});

describe("HeatmapChart", () => {
  it("renders without throwing", () => {
    expect(() => new HeatmapChart("#chart", data, NO_ANIM).draw()).not.toThrow();
  });

  it("creates a series group per series", () => {
    new HeatmapChart("#chart", data, NO_ANIM).draw();
    expect(document.querySelector("#serie-0")).not.toBeNull();
    expect(document.querySelector("#serie-1")).not.toBeNull();
    expect(document.querySelector("#serie-2")).not.toBeNull();
  });

  it("creates one cell rect per category per series", () => {
    new HeatmapChart("#chart", data, NO_ANIM).draw();
    const cells = document.querySelectorAll("rect.cell");
    // 3 series × 5 categories = 15 cells
    expect(cells.length).toBe(15);
  });

  it("cell rects have no NaN x/y/width/height attributes", () => {
    new HeatmapChart("#chart", data, NO_ANIM).draw();
    document.querySelectorAll<SVGRectElement>("rect.cell").forEach((rect) => {
      ["x", "y", "width", "height"].forEach((attr) => {
        const val = rect.getAttribute(attr);
        if (val !== null) expect(val).not.toContain("NaN");
      });
    });
  });

  it("accepts a custom colorRange without throwing", () => {
    expect(() =>
      new HeatmapChart("#chart", data, {
        ...NO_ANIM,
        plotOptions: {
          ...NO_ANIM.plotOptions,
          heatmap: { colorRange: ["#ffffff", "#ff0000"] },
        },
      }).draw()
    ).not.toThrow();
  });

  it("destroy() cleans up the DOM", () => {
    const chart = new HeatmapChart("#chart", data, NO_ANIM);
    chart.draw();
    chart.destroy();
    expect(document.querySelector("#chart")!.children).toHaveLength(0);
  });
});
