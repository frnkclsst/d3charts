"use strict";

import { OrientationType, MarkerType } from "./Enums";
import { Serie } from "./Serie";

export interface IDatum {
    max: number;
    perc: number;
    sum: number;
    y: number;
    y0: number;
    y1: number;
}

export interface IArcDatum {
    data: number;
    endAngle: number;
    padAngle: number;
    startAngle: number;
    value: number;
}

export interface IChartData {
    categories: {
        format: string,
        data: string[]
    };
    series: Serie[];
}

export interface ISerie {
    axis: string;
    data: number[];
    format: string;
    name: string;
    marker: MarkerType;
    min: number[];
    max: number[];
    size: number[];
    suffix: string;
    type: string;
}

export interface IOptions {
    canvas?: ICanvasOptions;
    legendArea?: ILegendAreaOptions;
    plotArea?: IPlotAreaOptions;
    plotOptions?: IPlotOptions;
    series?: ISeriesOptions;
    title?: ITitleAreaOptions;
    titleArea?: ITitleAreaOptions;
    tooltip?: { title: string };
    xAxis?: IAxisOptions[];
    yAxis?: IAxisOptions[];

    getValue?(propStr: string, defaultValue?: string): any;
}

export interface IAxisOptions {
    gridlines: string;
    labels: {
        format?: string;
        rotate: number;
    };
    name?: string;
    orient: OrientationType;
    tickmarks: boolean;
    title: {
        align?: string;
        text: string;
        valign?: string;
    };
}

export interface ICanvasOptions {
    border?: {
        bottom?: boolean,
        left?: boolean,
        right?: boolean,
        top?: boolean
    };
    height?: number;
    width?: number;
}

export interface ILegendAreaOptions {
    border?: {
        bottom?: boolean,
        left?: boolean,
        right?: boolean,
        top?: boolean
    };
    height?: number;
    position?: OrientationType;
    title?: string;
    width?: number;
}

export interface IPlotAreaOptions {
    border: {
        bottom: boolean,
        left: boolean,
        right: boolean,
        top: boolean
    };
    padding: number;
}

export interface IPlotOptions {
    animation: {
        duration: number;
        ease: string;
    };
    area: {
        visible: boolean;
        opacity: number;
    };
    bands: {
        innerPadding: number;
        outerPadding: number;
    };
    colors?: string[];
    line: {
        interpolation: string;
    };
    markers: {
        visible: boolean,
        size: number,
        type: MarkerType
    };
    pie: {
        innerRadius: number;
    };
}

export interface ISeriesOptions {
    labels: {
        visible: boolean,
        format: string,
        rotate: boolean
    };
    [index: string]: {
        visible?: boolean,
        format: string,
        rotate?: boolean
    };
}

export interface ITitleAreaOptions {
    align: string;
    border: {
        bottom: boolean,
        left: boolean,
        right: boolean,
        top: boolean
    };
    height: number;
    position: string;
    margin: number;
    subtitle: string;
    text: string;
}
