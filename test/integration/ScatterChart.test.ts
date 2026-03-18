import { describe, it, expect, beforeEach } from "vitest";
import { ScatterChart } from "../../src/charts/ScatterChart";
import { stubSvgLayout, setupContainer } from "../helpers/svg-stubs";

const NO_ANIM = { plotOptions: { animation: { duration: 0 } } };

// ScatterChart convention: series[0] = X values (not rendered),
// series[1..n] = Y groups rendered as serie-1, serie-2, etc.
const data = {
  categories: { format: "%s", data: ["P1", "P2", "P3", "P4", "P5"] },
  series: [
    { name: "X axis",  data: [10, 20, 15, 30, 25] },             // X values
    { name: "Group A", data: [5,  18, 22, 12, 28], size: [4, 7, 9, 6, 5] }, // Y group 1
    { name: "Group B", data: [8,  14, 19, 20, 10], size: [3, 5, 7, 4, 6] }, // Y group 2
  ],
};

const simpleData = {
  categories: { format: "%s", data: ["A", "B", "C"] },
  series: [
    { name: "X", data: [1, 2, 3] },
    { name: "Y", data: [4, 5, 6] },
  ],
};

beforeEach(() => {
  stubSvgLayout();
  setupContainer();
});

describe("ScatterChart", () => {
  it("renders without throwing", () => {
    expect(() => new ScatterChart("#chart", data, NO_ANIM).draw()).not.toThrow();
  });

  it("creates one series group per Y series (serie-0, serie-1, …)", () => {
    // series[0] is X-axis data; series[1] and series[2] become serie-0 and serie-1
    new ScatterChart("#chart", data, NO_ANIM).draw();
    expect(document.querySelector("#serie-0")).not.toBeNull();
    expect(document.querySelector("#serie-1")).not.toBeNull();
  });

  it("renders with minimal data (X series + one Y series)", () => {
    expect(() => new ScatterChart("#chart", simpleData, NO_ANIM).draw()).not.toThrow();
  });

  it("destroy() cleans up the DOM", () => {
    const chart = new ScatterChart("#chart", data, NO_ANIM);
    chart.draw();
    chart.destroy();
    expect(document.querySelector("#chart")!.children).toHaveLength(0);
  });
});
