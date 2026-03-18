# Install

## Prerequisites

- An IDE with TypeScript support (e.g. VS Code)
- [Node.js](https://nodejs.org/en/) v18 or higher
- A git client, for example, Git Bash

## Install

Install the package and its peer dependency:

```
npm install @frnkclsst/d3charts d3
```

Then include the stylesheet in your HTML:

```html
<link rel="stylesheet" href="node_modules/@frnkclsst/d3charts/dist/css/d3charts.css" />
```

## Usage

Import chart classes as ES modules:

```html
<div id="chart" style="width: 800px; height: 400px; position: relative;"></div>

<script type="module">
  import { LineChart, GridLineType } from "@frnkclsst/d3charts";

  const data = {
    categories: {
      format: "%s",
      data: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"]
    },
    series: [
      { name: "Tokyo",  data: [7.0, 6.9, 9.5, 14.5, 18.2, 21.5] },
      { name: "London", data: [3.9, 4.2, 5.7,  8.5, 11.9, 15.2] }
    ]
  };

  const options = {
    titleArea: { text: "Monthly Average Temperature", height: 50 },
    legendArea: { title: "City", width: 120 },
    yAxis: [{ orient: "left", gridlines: GridLineType.Major, title: { text: "°C" } }],
    xAxis: [{ orient: "bottom" }]
  };

  const chart = new LineChart("#chart", data, options);
  chart.draw();
</script>
```

Or import via a bundler (Vite, webpack, etc.):

```ts
import { LineChart } from "@frnkclsst/d3charts";
import "@frnkclsst/d3charts/dist/css/d3charts.css";
```

## Available chart types

| Class                        | Description                        |
|------------------------------|------------------------------------|
| `LineChart`                  | Line chart                         |
| `StackedLineChart`           | Stacked line chart                 |
| `StackedPercentLineChart`    | 100% stacked line chart            |
| `ColumnChart`                | Column chart                       |
| `StackedColumnChart`         | Stacked column chart               |
| `StackedPercentColumnChart`  | 100% stacked column chart          |
| `BarChart`                   | Bar chart                          |
| `StackedBarChart`            | Stacked bar chart                  |
| `StackedPercentBarChart`     | 100% stacked bar chart             |
| `ScatterChart`               | Scatter / bubble chart             |
| `PieChart`                   | Pie chart                          |
| `DonutChart`                 | Donut chart                        |
| `ComboChart`                 | Combined column + line chart       |

## Develop

1. Open Git Bash
2. Navigate to the folder where you store your git repos
3. Run the following command:

```
git clone https://github.com/frnkclsst/d3charts
```

4. Install dependencies:

```
npm install
```

5. Start the development server:

```
npm run dev
```

The following page will open: `http://localhost:9005/examples/index.html`

## Build

To produce the distributable files in `dist/`:

```
npm run build
```

## Other scripts

| Command             | Description                        |
|---------------------|------------------------------------|
| `npm run dev`       | Start Vite dev server with examples |
| `npm run build`     | Build library with tsup            |
| `npm run test`      | Run unit tests with Vitest         |
| `npm run test:watch`| Run tests in watch mode            |
| `npm run lint`      | Lint TypeScript source files       |
| `npm run typecheck` | Type-check without emitting        |
