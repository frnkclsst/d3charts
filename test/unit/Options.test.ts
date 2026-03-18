import { describe, it, expect } from "vitest";
import { resolveOptions } from "../../src/core/Options";
import { GridLineType } from "../../src/types/enums";

describe("resolveOptions", () => {
  describe("defaults when called with no arguments", () => {
    const opts = resolveOptions();

    it("animation defaults", () => {
      expect(opts.plotOptions.animation.duration).toBe(1000);
      expect(opts.plotOptions.animation.ease).toBe("linear");
    });

    it("area defaults", () => {
      expect(opts.plotOptions.area.visible).toBe(false);
      expect(opts.plotOptions.area.opacity).toBe(0.4);
    });

    it("marker defaults", () => {
      expect(opts.plotOptions.markers.visible).toBe(true);
      expect(opts.plotOptions.markers.size).toBe(6);
      expect(opts.plotOptions.markers.type).toBe("circle");
    });

    it("band defaults", () => {
      expect(opts.plotOptions.bands.innerPadding).toBe(0.5);
      expect(opts.plotOptions.bands.outerPadding).toBe(0.5);
    });

    it("pie defaults", () => {
      expect(opts.plotOptions.pie.innerRadius).toBe(0);
    });

    it("provides a 20-color default palette", () => {
      expect(opts.plotOptions.colors).toHaveLength(20);
    });

    it("plotArea padding default", () => {
      expect(opts.plotArea.padding).toBe(20);
    });

    it("creates one default x-axis and one default y-axis", () => {
      expect(opts.xAxes).toHaveLength(1);
      expect(opts.yAxes).toHaveLength(1);
    });

    it("tooltip defaults are empty strings", () => {
      expect(opts.tooltip.title).toBe("");
      expect(opts.tooltip.valueSuffix).toBe("");
      expect(opts.tooltip.valuePointFormat).toBe("");
    });

    it("series labels are hidden by default", () => {
      expect(opts.series.labels.visible).toBe(false);
    });
  });

  describe("partial overrides", () => {
    it("overriding animation duration preserves other animation defaults", () => {
      const opts = resolveOptions({ plotOptions: { animation: { duration: 0 } } });
      expect(opts.plotOptions.animation.duration).toBe(0);
      expect(opts.plotOptions.animation.ease).toBe("linear");
    });

    it("custom color palette replaces the default", () => {
      const colors = ["#111", "#222", "#333"];
      const opts = resolveOptions({ plotOptions: { colors } });
      expect(opts.plotOptions.colors).toEqual(colors);
    });

    it("tooltip options are applied correctly", () => {
      const opts = resolveOptions({
        tooltip: { title: "Sales", valueSuffix: " $", valuePointFormat: ".2f" },
      });
      expect(opts.tooltip.title).toBe("Sales");
      expect(opts.tooltip.valueSuffix).toBe(" $");
      expect(opts.tooltip.valuePointFormat).toBe(".2f");
    });
  });

  describe("axis resolution", () => {
    it("accepts a single xAxis object and wraps it in an array", () => {
      const opts = resolveOptions({ xAxis: { gridlines: "major" } });
      expect(opts.xAxes).toHaveLength(1);
      expect(opts.xAxes[0].gridlines).toBe("major");
    });

    it("accepts an array of axis objects", () => {
      const opts = resolveOptions({ yAxis: [{ name: "left" }, { name: "right" }] });
      expect(opts.yAxes).toHaveLength(2);
      expect(opts.yAxes[0].name).toBe("left");
      expect(opts.yAxes[1].name).toBe("right");
    });

    it("applies axis defaults when an empty object is provided", () => {
      const opts = resolveOptions({ yAxis: {} });
      expect(opts.yAxes[0].gridlines).toBe(GridLineType.None);
      expect(opts.yAxes[0].tickmarks).toBe(false);
      expect(opts.yAxes[0].labels.format).toBe("");
      expect(opts.yAxes[0].labels.rotate).toBe(0);
      expect(opts.yAxes[0].title.text).toBe("");
      expect(opts.yAxes[0].title.align).toBe("center");
      expect(opts.yAxes[0].title.valign).toBe("middle");
    });

    it("applies custom axis title and orientation", () => {
      const opts = resolveOptions({
        yAxis: { title: { text: "Revenue ($)" }, orient: "right" },
      });
      expect(opts.yAxes[0].title.text).toBe("Revenue ($)");
      expect(opts.yAxes[0].orient).toBe("right");
    });
  });
});
