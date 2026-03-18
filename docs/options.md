# Options Reference

All options are optional. The chart applies sensible defaults when properties
are omitted.

```ts
const options: IOptions = {
  canvas?:      ICanvasOptions;
  titleArea?:   ITitleAreaOptions;
  legendArea?:  ILegendAreaOptions;
  plotArea?:    IPlotAreaOptions;
  plotOptions?: IPlotOptions;
  series?:      ISeriesOptions;
  tooltip?:     ITooltipOptions;
  xAxis?:       IAxisOptions | IAxisOptions[];
  yAxis?:       IAxisOptions | IAxisOptions[];
};
```

---

## canvas

Controls the outer SVG dimensions and border.

```ts
canvas?: {
  height?: number;   // default: 0 (uses container height)
  width?:  number;   // default: 0 (uses container width)
  border?: {
    top?:    boolean;  // default: false
    right?:  boolean;  // default: false
    bottom?: boolean;  // default: false
    left?:   boolean;  // default: false
  };
}
```

| Property | Default | Description |
|----------|---------|-------------|
| `height` | `0` | Canvas height in pixels. `0` means use the container's computed height. |
| `width` | `0` | Canvas width in pixels. `0` means use the container's computed width. |
| `border.*` | `false` | Show a border line on the given side. |

> Sizing the container via CSS is recommended. `canvas.height/width` are only
> used when the container has no intrinsic size.

---

## titleArea

```ts
titleArea?: {
  text?:     string;  // default: ""
  subtitle?: string;  // default: ""
  align?:    "left" | "center" | "right";  // default: "left"
  position?: "top" | "bottom";             // default: "top"
  height?:   number;  // default: 0 (title area hidden when 0)
  margin?:   number;  // default: 15
  border?: {
    top?: boolean; right?: boolean; bottom?: boolean; left?: boolean;
  };
}
```

| Property | Default | Description |
|----------|---------|-------------|
| `text` | `""` | Main title text. |
| `subtitle` | `""` | Secondary text below the title. |
| `align` | `"left"` | Horizontal alignment of the title text. |
| `position` | `"top"` | Whether the title area appears above or below the chart. |
| `height` | `0` | Height of the title area in pixels. Set to a value like `50` to show the title. |
| `margin` | `15` | Left/right margin offset before alignment is applied. |

```js
titleArea: {
  text:     "Monthly Temperature",
  subtitle: "Source: Wikipedia",
  align:    "center",
  height:   60
}
```

---

## legendArea

```ts
legendArea?: {
  title?:    string;            // default: ""
  position?: OrientationType;  // default: "right"
  width?:    number;            // default: 0 (legend hidden when 0)
  height?:   number;            // default: 0
  border?: {
    top?: boolean; right?: boolean; bottom?: boolean; left?: boolean;
  };
}
```

| Property | Default | Description |
|----------|---------|-------------|
| `title` | `""` | Optional heading above the legend items. |
| `position` | `"right"` | Where the legend sits: `"right"`, `"left"`, `"top"`, `"bottom"`. |
| `width` | `0` | Legend area width in pixels. Set to e.g. `150` to show the legend. Width `0` hides it. |
| `height` | `0` | Legend area height in pixels (relevant when `position` is `"top"` or `"bottom"`). |

```js
legendArea: {
  title:    "Region",
  position: "right",
  width:    150
}
```

---

## plotArea

```ts
plotArea?: {
  padding?: number;  // default: 20
  border?: {
    top?: boolean; right?: boolean; bottom?: boolean; left?: boolean;
  };
}
```

| Property | Default | Description |
|----------|---------|-------------|
| `padding` | `20` | Uniform padding in pixels inside the plot area (applied to all four sides). |

```js
plotArea: { padding: 30 }
```

---

## plotOptions

### animation

```ts
animation?: {
  duration?: number;  // default: 1000
  ease?:     string;  // default: "linear"
}
```

| Property | Default | Description |
|----------|---------|-------------|
| `duration` | `1000` | Enter animation duration in milliseconds. Set to `0` to disable. |
| `ease` | `"linear"` | Easing function name. |

Supported `ease` values:

| Value | Effect |
|-------|--------|
| `"linear"` (default) | Constant speed |
| `"quad"` | Quadratic ease-in-out |
| `"cubic"` | Cubic ease-in-out |
| `"sin"` | Sinusoidal |
| `"exp"` | Exponential |
| `"circle"` | Circular |
| `"elastic"` | Elastic overshoot |
| `"back"` | Overshoots and retracts |
| `"bounce"` | Bouncing at the end |

### area

Controls the filled area beneath line series.

```ts
area?: {
  visible?: boolean;  // default: false
  opacity?: number;   // default: 0.4
}
```

| Property | Default | Description |
|----------|---------|-------------|
| `visible` | `false` | Draw a filled area below each line. |
| `opacity` | `0.4` | Fill opacity (0 = transparent, 1 = opaque). |

### bands

Controls padding for ordinal (band) X scales used by column and bar charts.

```ts
bands?: {
  innerPadding?: number;  // default: 0.5
  outerPadding?: number;  // default: 0.5
}
```

| Property | Default | Description |
|----------|---------|-------------|
| `innerPadding` | `0.5` | Fraction of the band width reserved as gap between bands (0–1). |
| `outerPadding` | `0.5` | Fraction of the band width reserved as gap at the outer edges (0–1). |

### colors

```ts
colors?: string[];
```

Ordered list of CSS color strings. Cycles automatically when there are more
series than colors. Defaults to a 20-color palette.

```js
plotOptions: {
  colors: ["#E74C3C", "#3498DB", "#2ECC71", "#F39C12"]
}
```

### line

```ts
line?: {
  interpolation?: string;  // default: "linear"
}
```

Controls the curve used to draw line and area shapes. See the
[interpolation table](./chart-types.md#line-interpolation-options) in Chart Types.

### markers

Data-point marker options for line and scatter charts.

```ts
markers?: {
  visible?: boolean;    // default: true
  size?:    number;     // default: 6
  type?:    MarkerType; // default: "circle"
}
```

| Property | Default | Description |
|----------|---------|-------------|
| `visible` | `true` | Draw markers at each data point. |
| `size` | `6` | Marker size (multiplied by 10 to produce d3 symbol area). |
| `type` | `"circle"` | Marker shape. |

Supported `type` values: `"circle"` | `"cross"` | `"diamond"` | `"square"` |
`"triangle-up"` | `"triangle-down"` | `"mixed"`

`"mixed"` cycles through all shapes — useful for distinguishing series without
relying on colour alone.

Individual series can override the marker type via `ISerie.marker`.

### pie

```ts
pie?: {
  innerRadius?: number;  // default: 0
}
```

| Property | Default | Description |
|----------|---------|-------------|
| `innerRadius` | `0` | Fraction of the outer radius cut out as the donut hole (0–1). `0` = full pie. `0.6` is a typical donut. |

> Use the `DonutChart` class as a convenient alternative to setting `innerRadius` manually.

---

## series

Options applied uniformly to data labels across all series.

```ts
series?: {
  labels?: {
    visible?: boolean;  // default: false
    format?:  string;   // default: "" (uses each series' own format)
    rotate?:  boolean;  // default: false
  };
}
```

| Property | Default | Description |
|----------|---------|-------------|
| `labels.visible` | `false` | Render value labels at each data point. |
| `labels.format` | `""` | d3-format string overriding the series `format` for labels. |
| `labels.rotate` | `false` | Rotate labels 90° (useful for narrow column charts). |

```js
series: {
  labels: { visible: true, format: ".1f", rotate: false }
}
```

---

## tooltip

```ts
tooltip?: {
  title?:            string;  // default: ""
  valueSuffix?:      string;  // default: ""
  valuePointFormat?: string;  // default: "" (uses each series' format)
}
```

| Property | Default | Description |
|----------|---------|-------------|
| `title` | `""` | Fixed heading shown at the top of every tooltip. |
| `valueSuffix` | `""` | Unit text appended to every value in the tooltip (e.g. `" mm"`). Falls back to each series' `suffix`. |
| `valuePointFormat` | `""` | d3-format string for tooltip values. Falls back to each series' `format`. |

```js
tooltip: {
  title:       "Monthly Data",
  valueSuffix: " °C"
}
```

---

## xAxis / yAxis

Axis configuration. Accepts a single object or an array for multi-axis charts.

```ts
xAxis?: IAxisOptions | IAxisOptions[];
yAxis?: IAxisOptions | IAxisOptions[];
```

```ts
import { GridLineType } from "@frnkclsst/d3charts";

interface IAxisOptions {
  name?:       string;
  orient?:     OrientationType;
  gridlines?:  GridLineType;
  tickmarks?:  boolean;
  labels?: {
    format?: string;
    rotate?: number;
  };
  title?: {
    text?:   string;
    align?:  "left" | "center" | "right";
    valign?: "top" | "middle" | "bottom";
  };
}
```

| Property | Default | Description |
|----------|---------|-------------|
| `name` | `""` | Axis identifier. Used to bind series via `ISerie.axis` in multi-axis charts. |
| `orient` | `"bottom"` (X) or `"left"` (Y) | Axis position: `"top"`, `"bottom"`, `"left"`, or `"right"`. |
| `gridlines` | `GridLineType.None` | `GridLineType.None` = no gridlines; `GridLineType.Major` = one line per major tick. |
| `tickmarks` | `false` | Draw tick marks at each label. |
| `labels.format` | `""` | d3-format or d3-time-format string for tick labels. |
| `labels.rotate` | `0` | Rotation angle in degrees for tick labels. |
| `title.text` | `""` | Axis title label. |
| `title.align` | `"center"` | Horizontal alignment of the axis title. |
| `title.valign` | `"middle"` | Vertical alignment for Y axis titles: `"top"`, `"middle"`, `"bottom"`. |

### Single axis

```js
yAxis: {
  gridlines: GridLineType.Major,
  title: { text: "Revenue (USD)" }
}
```

### Multiple axes

```js
yAxis: [
  { name: "Rainfall",    orient: "left",  gridlines: GridLineType.Major, title: { text: "mm" } },
  { name: "Temperature", orient: "right", title: { text: "°C" } }
]
```

Bind each series to its axis by name:

```js
series: [
  { name: "Rainfall",    axis: "Rainfall",    data: [...] },
  { name: "Temperature", axis: "Temperature", data: [...] }
]
```
