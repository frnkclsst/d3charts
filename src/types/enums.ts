/** Identifies whether an axis is horizontal (X) or vertical (Y). */
export enum AxisType {
  X,
  Y,
}

/** Controls which gridlines are drawn across the plot area. */
export enum GridLineType {
  /** No gridlines. */
  None,
  /** One gridline per major tick. */
  Major,
  /** One gridline per minor tick. */
  Minor,
}

/** The scale used to map data values to pixel coordinates. */
export enum ScaleType {
  /** Continuous numeric scale (d3.scaleLinear). */
  Linear,
  /** Discrete band scale for categorical data (d3.scaleBand). */
  Ordinal,
  /** Continuous time scale (d3.scaleTime). */
  Time,
}

/** Controls how multiple series are combined in a chart. */
export enum StackType {
  /** Series drawn side-by-side (no stacking). */
  None,
  /** Series stacked to show absolute totals. */
  Normal,
  /** Series stacked and normalised to 100 %. */
  Percent,
}

/** Shape of a data-point marker on line and scatter charts. */
export type MarkerType =
  | "circle"
  | "cross"
  | "diamond"
  | "square"
  | "triangle-up"
  | "triangle-down"
  | "mixed";

/** Placement of an axis or legend area relative to the chart. */
export type OrientationType = "bottom" | "left" | "right" | "top" | "";

/**
 * Ordered list of all non-"mixed" marker types.
 * Used to cycle through shapes when `markers.type === "mixed"`.
 */
export const SymbolTypes: MarkerType[] = [
  "circle",
  "cross",
  "diamond",
  "square",
  "triangle-up",
  "triangle-down"
];
