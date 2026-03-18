# agents.md

This file provides deep implementation guidance for AI agents working in this repository.

## Adding a New Chart Type

**Step 1 — Create `src/charts/MyChart.ts`** extending `CartesianChart` (or `Chart` for non-Cartesian):

```typescript
export class MyChart extends CartesianChart {
  public constructor(selector: string, data: IChartData, options?: IOptions) {
    super(selector, data, options);
    for (const axis of this.axes) {
      axis.isDataAxis = axis.type === AxisType.Y;
    }
    // Set this.stackType = StackType.Normal here for stacked variants
  }

  public override draw(): void {
    super.draw(); // renders canvas, axes, legend
    if (!this.hasData()) { return; }

    const svgSeries = this.canvas.plotArea.svg.append("g").attr("class", "series");
    const { duration, ease } = this.options.plotOptions.animation;

    for (let s = 0; s < this.series.length; s++) {
      new MyShape(svgSeries, s)
        .animation(duration, ease)
        .color(this.colorPalette.color(s))
        .x((d, i) => this.getXCoordinate(d, i, s))
        .y((d, i) => this.getYCoordinate(d, i, s))
        .draw(this.series.getMatrixItem(s));
    }
  }

  public override getXCoordinate(d: IDatum, i: number, serie: number): number { ... }
  public override getYCoordinate(d: IDatum, i: number, serie: number): number { ... }
}
```

**Step 2 — Export** from `src/index.ts`.

**Step 3 — Add an integration test** in `test/integration/MyChart.test.ts` (see test patterns below).

**Step 4 — Add an example** HTML file in `examples/`.

## Data Structures

**Input `IChartData`**:
```typescript
{
  categories: { format: "%s" /* or d3 time string */, data: string[] },
  series: ISerie[]
}
```

**`ISerie`** (consumer-facing, all optional fields):
| Field | Purpose |
|-------|---------|
| `data` | Y values |
| `min` / `max` | Range band bounds (y is NaN when using these) |
| `size` | Bubble sizes (scatter charts) |
| `axis` | Binds to a named axis for dual-axis charts |
| `marker` | Per-series `MarkerType` override |
| `type` | `"column"` or `"line"` (ComboChart only) |

**Computed `IDatum`** (what shapes receive via `getMatrixItem(s)`):
| Field | Meaning |
|-------|---------|
| `y` | Raw value (NaN for range-only series) |
| `y0` | Lower stack bound (0 for plain series) |
| `y1` | Upper stack bound (= y for plain series) |
| `sum` | Cumulative total for stacking |
| `perc` | Fraction of column total (0–1) for percent charts |
| `max` | Max absolute value in the category column |

## Shape Builder API

All shapes extend `Shape` and use a fluent API. Call `.draw()` last:

```typescript
new LineShape(svgG, serieIndex)
  .animation(duration, ease)
  .color(cssColorString)
  .interpolation("linear" | "basis" | "cardinal" | ...)
  .marker(size, MarkerType, visible)
  .labels(formatString, rotationDegrees, visible)
  .labelValue((d) => d.perc)  // default: (d) => d.y
  .opacity(0.5)
  .x(coordFn)
  .y(coordFn)
  .tooltipFn((sel, serie) => this.tooltip.attach(sel, serie))
  .draw(matrixData);          // IDatum[]
```

The `CoordFn` signature is `(d: IDatum, i: number, serie: number) => number` throughout.

Rendered SVG structure per series:
```
<g id="serie-{s}">
  <path class="line"> | <rect class="column"> | ...
  <g id="labels-{s}"> (if labels enabled)
</g>
```

## Stacking Variants

Set `this.stackType` in the subclass constructor (after `super()`):

| StackType | Coordinate pattern |
|-----------|-------------------|
| `None` | `y(d)` → `scale(d.y1)` |
| `Normal` | top: `scale(d.sum)`, bottom: `scale(d.sum - d.y)` |
| `Percent` | top: `scale(d.y1)`, bottom: `scale(d.y0)`; override Y scale domain to `[1, 0]` |

For `StackedPercentLineChart` / `StackedPercentColumnChart`, also override `getYScale()` to set domain `[1, 0]` and format labels as `(d) => d.perc`.

## Axis & Scale Patterns

**Default scale selection** (in `CartesianChart`):
- `categories.format === "%s"` → `d3.scaleBand()` (ordinal)
- Any other format → `d3.scaleTime()` (parsed dates)

**Overriding** — implement `getXScale(axis)` or `getYScale(axis)` in the chart subclass to return a custom D3 scale.

**Looking up a scale by axis name** (for dual-axis):
```typescript
const yIdx = this.getAxisByName(AxisType.Y, d.axis ?? "");
const scale = this.axes[yIdx].scale as d3.ScaleLinear<number, number>;
```

## Test Patterns

Tests use `vitest` + `jsdom`. Every integration test file follows this structure:

```typescript
import { stubSvgLayout, setupContainer } from "../helpers/svg-stubs";

beforeEach(() => {
  stubSvgLayout();   // Patch getBBox, getBoundingClientRect, getTotalLength, ResizeObserver
  setupContainer();  // Creates <div id="chart" style="width:800px;height:400px;...">
});

const NO_ANIM = { plotOptions: { animation: { duration: 0 } } };

describe("MyChart", () => {
  it("renders without throwing", () => {
    expect(() => new MyChart("#chart", data, NO_ANIM).draw()).not.toThrow();
  });

  it("creates expected SVG elements", () => {
    new MyChart("#chart", data, NO_ANIM).draw();
    expect(document.querySelectorAll("path.line").length).toBe(2);
  });

  it("paths contain no NaN coordinates", () => {
    new MyChart("#chart", data, NO_ANIM).draw();
    document.querySelectorAll<SVGPathElement>("path.line").forEach((p) => {
      expect(p.getAttribute("d")).not.toContain("NaN");
    });
  });

  it("destroy() clears container", () => {
    const chart = new MyChart("#chart", data, NO_ANIM);
    chart.draw();
    chart.destroy();
    expect(document.querySelector("#chart")!.children).toHaveLength(0);
  });
});
```

Always pass `duration: 0` in tests — D3 transitions do not run in jsdom.

## Options

`resolveOptions()` (`core/Options.ts`) merges user options with defaults. After resolution, all nested fields are guaranteed defined — no optional chaining needed inside core code. The resolved type is `ResolvedOptions`.

Access in chart methods: `this.options.plotOptions.animation.duration`, `this.options.canvas.padding`, etc.

## ESLint Conventions

- Interface names must be `I`-prefixed (`IChartData`, not `ChartData`)
- Member ordering enforced: `public static` → `private` fields → `constructor` → methods
- Run `npm run lint` to verify before committing
