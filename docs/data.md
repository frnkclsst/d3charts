# Data Format

Every chart constructor takes an `IChartData` object as its second argument.

```ts
interface IChartData {
  categories: {
    format: string;
    data: string[];
  };
  series: ISerie[];
}
```

---

## categories

Defines the labels that drive the X axis (or Y axis for bar charts).

### `categories.format`

Controls how category labels are interpreted.

| Value | Meaning | X-axis scale |
|-------|---------|--------------|
| `"%s"` | Plain strings / ordinal labels | Band (ordinal) scale |
| d3 time-format, e.g. `"%Y-%m-%d"` | Date strings | Time scale |

> **Note:** Numeric categories are not supported. Use `"%s"` and provide
> numbers as strings (`"1"`, `"2"`, …) for a categorical axis, or use a
> time-format string for a time axis.

### `categories.data`

An array of string labels — one per data point. All series must have the same
number of values as there are labels.

```js
categories: {
  format: "%s",
  data: ["Q1", "Q2", "Q3", "Q4"]
}
```

```js
categories: {
  format: "%Y-%m-%d",
  data: ["2024-01-01", "2024-04-01", "2024-07-01", "2024-10-01"]
}
```

---

## series

An array of `ISerie` objects. Each series becomes one line, set of columns, set
of bars, etc.

```ts
interface ISerie {
  name?:   string;
  data?:   number[];
  min?:    number[];
  max?:    number[];
  size?:   number[];
  format?: string;
  suffix?: string;
  marker?: MarkerType;
  axis?:   string;
  type?:   string;   // ComboChart only
}
```

### `name`

Display name shown in the legend and tooltip.

```js
{ name: "Revenue", data: [100, 200, 150] }
```

### `data`

Array of numeric values — one per category. Used by all chart types except
range series. May contain `null` or `NaN` for missing values.

### `min` / `max`

Use instead of (or alongside) `data` for **range** (band) series. Both arrays
must have the same length as `categories.data`.

```js
{
  name: "Temperature range",
  min: [2, 4,  8, 15],
  max: [9, 14, 22, 28]
}
```

Range series work in `ColumnChart`, `BarChart`, and `LineChart` (with
`plotOptions.area.visible: true`).

### `size`

Array of bubble-size values for `ScatterChart`. Each value is multiplied by 10
to produce the d3 symbol area. If omitted, all bubbles render at the default
marker size.

```js
{
  name: "Group A",
  data: [30, 50, 20, 80],
  size: [3, 5, 2, 8]
}
```

### `format`

A [d3-format](https://d3js.org/d3-format) string applied to this series' values
in data labels and the tooltip. Examples:

| Format | Result |
|--------|--------|
| `".1f"` | `3.5` |
| `".0%"` | `35%` |
| `",.0f"` | `1,234` |
| `"$.2f"` | `$1.23` |

### `suffix`

Text appended after the formatted value in the tooltip, e.g. `" mm"` or `" °C"`.

### `marker`

Per-series marker shape override. Accepted values:

`"circle"` | `"cross"` | `"diamond"` | `"square"` | `"triangle-up"` | `"triangle-down"` | `"mixed"`

Overrides `plotOptions.markers.type` for this series only.

### `axis`

Binds this series to a named axis. Used in dual-axis charts where `xAxis` or
`yAxis` is an array with named entries.

```js
// Options
yAxis: [
  { name: "Rainfall",    orient: "left" },
  { name: "Temperature", orient: "right" }
]

// Series
series: [
  { name: "Rainfall",    axis: "Rainfall",    data: [...] },
  { name: "Temperature", axis: "Temperature", data: [...] }
]
```

### `type` (ComboChart only)

Controls how this series is rendered in a `ComboChart`. Must be `"column"` or
`"line"`. Series without a `type` are skipped.

```js
series: [
  { name: "Revenue", type: "column", data: [100, 200, 150] },
  { name: "Target",  type: "line",   data: [120, 180, 160] }
]
```

---

## ScatterChart data format

`ScatterChart` treats `series[0]` as the X-value series (not rendered, not
shown in legend). All subsequent series are Y-value groups.

```js
const data = {
  categories: { format: "%s", data: ["A", "B", "C", "D"] },
  series: [
    { name: "X",       data: [10, 20, 30, 40] },              // X values
    { name: "Group 1", data: [5, 15, 25, 35], size: [2, 4, 6, 8] },
    { name: "Group 2", data: [8, 12, 22, 30], size: [3, 3, 5, 7] }
  ]
};
```

---

## PieChart / DonutChart data format

Each series produces one concentric ring. The first series is the innermost
ring. Use `data` values; `categories.data` provides the slice labels.

```js
const data = {
  categories: {
    format: "%s",
    data: ["North", "East", "South", "West"]
  },
  series: [
    { name: "2023", data: [30, 25, 20, 25] },
    { name: "2024", data: [35, 20, 25, 20] }
  ]
};
```
