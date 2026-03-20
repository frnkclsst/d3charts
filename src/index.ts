// @frnkclsst/d3charts — public API

// Types
export type {
  IChartData,
  ISerie,
  IOptions,
  IAxisOptions,
  ICanvasOptions,
  ILegendAreaOptions,
  IPlotAreaOptions,
  IPlotOptions,
  ISeriesOptions,
  ITitleAreaOptions,
  ITooltipOptions,
  IDatum,
  IArcDatum
} from "./types/interfaces";

export {
  AxisType,
  GridLineType,
  ScaleType,
  StackType,
  SymbolTypes
} from "./types/enums";
export type { MarkerType, OrientationType } from "./types/enums";

// Chart classes
export { LineChart, StackedLineChart, StackedPercentLineChart } from "./charts/LineChart";
export { ColumnChart, StackedColumnChart, StackedPercentColumnChart } from "./charts/ColumnChart";
export { BarChart, StackedBarChart, StackedPercentBarChart } from "./charts/BarChart";
export { ScatterChart } from "./charts/ScatterChart";
export { PieChart, DonutChart } from "./charts/PieChart";
export { ComboChart } from "./charts/ComboChart";
export { SpiderChart } from "./charts/SpiderChart";
export { HeatmapChart } from "./charts/HeatmapChart";

// Core (for advanced consumers / extension)
export { Chart }      from "./charts/Chart";
export { CartesianChart } from "./charts/CartesianChart";
export { Series }     from "./core/Series";
export { Serie }      from "./core/Serie";
export { Categories } from "./core/Categories";
export { ColorPalette } from "./core/ColorPalette";
