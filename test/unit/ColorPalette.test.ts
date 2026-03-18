import { describe, it, expect } from "vitest";
import { ColorPalette } from "../../src/core/ColorPalette";

describe("ColorPalette", () => {
  it("returns the correct color for each index within bounds", () => {
    const palette = new ColorPalette(["red", "green", "blue"]);
    expect(palette.color(0)).toBe("red");
    expect(palette.color(1)).toBe("green");
    expect(palette.color(2)).toBe("blue");
  });

  it("cycles back to the start when index exceeds the palette length", () => {
    const palette = new ColorPalette(["red", "green", "blue"]);
    expect(palette.color(3)).toBe("red");   // 3 % 3 = 0
    expect(palette.color(4)).toBe("green"); // 4 % 3 = 1
    expect(palette.color(5)).toBe("blue");  // 5 % 3 = 2
    expect(palette.color(6)).toBe("red");   // 6 % 3 = 0
  });

  it("works with a single-color palette", () => {
    const palette = new ColorPalette(["#ff0000"]);
    expect(palette.color(0)).toBe("#ff0000");
    expect(palette.color(99)).toBe("#ff0000");
  });

  it("handles large indices correctly", () => {
    const palette = new ColorPalette(["a", "b"]);
    expect(palette.color(100)).toBe("a"); // 100 % 2 = 0
    expect(palette.color(101)).toBe("b"); // 101 % 2 = 1
  });
});
