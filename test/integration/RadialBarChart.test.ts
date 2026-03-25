import { describe, it, expect, beforeEach } from "vitest";
import { RadialBarChart } from "../../src/charts/RadialBarChart";
import { stubSvgLayout, setupContainer } from "../helpers/svg-stubs";

const NO_ANIM = { plotOptions: { animation: { duration: 0 } } };

const data = {
  categories: { format: "%s", data: ["Q1", "Q2", "Q3", "Q4"] },
  series: [
    { name: "Product A", data: [30, 50, 70, 90] },
    { name: "Product B", data: [20, 40, 60, 80] },
  ],
};

beforeEach(() => {
  stubSvgLayout();
  setupContainer();
});

describe("RadialBarChart", () => {
  it("renders without throwing", () => {
    expect(() => new RadialBarChart("#chart", data, NO_ANIM).draw()).not.toThrow();
  });

  it("creates arc path elements", () => {
    new RadialBarChart("#chart", data, NO_ANIM).draw();
    // Each series group has class "arc"; paths are children of those groups
    const arcs = document.querySelectorAll("g.arc path");
    // 4 categories × 2 series = 8 arcs
    expect(arcs.length).toBe(8);
  });

  it("creates a radial-label per category", () => {
    new RadialBarChart("#chart", data, NO_ANIM).draw();
    const labels = document.querySelectorAll("text.radial-label");
    expect(labels.length).toBe(data.categories.data.length);
  });

  it("creates scale-tick and scale-label elements", () => {
    new RadialBarChart("#chart", data, NO_ANIM).draw();
    expect(document.querySelectorAll("line.scale-tick").length).toBeGreaterThan(0);
    expect(document.querySelectorAll("text.scale-label").length).toBeGreaterThan(0);
  });

  it("destroy() cleans up the DOM", () => {
    const chart = new RadialBarChart("#chart", data, NO_ANIM);
    chart.draw();
    chart.destroy();
    expect(document.querySelector("#chart")!.children).toHaveLength(0);
  });
});
