import { describe, it, expect, beforeEach } from "vitest";
import { LineChart } from "../../src/charts/LineChart";
import { Categories } from "../../src/core/Categories";
import * as d3 from "d3";
import { stubSvgLayout } from "../helpers/svg-stubs";

describe("LineChart — time scale", () => {
  beforeEach(() => {
    stubSvgLayout();
    document.body.innerHTML = '<div id="chart" style="width:800px;height:400px;"></div>';
  });

  it("renders without errors", () => {
    const data = {
      categories: {
        format: "%Y-%m-%d",
        data: [
          "2024-01-01","2024-02-01","2024-03-01","2024-04-01",
          "2024-05-01","2024-06-01","2024-07-01","2024-08-01",
          "2024-09-01","2024-10-01","2024-11-01","2024-12-01",
        ],
      },
      series: [
        { name: "Revenue",  data: [120, 135, 148, 162, 170, 195, 210, 205, 188, 172, 155, 168] },
        { name: "Expenses", data: [95, 102, 110, 118, 125, 130, 138, 135, 128, 120, 115, 122] },
      ],
    };

    const options = {
      titleArea: { text: "Revenue vs Expenses 2024", height: 50 },
      legendArea: { width: 120, title: "Metric" },
      yAxis: [{ orient: "left" as const, gridlines: "major", title: { text: "$K" } }],
      xAxis: [{ orient: "bottom" as const, labels: { format: "%b" } }],
      plotOptions: {
        markers: { visible: true, size: 5 },
        animation: { duration: 0 },
      },
    };

    expect(() => {
      const chart = new LineChart("#chart", data, options);
      chart.draw();
    }).not.toThrow();
  });

  it("produces a line path with no NaN coordinates", () => {
    const data = {
      categories: {
        format: "%Y-%m-%d",
        data: ["2024-01-01", "2024-04-01", "2024-07-01", "2024-10-01"],
      },
      series: [{ name: "A", data: [10, 20, 15, 25] }],
    };

    const chart = new LineChart("#chart", data, { plotOptions: { animation: { duration: 0 } } });
    chart.draw();

    const linePath = document.querySelector("path.line");
    expect(linePath).not.toBeNull();
    const d = linePath?.getAttribute("d") ?? "";
    expect(d.length).toBeGreaterThan(5);
    expect(d).not.toContain("NaN");
  });

  it("x coordinates for different dates are different (scale works)", () => {
    const data = {
      categories: {
        format: "%Y-%m-%d",
        data: ["2024-01-01", "2024-06-01", "2024-12-01"],
      },
      series: [{ name: "A", data: [10, 20, 15] }],
    };

    const chart = new LineChart("#chart", data, { plotOptions: { animation: { duration: 0 } } });
    chart.draw();

    const linePath = document.querySelector("path.line");
    const d = linePath?.getAttribute("d") ?? "";
    // Parse x coordinates out of the SVG path (M x,y L x,y ...)
    const nums = d.replace(/[MLZ]/g, " ").trim().split(/[\s,]+/).map(Number);
    const xCoords = nums.filter((_, i) => i % 2 === 0);

    expect(xCoords.every(isFinite)).toBe(true);
    expect(xCoords.length).toBeGreaterThanOrEqual(3);
    // Jan, Jun, Dec should have increasing x coords
    expect(xCoords[0]).toBeLessThan(xCoords[1]);
    expect(xCoords[1]).toBeLessThan(xCoords[2]);
  });

  it("Categories.parseFormat correctly returns Date for time format", () => {
    const cats = new Categories(["2024-01-01", "2024-06-01"], "%Y-%m-%d");
    const jan = cats.parseFormat("2024-01-01");
    const jun = cats.parseFormat("2024-06-01");
    expect(jan).toBeInstanceOf(Date);
    expect(jun).toBeInstanceOf(Date);
    expect((jan as Date).getMonth()).toBe(0); // January
    expect((jun as Date).getMonth()).toBe(5); // June
  });

  it("d3.timeParse parses the example dates correctly", () => {
    const parse = d3.timeParse("%Y-%m-%d");
    const date = parse("2024-03-15");
    expect(date).not.toBeNull();
    expect(date?.getFullYear()).toBe(2024);
    expect(date?.getMonth()).toBe(2); // March (0-indexed)
    expect(date?.getDate()).toBe(15);
  });
});
