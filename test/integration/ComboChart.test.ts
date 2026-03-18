import { describe, it, expect, beforeEach } from "vitest";
import { ComboChart } from "../../src/charts/ComboChart";
import { stubSvgLayout, setupContainer } from "../helpers/svg-stubs";

const NO_ANIM = { plotOptions: { animation: { duration: 0 } } };

const data = {
  categories: { format: "%s", data: ["Jan", "Feb", "Mar", "Apr"] },
  series: [
    { name: "Revenue",  data: [100, 140, 120, 180], type: "column" },
    { name: "Trend",    data: [90,  130, 125, 170], type: "line"   },
  ],
};

beforeEach(() => {
  stubSvgLayout();
  setupContainer();
});

describe("ComboChart", () => {
  it("renders without throwing", () => {
    expect(() => new ComboChart("#chart", data, NO_ANIM).draw()).not.toThrow();
  });

  it("creates a series group for the column series", () => {
    new ComboChart("#chart", data, NO_ANIM).draw();
    expect(document.querySelector("#serie-0")).not.toBeNull();
  });

  it("creates a series group for the line series", () => {
    new ComboChart("#chart", data, NO_ANIM).draw();
    expect(document.querySelector("#serie-1")).not.toBeNull();
  });

  it("creates rect elements for the column series", () => {
    new ComboChart("#chart", data, NO_ANIM).draw();
    expect(document.querySelectorAll("rect").length).toBeGreaterThan(0);
  });

  it("creates a line path for the line series", () => {
    new ComboChart("#chart", data, NO_ANIM).draw();
    expect(document.querySelector("path.line")).not.toBeNull();
  });

  it("line path contains no NaN", () => {
    new ComboChart("#chart", data, NO_ANIM).draw();
    const d = document.querySelector("path.line")?.getAttribute("d") ?? "";
    expect(d).not.toContain("NaN");
  });

  it("destroy() cleans up the DOM", () => {
    const chart = new ComboChart("#chart", data, NO_ANIM);
    chart.draw();
    chart.destroy();
    expect(document.querySelector("#chart")!.children).toHaveLength(0);
  });
});
