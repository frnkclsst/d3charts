/// <reference path="_References.ts" />

"use strict";

module frnk.UI.Charts {

    export interface IData {
        categories: {
            format: string,
            data: any[]
        };
        series: Serie[];
    }

    export interface IOptions {
        canvas?: ICanvasOptions;
        legend?: ILegendAreaOptions;
        plotArea?: IPlotAreaOptions;
        series?: ISeriesOptions;
        title?: ITitleAreaOptions;
        xAxes?: IAxisOptions[];
        yAxes?: IAxisOptions[];

        getValue(propStr: string, defaultValue?: string): any;
    }

    export interface IAxisOptions {
        gridlines: string;
        labels: {
            format: string;
            rotate: number;
        };
        name: string;
        orient: OrientationType;
        tickmarks: boolean;
        title: {
            align: string;
            text: string;
            valign: string;
        };
    }

    export interface ICanvasOptions {
        height: number;
        width: number;
    }

    export interface ILegendAreaOptions {
        height: number;
        position: string;
        title: string;
        width: number;
    }

    export interface IPlotAreaOptions {
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
        colors: string[];
        line: {
            interpolation: string;
        };
        markers: {
            visible: boolean,
            size: number,
            type: MarkerType
        };
        padding: number;
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
    }

    export interface ITitleAreaOptions {
        align: string;
        height: number;
        position: string;
        margin: number;
        subtitle: string;
        text: string;
    }
}