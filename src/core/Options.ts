import type { IOptions, IAxisOptions } from "../types/interfaces";
import { GridLineType } from "../types/enums";
import type { MarkerType, OrientationType } from "../types/enums";

/** Fully-resolved axis options with all defaults applied. */
export interface IResolvedAxisOptions {
  gridlines: GridLineType;
  labels: { format: string; rotate: number };
  name: string;
  orient: OrientationType;
  tickmarks: boolean;
  title: { align: string; text: string; valign: string };
}

/** Fully-resolved canvas options with all defaults applied. */
export interface IResolvedCanvasOptions {
  border: { bottom: boolean; left: boolean; right: boolean; top: boolean };
  height: number;
  width: number;
}

/** Fully-resolved legend options with all defaults applied. */
export interface IResolvedLegendOptions {
  border: { bottom: boolean; left: boolean; right: boolean; top: boolean };
  height: number;
  position: OrientationType;
  title: string;
  width: number;
}

/** Fully-resolved plot-area options with all defaults applied. */
export interface IResolvedPlotAreaOptions {
  border: { bottom: boolean; left: boolean; right: boolean; top: boolean };
  padding: number;
}

/** Fully-resolved plot options with all defaults applied. */
export interface IResolvedPlotOptions {
  animation: { duration: number; ease: string };
  area: { visible: boolean; opacity: number };
  bands: { innerPadding: number; outerPadding: number };
  colors: string[];
  line: { interpolation: string };
  markers: { visible: boolean; size: number; type: MarkerType };
  pie: { innerRadius: number };
}

/** Fully-resolved series options with all defaults applied. */
export interface IResolvedSeriesOptions {
  labels: { visible: boolean; format: string; rotate: boolean };
}

/** Fully-resolved title options with all defaults applied. */
export interface IResolvedTitleOptions {
  align: string;
  border: { bottom: boolean; left: boolean; right: boolean; top: boolean };
  height: number;
  margin: number;
  position: string;
  subtitle: string;
  text: string;
}

/** Fully-resolved tooltip options with all defaults applied. */
export interface IResolvedTooltipOptions {
  title: string;
  valueSuffix: string;
  valuePointFormat: string;
}

/**
 * The complete, fully-resolved options object used internally throughout the library.
 * Produced by {@link resolveOptions} from a partial {@link IOptions} input.
 */
export interface IResolvedOptions {
  canvas: IResolvedCanvasOptions;
  title: IResolvedTitleOptions;
  legend: IResolvedLegendOptions;
  plotArea: IResolvedPlotAreaOptions;
  plotOptions: IResolvedPlotOptions;
  series: IResolvedSeriesOptions;
  tooltip: IResolvedTooltipOptions;
  /** One entry per X axis (always at least one element). */
  xAxes: IResolvedAxisOptions[];
  /** One entry per Y axis (always at least one element). */
  yAxes: IResolvedAxisOptions[];
}

// Backward-compatible type aliases so existing imports still resolve
export type ResolvedAxisOptions    = IResolvedAxisOptions;
export type ResolvedCanvasOptions  = IResolvedCanvasOptions;
export type ResolvedLegendOptions  = IResolvedLegendOptions;
export type ResolvedPlotAreaOptions = IResolvedPlotAreaOptions;
export type ResolvedPlotOptions    = IResolvedPlotOptions;
export type ResolvedSeriesOptions  = IResolvedSeriesOptions;
export type ResolvedTitleOptions   = IResolvedTitleOptions;
export type ResolvedTooltipOptions = IResolvedTooltipOptions;
export type ResolvedOptions        = IResolvedOptions;

/**
 * Default color palette — 20 colors that cycle when there are more series than colors.
 * Can be overridden via `plotOptions.colors`.
 */
const DEFAULT_COLORS: string[] = [
  "#5491F6", "#7AC124", "#FFA300", "#129793", "#F16A73",
  "#1B487F", "#FF6409", "#CC0000", "#8E44AD", "#936A4A",
  "#2C5195", "#4B7717", "#D58A02", "#005D5D", "#BD535B",
  "#123463", "#980101", "#D85402", "#622E79", "#60452F"
];

/** Applies defaults to a single raw axis options object. */
function resolveAxis(ax?: IAxisOptions): IResolvedAxisOptions {
  return {
    gridlines: ax?.gridlines ?? GridLineType.None,
    labels: {
      format: ax?.labels?.format ?? "",
      rotate: ax?.labels?.rotate ?? 0
    },
    name: ax?.name ?? "",
    orient: ax?.orient ?? "",
    tickmarks: ax?.tickmarks ?? false,
    title: {
      align: ax?.title?.align ?? "center",
      text: ax?.title?.text ?? "",
      valign: ax?.title?.valign ?? "middle"
    }
  };
}

/**
 * Normalises the `xAxis` / `yAxis` option to an array of resolved axis options.
 * A missing value yields a single default axis; a single object is wrapped in an array.
 */
function resolveAxes(raw?: IAxisOptions | IAxisOptions[]): IResolvedAxisOptions[] {
  if (!raw) {return [resolveAxis()];}
  if (Array.isArray(raw)) {return raw.map(resolveAxis);}
  return [resolveAxis(raw)];
}

/**
 * Converts a partial {@link IOptions} object into a fully-resolved {@link IResolvedOptions}
 * object with all missing fields filled in with their default values.
 *
 * @param options - Optional partial configuration supplied by the chart consumer.
 * @returns A complete options object safe to use internally without null checks.
 */
export function resolveOptions(options?: IOptions): IResolvedOptions {
  const c  = options?.canvas;
  const t  = options?.titleArea;
  const l  = options?.legendArea;
  const pa = options?.plotArea;
  const po = options?.plotOptions;
  const s  = options?.series;
  const tt = options?.tooltip;

  return {
    canvas: {
      border: {
        bottom: c?.border?.bottom ?? false,
        left:   c?.border?.left   ?? false,
        right:  c?.border?.right  ?? false,
        top:    c?.border?.top    ?? false
      },
      height: c?.height ?? 0,
      width:  c?.width  ?? 0
    },
    title: {
      align:  t?.align    ?? "left",
      border: {
        bottom: t?.border?.bottom ?? false,
        left:   t?.border?.left   ?? false,
        right:  t?.border?.right  ?? false,
        top:    t?.border?.top    ?? false
      },
      height:   t?.height   ?? 0,
      margin:   t?.margin   ?? 15,
      position: t?.position ?? "top",
      subtitle: t?.subtitle ?? "",
      text:     t?.text     ?? ""
    },
    legend: {
      border: {
        bottom: l?.border?.bottom ?? false,
        left:   l?.border?.left   ?? false,
        right:  l?.border?.right  ?? false,
        top:    l?.border?.top    ?? false
      },
      height:   l?.height   ?? 0,
      position: l?.position ?? "right",
      title:    l?.title    ?? "",
      width:    l?.width    ?? 0
    },
    plotArea: {
      border: {
        bottom: pa?.border?.bottom ?? false,
        left:   pa?.border?.left   ?? false,
        right:  pa?.border?.right  ?? false,
        top:    pa?.border?.top    ?? false
      },
      padding: pa?.padding ?? 20
    },
    plotOptions: {
      animation: {
        duration: po?.animation?.duration ?? 1000,
        ease:     po?.animation?.ease     ?? "linear"
      },
      area: {
        visible: po?.area?.visible ?? false,
        opacity: po?.area?.opacity ?? 0.4
      },
      bands: {
        innerPadding: po?.bands?.innerPadding ?? 0.5,
        outerPadding: po?.bands?.outerPadding ?? 0.5
      },
      colors: po?.colors ?? DEFAULT_COLORS,
      line: {
        interpolation: po?.line?.interpolation ?? "linear"
      },
      markers: {
        visible: po?.markers?.visible ?? true,
        size:    po?.markers?.size    ?? 6,
        type:    po?.markers?.type    ?? "circle"
      },
      pie: {
        innerRadius: po?.pie?.innerRadius ?? 0
      }
    },
    series: {
      labels: {
        visible: s?.labels?.visible ?? false,
        format:  s?.labels?.format  ?? "",
        rotate:  s?.labels?.rotate  ?? false
      }
    },
    tooltip: {
      title:            tt?.title            ?? "",
      valueSuffix:      tt?.valueSuffix      ?? "",
      valuePointFormat: tt?.valuePointFormat ?? ""
    },
    xAxes: resolveAxes(options?.xAxis),
    yAxes: resolveAxes(options?.yAxis)
  };
}
