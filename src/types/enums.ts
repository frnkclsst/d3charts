/** Identifies whether an axis is horizontal (X) or vertical (Y). */
export const AxisTypes = { X: "x", Y: "y" } as const;
export type AxisType = typeof AxisTypes[keyof typeof AxisTypes];

/** d3 curve factory name used for line and area interpolation. */
export const CurveTypes = {
  Linear:     "linear",
  Basis:      "basis",
  Cardinal:   "cardinal",
  CatmullRom: "catmull-rom",
  Natural:    "natural",
  Monotone:   "monotone",
  MonotoneX:  "monotone-x",
  Step:       "step",
  StepBefore: "step-before",
  StepAfter:  "step-after"
} as const;
export type CurveType = typeof CurveTypes[keyof typeof CurveTypes];

/** d3 easing function name used for enter animations. */
export const EaseTypes = {
  Linear:  "linear",
  Cubic:   "cubic",
  Elastic: "elastic",
  Bounce:  "bounce",
  Back:    "back",
  Sin:     "sin",
  Exp:     "exp",
  Circle:  "circle",
  Quad:    "quad"
} as const;
export type EaseType = typeof EaseTypes[keyof typeof EaseTypes];

/** Controls which gridlines are drawn across the plot area. */
export const GridLineTypes = {
  /** No gridlines. */
  None:  "none",
  /** One gridline per major tick. */
  Major: "major",
  /** One gridline per minor tick. */
  Minor: "minor"
} as const;
export type GridLineType = typeof GridLineTypes[keyof typeof GridLineTypes];

/** Shape of a data-point marker on line and scatter charts. */
export const MarkerTypes = {
  Circle:       "circle",
  Cross:        "cross",
  Diamond:      "diamond",
  Square:       "square",
  TriangleUp:   "triangle-up",
  TriangleDown: "triangle-down",
  Mixed:        "mixed"
} as const;
export type MarkerType = typeof MarkerTypes[keyof typeof MarkerTypes];

/** Placement of an axis or legend area relative to the chart. */
export const OrientationTypes = {
  Bottom: "bottom",
  Left:   "left",
  Right:  "right",
  Top:    "top",
  None:   ""
} as const;
export type OrientationType = typeof OrientationTypes[keyof typeof OrientationTypes];

/** The scale used to map data values to pixel coordinates. */
export const ScaleTypes = {
  /** Continuous numeric scale (d3.scaleLinear). */
  Linear:  "linear",
  /** Discrete band scale for categorical data (d3.scaleBand). */
  Ordinal: "ordinal",
  /** Continuous time scale (d3.scaleTime). */
  Time:    "time"
} as const;
export type ScaleType = typeof ScaleTypes[keyof typeof ScaleTypes];

/** Render type of a series within a {@link ComboChart}. */
export const SeriesTypes = {
  Column: "column",
  Line:   "line",
  None:   ""
} as const;
export type SeriesType = typeof SeriesTypes[keyof typeof SeriesTypes];

/** Shape of the concentric gridline rings on a spider/radar chart. */
export const SpiderGridlineTypes = {
  Circle:  "circle",
  Polygon: "polygon"
} as const;
export type SpiderGridlineType = typeof SpiderGridlineTypes[keyof typeof SpiderGridlineTypes];

/** Controls how multiple series are combined in a chart. */
export const StackTypes = {
  /** Series drawn side-by-side (no stacking). */
  None:    "none",
  /** Series stacked to show absolute totals. */
  Normal:  "normal",
  /** Series stacked and normalised to 100 %. */
  Percent: "percent"
} as const;
export type StackType = typeof StackTypes[keyof typeof StackTypes];

/**
 * Ordered list of all non-"mixed" marker types.
 * Used to cycle through shapes when `markers.type === "mixed"`.
 */
export const SymbolTypes: MarkerType[] = [
  MarkerTypes.Circle,
  MarkerTypes.Cross,
  MarkerTypes.Diamond,
  MarkerTypes.Square,
  MarkerTypes.TriangleUp,
  MarkerTypes.TriangleDown
];
