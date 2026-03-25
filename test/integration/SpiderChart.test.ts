import { describe, it, expect, beforeEach } from "vitest";
import { SpiderChart } from "../../src/charts/SpiderChart";
import { stubSvgLayout, setupContainer } from "../helpers/svg-stubs";

const NO_ANIM = { plotOptions: { animation: { duration: 0 } } };

const data = {
  categories: { format: "%s", data: ["Speed", "Power", "Defense", "Range", "Stamina"] },
  series: [
    { name: "Unit A", data: [80, 90, 60, 70, 85] },
    { name: "Unit B", data: [60, 70, 90, 85, 75] },
  ],
};

beforeEach(() => {
  stubSvgLayout();
  setupContainer();
});

describe("SpiderChart", () => {
  it("renders without throwing", () => {
    expect(() => new SpiderChart("#chart", data, NO_ANIM).draw()).not.toThrow();
  });

  it("creates a series group per series", () => {
    new SpiderChart("#chart", data, NO_ANIM).draw();
    expect(document.querySelector("#serie-0")).not.toBeNull();
    expect(document.querySelector("#serie-1")).not.toBeNull();
  });

  it("creates circle gridlines by default", () => {
    new SpiderChart("#chart", data, NO_ANIM).draw();
    expect(document.querySelectorAll("circle.spider-gridline").length).toBeGreaterThan(0);
  });

  it("creates polygon gridlines when configured", () => {
    new SpiderChart("#chart", data, {
      ...NO_ANIM,
      plotOptions: { ...NO_ANIM.plotOptions, spider: { gridlines: "polygon" } },
    }).draw();
    expect(document.querySelectorAll("polygon.spider-gridline").length).toBeGreaterThan(0);
  });

  it("creates one spoke per category", () => {
    new SpiderChart("#chart", data, NO_ANIM).draw();
    const spokes = document.querySelectorAll("line.spider-spoke");
    expect(spokes.length).toBe(data.categories.data.length);
  });

  it("creates one label per category", () => {
    new SpiderChart("#chart", data, NO_ANIM).draw();
    const labels = document.querySelectorAll("text.spider-label");
    expect(labels.length).toBe(data.categories.data.length);
  });

  it("does not render when fewer than 3 categories are provided", () => {
    const twoCategories = {
      categories: { format: "%s", data: ["A", "B"] },
      series: [{ name: "S", data: [1, 2] }],
    };
    new SpiderChart("#chart", twoCategories, NO_ANIM).draw();
    expect(document.querySelectorAll("line.spider-spoke").length).toBe(0);
  });

  it("destroy() cleans up the DOM", () => {
    const chart = new SpiderChart("#chart", data, NO_ANIM);
    chart.draw();
    chart.destroy();
    expect(document.querySelector("#chart")!.children).toHaveLength(0);
  });
});
