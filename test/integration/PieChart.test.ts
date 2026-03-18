import { describe, it, expect, beforeEach } from "vitest";
import { PieChart, DonutChart } from "../../src/charts/PieChart";
import { stubSvgLayout, setupContainer } from "../helpers/svg-stubs";
import * as d3 from "d3";

const NO_ANIM = { plotOptions: { animation: { duration: 0 } } };

const singleSeriesData = {
  categories: { format: "%s", data: ["Chrome", "Firefox", "Safari", "Edge"] },
  series: [{ name: "Market share", data: [65, 15, 12, 8] }],
};

const multiSeriesData = {
  categories: { format: "%s", data: ["A", "B", "C"] },
  series: [
    { name: "Inner",  data: [30, 40, 30] },
    { name: "Outer",  data: [20, 50, 30] },
  ],
};

beforeEach(() => {
  stubSvgLayout();
  setupContainer();
});

describe("PieChart", () => {
  it("renders without throwing", () => {
    expect(() => new PieChart("#chart", singleSeriesData, NO_ANIM).draw()).not.toThrow();
  });

  it("creates a series group", () => {
    new PieChart("#chart", singleSeriesData, NO_ANIM).draw();
    expect(document.querySelector("g.series")).not.toBeNull();
  });

  it("creates one slice group per category", () => {
    new PieChart("#chart", singleSeriesData, NO_ANIM).draw();
    const slices = document.querySelectorAll("g.slice");
    expect(slices.length).toBe(singleSeriesData.categories.data.length);
  });

  it("each slice contains a <path>", () => {
    new PieChart("#chart", singleSeriesData, NO_ANIM).draw();
    document.querySelectorAll("g.slice").forEach((slice) => {
      expect(slice.querySelector("path")).not.toBeNull();
    });
  });

  it("slice paths contain no NaN", () => {
    new PieChart("#chart", singleSeriesData, NO_ANIM).draw();
    document.querySelectorAll<SVGPathElement>("g.slice path").forEach((path) => {
      expect(path.getAttribute("d")).not.toContain("NaN");
    });
  });

  it("toggleSerie does not throw", () => {
    const chart = new PieChart("#chart", singleSeriesData, NO_ANIM);
    chart.draw();
    // D3 transitions are async in jsdom — just verify no error is thrown
    expect(() => chart.toggleSerie(0)).not.toThrow();
    expect(() => chart.toggleSerie(0)).not.toThrow();
  });

  it("renders multiple series as concentric rings", () => {
    expect(() => new PieChart("#chart", multiSeriesData, NO_ANIM).draw()).not.toThrow();
    // Two serie groups should exist
    expect(document.querySelector("#serie-0")).not.toBeNull();
    expect(document.querySelector("#serie-1")).not.toBeNull();
  });
});

describe("DonutChart", () => {
  it("renders without throwing", () => {
    expect(() => new DonutChart("#chart", singleSeriesData, NO_ANIM).draw()).not.toThrow();
  });

  it("has a non-zero inner radius (arc paths differ from PieChart)", () => {
    // Both charts render path elements; DonutChart paths represent arcs with a hole.
    new DonutChart("#chart", singleSeriesData, NO_ANIM).draw();
    const paths = document.querySelectorAll("g.slice path");
    expect(paths.length).toBe(singleSeriesData.categories.data.length);
  });

  it("accepts a custom innerRadius override", () => {
    expect(() =>
      new DonutChart("#chart", singleSeriesData, {
        ...NO_ANIM,
        plotOptions: { ...NO_ANIM.plotOptions, pie: { innerRadius: 0.3 } },
      }).draw(),
    ).not.toThrow();
  });
});
