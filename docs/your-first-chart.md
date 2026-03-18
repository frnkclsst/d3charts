# Your First Chart

This guide walks you through creating a line chart from scratch.

## 1. Add a container element

Add a `<div>` to your HTML with explicit dimensions. The chart fills the container automatically.

```html
<div id="chart" style="width: 700px; height: 300px;"></div>
```

> The container must exist in the DOM before the chart is instantiated.

## 2. Include the stylesheet

```html
<link rel="stylesheet" href="node_modules/@frnkclsst/d3charts/dist/css/d3charts.css" />
```

## 3. Define your data

All charts take an `IChartData` object with two required properties:

- `categories` — the labels on the X axis
- `series` — one or more data series

```js
const data = {
  categories: {
    format: "%s",
    data: ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
           "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  },
  series: [
    { name: "Tokyo",    data: [7.0, 6.9,  9.5, 14.5, 18.2, 21.5, 25.2, 26.5, 23.3, 18.3, 13.9,  9.6] },
    { name: "New York", data: [-0.2, 0.8, 5.7, 11.3, 17.0, 22.0, 24.8, 24.1, 20.1, 14.1,  8.6,  2.5] },
    { name: "Berlin",   data: [-0.9, 0.6, 3.5,  8.4, 13.5, 17.0, 18.6, 17.9, 14.3,  9.0,  3.9,  1.0] },
    { name: "London",   data: [3.9, 4.2,  5.7,  8.5, 11.9, 15.2, 17.0, 16.6, 14.2,  9.1,  6.8,  4.0] }
  ]
};
```

## 4. Instantiate and draw the chart

### Via ES module (recommended)

```html
<script type="module">
  import { LineChart } from "@frnkclsst/d3charts";

  const chart = new LineChart("#chart", data);
  chart.draw();
</script>
```

### Via bundler (Vite, webpack, etc.)

```ts
import { LineChart } from "@frnkclsst/d3charts";
import "@frnkclsst/d3charts/dist/css/d3charts.css";

const chart = new LineChart("#chart", data);
chart.draw();
```

### Via browser IIFE bundle (no build step)

```html
<script src="node_modules/@frnkclsst/d3charts/dist/d3charts.iife.js"></script>
<script>
  const chart = new D3Charts.LineChart("#chart", data);
  chart.draw();
</script>
```

## 5. Add options (optional)

The third argument to every chart constructor is an optional configuration object:

```js
import { LineChart, GridLineType } from "@frnkclsst/d3charts";

const options = {
  titleArea: {
    text: "Monthly Average Temperature",
    height: 50
  },
  legendArea: {
    title: "City",
    width: 120
  },
  yAxis: {
    gridlines: GridLineType.Major,
    title: { text: "°C" }
  },
  plotOptions: {
    markers: { visible: true, type: "circle" }
  }
};

const chart = new LineChart("#chart", data, options);
chart.draw();
```

See the [Options Reference](./options.md) for all available properties.

## 6. Destroy the chart

When removing a chart from the DOM (e.g. in a SPA), call `destroy()` to disconnect the resize observer and clean up the SVG:

```js
chart.destroy();
```

## Responsive behaviour

Charts automatically redraw when the container is resized. No extra configuration is needed — a `ResizeObserver` is set up in the constructor.
