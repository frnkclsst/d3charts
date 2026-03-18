# Chart Types

All chart classes are exported from `@frnkclsst/d3charts`.

```ts
import {
  LineChart, StackedLineChart, StackedPercentLineChart,
  ColumnChart, StackedColumnChart, StackedPercentColumnChart,
  BarChart, StackedBarChart, StackedPercentBarChart,
  ScatterChart,
  PieChart, DonutChart,
  ComboChart,
  GridLineType,
} from "@frnkclsst/d3charts";
```

Every chart class follows the same constructor signature:

```ts
new ChartClass(selector: string, data: IChartData, options?: IOptions)
```

Call `.draw()` after constructing to render the chart. Call `.destroy()` before
removing the container from the DOM.

---

## Line charts

A line is drawn per series, optionally with area fill beneath it.

### `LineChart`

Standard line chart.

```js
const chart = new LineChart("#chart", data, {
  plotOptions: {
    area: { visible: false },
    line: { interpolation: "linear" },
    markers: { visible: true, size: 6, type: "circle" }
  }
});
chart.draw();
```

### `StackedLineChart`

Series values are accumulated so each line sits on top of the previous one.

```js
const chart = new StackedLineChart("#chart", data);
chart.draw();
```

### `StackedPercentLineChart`

Like `StackedLineChart` but normalised to 100%. The Y axis shows percentages.

```js
const chart = new StackedPercentLineChart("#chart", data);
chart.draw();
```

### Area charts

There is no separate `AreaChart` class. Enable area fill on any line chart:

```js
const chart = new LineChart("#chart", data, {
  plotOptions: { area: { visible: true, opacity: 0.4 } }
});
```

Combine with `StackedLineChart` for stacked areas, or `StackedPercentLineChart`
for 100% stacked areas.

### Range area charts

Add `min` and `max` arrays to a series (omit `data`). Enable area fill.

```js
const data = {
  categories: { format: "%s", data: ["Jan", "Feb", "Mar"] },
  series: [
    { name: "Temp range", min: [2, 4, 8], max: [9, 14, 22] }
  ]
};
const chart = new LineChart("#chart", data, {
  plotOptions: { area: { visible: true } }
});
```

### Line interpolation options

Set via `plotOptions.line.interpolation`:

| Value | Description |
|-------|-------------|
| `"linear"` (default) | Straight segments between points |
| `"basis"` | B-spline |
| `"cardinal"` | Cardinal spline |
| `"catmull-rom"` | Catmull-Rom spline |
| `"natural"` | Natural cubic spline |
| `"monotone"` / `"monotone-x"` | Monotone cubic (preserves monotonicity) |
| `"step"` | Step function (midpoint) |
| `"step-before"` | Step before each point |
| `"step-after"` | Step after each point |

---

## Column charts

Vertical bars — one per data point per series. Multiple series are grouped
side-by-side within each category band.

### `ColumnChart`

```js
const chart = new ColumnChart("#chart", data, {
  yAxis: { gridlines: GridLineType.Major }
});
chart.draw();
```

### `StackedColumnChart`

Bars stacked to show absolute totals.

```js
const chart = new StackedColumnChart("#chart", data);
chart.draw();
```

### `StackedPercentColumnChart`

Bars stacked and normalised to 100%.

```js
const chart = new StackedPercentColumnChart("#chart", data);
chart.draw();
```

### Range column charts

Supply `min` and `max` instead of `data` in a series. Each column spans the
min–max range rather than growing from zero.

```js
series: [{ name: "Range", min: [2, 5, 8], max: [10, 15, 20] }]
```

---

## Bar charts

Horizontal bars — the transposed equivalent of column charts. The X axis
carries data values and the Y axis carries category labels.

### `BarChart`

```js
const chart = new BarChart("#chart", data, {
  xAxis: { gridlines: GridLineType.Major }
});
chart.draw();
```

### `StackedBarChart`

Bars stacked horizontally to show absolute totals.

### `StackedPercentBarChart`

Bars stacked horizontally and normalised to 100%.

### Range bar charts

Same as range column — supply `min`/`max` in the series.

---

## Scatter / Bubble charts

### `ScatterChart`

Plots points on a two-dimensional linear scale. `series[0]` provides X values;
`series[1..n]` provide Y values.

```js
const data = {
  categories: { format: "%s", data: ["A", "B", "C", "D"] },
  series: [
    { name: "X",       data: [10, 20, 30, 40] },
    { name: "Group 1", data: [5, 15, 25, 35] }
  ]
};
const chart = new ScatterChart("#chart", data);
chart.draw();
```

### Bubble variant

Add a `size` array to Y series. Each value is scaled by ×10 to produce the d3
symbol area.

```js
series: [
  { name: "X", data: [10, 20, 30, 40] },
  { name: "Group 1", data: [5, 15, 25, 35], size: [2, 4, 6, 8] }
]
```

---

## Pie chart

Each series produces one concentric ring of arc slices. The first series is
the innermost ring.

```js
const data = {
  categories: { format: "%s", data: ["North", "East", "South", "West"] },
  series: [
    { name: "2024", data: [30, 25, 20, 25] }
  ]
};
const chart = new PieChart("#chart", data);
chart.draw();
```

### Multiple series (concentric rings)

```js
series: [
  { name: "Inner", data: [30, 25, 20, 25] },
  { name: "Outer", data: [35, 20, 25, 20] }
]
```

---

## Donut chart

`DonutChart` is a `PieChart` with `innerRadius` preset to `0.6`.

```js
const chart = new DonutChart("#chart", data);
chart.draw();
```

You can also configure `innerRadius` manually on a `PieChart`:

```js
const chart = new PieChart("#chart", data, {
  plotOptions: { pie: { innerRadius: 0.4 } }
});
```

> `innerRadius: 0` = full pie (default). Any value between 0 and 1 creates a
> donut hole proportional to the outer radius.

---

## Combo chart

Renders each series as either a column or a line, based on `ISerie.type`.
Columns are drawn first (behind lines).

```js
const data = {
  categories: { format: "%s", data: ["Jan", "Feb", "Mar", "Apr"] },
  series: [
    { name: "Rainfall",    type: "column", data: [50, 70, 40, 90], axis: "R", suffix: " mm" },
    { name: "Temperature", type: "line",   data: [7,  12,  9, 16], axis: "T", suffix: " °C" }
  ]
};

const chart = new ComboChart("#chart", data, {
  yAxis: [
    { name: "R", orient: "left",  title: { text: "Rainfall (mm)" } },
    { name: "T", orient: "right", title: { text: "Temperature (°C)" } }
  ]
});
chart.draw();
```

---

## Dual-axis charts

Any XY chart supports multiple axes by passing an array to `xAxis` or `yAxis`.
Use `axis` on each series to bind it to a named axis.

```js
const options = {
  yAxis: [
    { name: "Rainfall",    orient: "left",  gridlines: GridLineType.Major },
    { name: "Temperature", orient: "right" }
  ]
};

series: [
  { name: "Rainfall",    axis: "Rainfall",    data: [...] },
  { name: "Temperature", axis: "Temperature", data: [...] }
]
```
