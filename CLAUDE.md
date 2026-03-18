# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start Vite dev server on port 9005 (opens gallery.html)
npm run build        # Full build: lint → test → bundle (tsup)
npm run lint         # Run ESLint via scripts/lint.mjs
npm test             # Run tests once (vitest run)
npm run test:watch   # Run tests in watch mode
npm run typecheck    # TypeScript type check without emitting
```

To run a single test file:
```bash
npx vitest run test/integration/LineChart.test.ts
```

## Architecture

This is a TypeScript charting library built on D3 v7. It outputs ESM, CJS, and IIFE bundles. D3 is a peer dependency (external in bundle).

### Class Hierarchy

```
Chart (core/Chart.ts, abstract)
├── PieChart / DonutChart
└── CartesianChart (abstract)
    ├── LineChart / StackedLineChart / StackedPercentLineChart
    ├── ColumnChart / StackedColumnChart / StackedPercentColumnChart
    ├── BarChart / StackedBarChart / StackedPercentBarChart
    ├── ScatterChart
    └── ComboChart
```

The concrete chart subclasses live in `src/charts/`. The abstract base classes and supporting infrastructure live in `src/core/`.

### Data Flow

1. Consumer passes `IChartData` (categories + series array) to a chart constructor
2. `Series` (core) normalizes input into `Serie` objects and computes a 2D data matrix of `IDatum` with stacking metadata
3. `Canvas` (core) creates layout areas: `TitleArea`, `PlotArea`, `LegendArea`
4. `XAxis` / `YAxis` do a two-pass render: `setSize()` measures label dimensions, then `draw()` positions everything
5. `Shape` subclasses (`LineShape`, `ColumnShape`, `BarShape`, etc.) render the actual SVG paths/rects
6. `Tooltip` and `LegendArea` handle interactivity

### Key Concepts

- **StackType enum**: Controls how multi-series data is combined — `None`, `Normal`, or `Percent`
- **ScaleType enum**: `Linear`, `Log`, or `Time` — determines axis scale; use `Time` for date-based categories
- **Dual axes**: A `Serie` can set `axis: 'y2'` to bind to a second Y axis
- **Options resolution**: `resolveOptions()` in `core/Options.ts` merges user options with defaults
- **Responsive**: A `ResizeObserver` on the container triggers a full redraw on resize
- **Color palette**: `ColorPalette` cycles through a configurable array of colors, assigned per series

### Module Layout

| Directory | Purpose |
|-----------|---------|
| `src/charts/` | Public chart classes (thin wrappers that wire core together) |
| `src/core/` | Canvas, axes, series, legend, tooltip, options |
| `src/shapes/` | SVG shape renderers — one class per geometry type |
| `src/types/` | All TypeScript interfaces (`interfaces.ts`) and enums (`enums.ts`) |
| `src/utils/` | D3 curve/ease wrappers, DOM helpers, deep merge |
| `test/unit/` | Unit tests for pure logic (Categories, ColorPalette, Options) |
| `test/integration/` | Full chart render tests using jsdom |
| `examples/` | HTML files used in the dev server gallery |

### ESLint Conventions

- Interfaces must be prefixed with `I` (e.g., `IChartData`)
- Classes use PascalCase
- Member ordering: public static → private instance fields → constructor → methods
