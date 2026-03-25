import { describe, it, expect, beforeEach } from "vitest";
import { LineChart, StackedLineChart, StackedPercentLineChart } from "../../src/charts/LineChart";
import { stubSvgLayout, setupContainer } from "../helpers/svg-stubs";

const NO_ANIM = { plotOptions: { animation: { duration: 0 } } };

const data = {
  categories: { format: "%s", data: ["Jan", "Feb", "Mar", "Apr", "May"] },
  series: [
    { name: "A", data: [10, 25, 15, 30, 20] },
    { name: "B", data: [5,  12,  8, 18, 10] },
  ],
};

beforeEach(() => {
  stubSvgLayout();
  setupContainer();
});

describe("LineChart", () => {
  it("renders without throwing", () => {
    expect(() => {
      new LineChart("#chart", data, NO_ANIM).draw();
    }).not.toThrow();
  });

  it("creates a series group for each series", () => {
    new LineChart("#chart", data, NO_ANIM).draw();
    expect(document.querySelector("#serie-0")).not.toBeNull();
    expect(document.querySelector("#serie-1")).not.toBeNull();
  });

  it("creates a line path per series", () => {
    new LineChart("#chart", data, NO_ANIM).draw();
    const lines = document.querySelectorAll("path.line");
    expect(lines.length).toBe(2);
  });

  it("line paths contain no NaN coordinates", () => {
    new LineChart("#chart", data, NO_ANIM).draw();
    document.querySelectorAll<SVGPathElement>("path.line").forEach((path) => {
      expect(path.getAttribute("d")).not.toContain("NaN");
    });
  });

  it("creates an area path when area.visible is true", () => {
    new LineChart("#chart", data, {
      ...NO_ANIM,
      plotOptions: { ...NO_ANIM.plotOptions, area: { visible: true } },
    }).draw();
    expect(document.querySelector("path.area")).not.toBeNull();
  });

  it("does not create area paths when area.visible is false (default)", () => {
    new LineChart("#chart", data, NO_ANIM).draw();
    expect(document.querySelector("path.area")).toBeNull();
  });

  it("destroy() removes all child elements", () => {
    const chart = new LineChart("#chart", data, NO_ANIM);
    chart.draw();
    chart.destroy();
    expect(document.querySelector("#chart")!.children).toHaveLength(0);
  });

  describe("mismatched data length (more data than categories)", () => {
    const shortCats = {
      categories: { format: "%s", data: ["Jan", "Feb", "Mar"] },
      series: [{ name: "A", data: [10, 25, 15, 30, 20] }],   // 5 values, 3 categories
    };

    it("renders without throwing when data is longer than categories", () => {
      expect(() => {
        new LineChart("#chart", shortCats, NO_ANIM).draw();
      }).not.toThrow();
    });

    it("line path contains no NaN coordinates when data exceeds categories", () => {
      new LineChart("#chart", shortCats, NO_ANIM).draw();
      document.querySelectorAll<SVGPathElement>("path.line").forEach((path) => {
        expect(path.getAttribute("d")).not.toContain("NaN");
      });
    });

    it("area path contains no NaN coordinates when data exceeds categories", () => {
      new LineChart("#chart", shortCats, {
        ...NO_ANIM,
        plotOptions: { ...NO_ANIM.plotOptions, area: { visible: true } },
      }).draw();
      document.querySelectorAll<SVGPathElement>("path.area").forEach((path) => {
        expect(path.getAttribute("d")).not.toContain("NaN");
      });
    });
  });
});

describe("StackedLineChart", () => {
  it("renders without throwing", () => {
    expect(() => {
      new StackedLineChart("#chart", data, NO_ANIM).draw();
    }).not.toThrow();
  });

  it("creates one line path per series", () => {
    new StackedLineChart("#chart", data, NO_ANIM).draw();
    expect(document.querySelectorAll("path.line").length).toBe(2);
  });
});

describe("StackedPercentLineChart", () => {
  it("renders without throwing", () => {
    expect(() => {
      new StackedPercentLineChart("#chart", data, NO_ANIM).draw();
    }).not.toThrow();
  });
});
