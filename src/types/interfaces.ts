import type { GridLineType, MarkerType, OrientationType } from "./enums";

/**
 * Computed data point produced by {@link Series._buildMatrix}.
 * Every value in the series matrix is an `IDatum`.
 */
export interface IDatum {
  /** Absolute maximum of all `|y|` values in the same column (used for % stacking). */
  max: number;
  /** Fractional share of this data point relative to the column total (`y / max`). */
  perc: number;
  /** Running cumulative total up to and including this datum (used for stacking). */
  sum: number;
  /** Raw data value. NaN for range series that supply only `min`/`max`. */
  y: number;
  /** Lower bound of the data range (equals 0 for plain series). */
  y0: number;
  /** Upper bound of the data range (equals `y` for plain series). */
  y1: number;
}

/**
 * Data point produced by d3.pie() — used internally by {@link PieChart}.
 */
export interface IArcDatum {
  /** Original numeric value from the series data array. */
  data: number;
  /** End angle of the arc slice (radians). */
  endAngle: number;
  /** Padding angle between slices (radians). */
  padAngle: number;
  /** Start angle of the arc slice (radians). */
  startAngle: number;
  /** Computed value passed through d3.pie(). */
  value: number;
}

/**
 * Top-level input data object passed to every chart constructor.
 *
 * @example
 * ```ts
 * const data: IChartData = {
 *   categories: { format: "%s", data: ["Q1", "Q2", "Q3"] },
 *   series: [{ name: "Revenue", data: [100, 200, 150] }],
 * };
 * ```
 */
export interface IChartData {
  categories: {
    /**
     * d3 format string that describes how `data` values should be parsed.
     * Use `"%s"` for plain strings (ordinal axis) or a d3 time-format string
     * such as `"%Y-%m-%d"` for date axes.
     */
    format: string;
    /** Array of category labels (one per data point). */
    data: string[];
  };
  series: ISerie[];
}

/**
 * Definition of a single data series.
 *
 * Supply `data` for most chart types, or `min`/`max` for range (band) series.
 * `size` is used by {@link ScatterChart} to control bubble area.
 */
export interface ISerie {
  /** Name of the Y axis this series belongs to. Used for multi-axis charts. */
  axis?: string;
  /** Numeric data values — one per category. */
  data?: number[];
  /** d3 number-format string applied to data labels and tooltips (`d3.format`). */
  format?: string;
  /** Display name shown in the legend and tooltip. */
  name?: string;
  /** Marker shape override for this series (overrides the global `plotOptions.markers.type`). */
  marker?: MarkerType;
  /** Lower-bound values for range (band) series. */
  min?: number[];
  /** Upper-bound values for range (band) series. */
  max?: number[];
  /** Bubble area values for {@link ScatterChart} (scaled ×10 to produce d3 symbol size). */
  size?: number[];
  /** Unit suffix appended to formatted values in tooltips (e.g. `" %"`). */
  suffix?: string;
  /** Series render type used by {@link ComboChart}: `"column"` or `"line"`. */
  type?: string;
}

/**
 * Root options object accepted by every chart constructor.
 * All properties are optional; sensible defaults are applied by {@link resolveOptions}.
 */
export interface IOptions {
  /** SVG canvas dimensions and border visibility. */
  canvas?: ICanvasOptions;
  /** Legend area position, size, and border. */
  legendArea?: ILegendAreaOptions;
  /** Plot area padding and border. */
  plotArea?: IPlotAreaOptions;
  /** Visual rendering options (animation, colors, markers, …). */
  plotOptions?: IPlotOptions;
  /** Data-label options applied to all series. */
  series?: ISeriesOptions;
  /** Title and subtitle options. */
  titleArea?: ITitleAreaOptions;
  /** Tooltip content options. */
  tooltip?: ITooltipOptions;
  /**
   * X axis configuration. Accepts a single object or an array for multi-axis charts.
   * Defaults to a single bottom axis.
   */
  xAxis?: IAxisOptions | IAxisOptions[];
  /**
   * Y axis configuration. Accepts a single object or an array for multi-axis charts.
   * Defaults to a single left axis.
   */
  yAxis?: IAxisOptions | IAxisOptions[];
}

/** Configuration for one chart axis (X or Y). */
export interface IAxisOptions {
  /** Which gridlines to draw across the plot area. Defaults to `GridLineType.None`. */
  gridlines?: GridLineType;
  /** Tick-label formatting options. */
  labels?: {
    /**
     * d3 format string for numeric axes, or d3 time-format string for time axes.
     * Leave empty to use d3's default formatter.
     */
    format?: string;
    /** Rotation angle applied to tick labels (degrees). Defaults to `0`. */
    rotate?: number;
  };
  /** Identifier used to bind a series to this axis via `ISerie.axis`. */
  name?: string;
  /** Where the axis is drawn relative to the plot area. Defaults to `"bottom"` (X) or `"left"` (Y). */
  orient?: OrientationType;
  /** Whether to draw tick marks alongside tick labels. Defaults to `false`. */
  tickmarks?: boolean;
  /** Axis title options. */
  title?: {
    /** Horizontal alignment of the title text: `"left"` | `"center"` | `"right"`. */
    align?: string;
    /** Title label text. */
    text?: string;
    /** Vertical alignment for Y axis titles: `"top"` | `"middle"` | `"bottom"`. */
    valign?: string;
  };
}

/** SVG canvas dimensions and outer border. */
export interface ICanvasOptions {
  /** Which sides of the canvas SVG should have a border line. */
  border?: {
    bottom?: boolean;
    left?: boolean;
    right?: boolean;
    top?: boolean;
  };
  /** Canvas height in pixels. When `0` the container's computed height is used. */
  height?: number;
  /** Canvas width in pixels. When `0` the container's computed width is used. */
  width?: number;
}

/** Legend area dimensions, position, and border. */
export interface ILegendAreaOptions {
  /** Which sides of the legend area should have a border line. */
  border?: {
    bottom?: boolean;
    left?: boolean;
    right?: boolean;
    top?: boolean;
  };
  /** Height of the legend area in pixels (relevant when `position` is `"top"` or `"bottom"`). */
  height?: number;
  /** Where the legend is placed relative to the plot area. Defaults to `"right"`. */
  position?: OrientationType;
  /** Optional title rendered above the legend items. */
  title?: string;
  /** Width of the legend area in pixels. Set to `0` to hide the legend. */
  width?: number;
}

/** Plot area padding and border. */
export interface IPlotAreaOptions {
  /** Which sides of the plot area should have a border line. */
  border?: {
    bottom?: boolean;
    left?: boolean;
    right?: boolean;
    top?: boolean;
  };
  /** Padding in pixels applied inside the plot area on all sides. Defaults to `20`. */
  padding?: number;
}

/** Visual rendering options shared by all chart types. */
export interface IPlotOptions {
  /** Enter animation settings. */
  animation?: {
    /** Duration of the enter animation in milliseconds. Defaults to `1000`. */
    duration?: number;
    /**
     * d3 easing function name: `"linear"` | `"cubic"` | `"elastic"` | `"bounce"` |
     * `"back"` | `"sin"` | `"exp"` | `"circle"` | `"quad"`. Defaults to `"linear"`.
     */
    ease?: string;
  };
  /** Area fill shown beneath line chart series. */
  area?: {
    /** Whether to draw the filled area. Defaults to `false`. */
    visible?: boolean;
    /** Fill opacity (0–1). Defaults to `0.4`. */
    opacity?: number;
  };
  /** Inner/outer padding for band (ordinal) scales. */
  bands?: {
    /** Padding between bands as a fraction of the band width (0–1). Defaults to `0.5`. */
    innerPadding?: number;
    /** Padding at the outer edges of the scale (0–1). Defaults to `0.5`. */
    outerPadding?: number;
  };
  /**
   * Ordered list of hex/CSS color strings used to paint series.
   * Cycles automatically when there are more series than colors.
   */
  colors?: string[];
  /** Line interpolation options. */
  line?: {
    /**
     * d3 curve name: `"linear"` | `"basis"` | `"cardinal"` | `"catmull-rom"` |
     * `"natural"` | `"monotone"` | `"monotone-x"` | `"step"` | `"step-before"` |
     * `"step-after"`. Defaults to `"linear"`.
     */
    interpolation?: string;
  };
  /** Data-point marker options for line and scatter charts. */
  markers?: {
    /** Whether to draw markers at each data point. Defaults to `true`. */
    visible?: boolean;
    /** Marker size (scaled ×10 to produce the d3 symbol size). Defaults to `6`. */
    size?: number;
    /**
     * Marker shape, or `"mixed"` to cycle through all available shapes.
     * Defaults to `"circle"`.
     */
    type?: MarkerType;
  };
  /** Pie/donut chart options. */
  pie?: {
    /**
     * Inner radius as a fraction of the outer radius (0–1).
     * `0` = full pie, `> 0` = donut. Defaults to `0`.
     */
    innerRadius?: number;
  };
  /** Spider/radar chart options. */
  spider?: {
    /** Shape of the concentric gridlines. Defaults to `"circle"`. */
    gridlines?: "circle" | "polygon";
    /** Number of concentric gridline rings. Defaults to `5`. */
    levels?: number;
  };
  /** Heatmap chart options. */
  heatmap?: {
    /**
     * Two-stop color range for the sequential cell color scale: `[lowColor, highColor]`.
     * Defaults to `["#f7fbff", "#084594"]` (white to dark blue).
     */
    colorRange?: [string, string];
  };
}

/** Data-label options applied uniformly to all series. */
export interface ISeriesOptions {
  labels?: {
    /** Whether to render data labels next to each data point. Defaults to `false`. */
    visible?: boolean;
    /** d3 number-format string for label values. Defaults to the series `format`. */
    format?: string;
    /** Rotate labels 90° (useful for narrow columns). Defaults to `false`. */
    rotate?: boolean;
  };
}

/** Title area text, position, and border. */
export interface ITitleAreaOptions {
  /** Horizontal alignment of the title: `"left"` | `"center"` | `"right"`. Defaults to `"left"`. */
  align?: string;
  /** Which sides of the title area should have a border line. */
  border?: {
    bottom?: boolean;
    left?: boolean;
    right?: boolean;
    top?: boolean;
  };
  /** Height of the title area in pixels. Set to `0` to hide the title area. */
  height?: number;
  /** Left/right margin applied before horizontal alignment is calculated. Defaults to `15`. */
  margin?: number;
  /** Whether the title appears at the `"top"` or `"bottom"` of the canvas. Defaults to `"top"`. */
  position?: string;
  /** Optional subtitle rendered below the main title. */
  subtitle?: string;
  /** Main title text. */
  text?: string;
}

/** Tooltip content customisation. */
export interface ITooltipOptions {
  /** Fixed title shown at the top of every tooltip. Defaults to `""`. */
  title?: string;
  /**
   * Unit suffix appended after every formatted data value in the tooltip.
   * Falls back to the individual series `suffix` when not set.
   */
  valueSuffix?: string;
  /**
   * d3 number-format string applied to data values in the tooltip.
   * Falls back to the individual series `format` when not set.
   */
  valuePointFormat?: string;
}
