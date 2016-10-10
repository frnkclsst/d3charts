/// <reference path="_References.ts" />

"use strict";

module frnk.UI.Charts {

    export interface IData {
        categories: {
            format: string,
            data: any[]
        };
        series: {
            items: Serie[];
        };
    }

    export interface IOptions {
        canvas?: ICanvasOptions;
        columnchart?: IColumnChartOptions;
        data?: IData;
        legend?: ILegendAreaOptions;
        linechart?: ILineChartOptions;
        piechart?: IPieChartOptions;
        plotArea?: PlotAreaOptions;
        title?: ITitleAreaOptions;
        xAxes?: IAxisOptions;
        yAxes?: IAxisOptions;

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

    export interface IColumnChartOptions {

    }

    export interface ILegendAreaOptions {
        height: number;
        position: string;
        title: string;
        width: number;
    }

    export interface ILineChartOptions {
        area: {
            visible: boolean;
            opacity: number;
        };
        interpolation: string;
        markers: {
            visible: boolean,
            size: number,
            type: MarkerType
        };
    }

    export interface IPlotAreaOptions {
        innerPadding: number;
        outerPadding: number;
        padding: number;
    }

    export interface IPieChartOptions {
        innerRadius: number;
    }

    export interface ISeriesOptions {
        animate: boolean;
        labels: {
            visible: boolean,
            format: string,
            rotate: boolean
        };
    }

    export interface ITitleAreaOptions {
        align: string;
        height: number;
        margin: number;
        subtitle: string;
        text: string;
    }
}