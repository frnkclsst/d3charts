/// <reference path="_References.ts" />

"use strict";

module frnk.UI.Charts {

    export interface ISettings {
        canvas: ICanvasSettings;
        columnchart: IColumnChartSettings;
        legend: ILegendAreaSettings;
        linechart: ILineChartSettings;
        piechart: IPieChartSettings;
        plotOptions: PlotOptionSettings;
        title: ITitleAreaSettings;
        xAxes: IAxisSettings;
        yAxes: IAxisSettings;

        getValue(propStr: string, defaultValue?: string): any;
    }

    export interface IAxisSettings {
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

    export interface ICanvasSettings {
        height: number;
        padding: number;
        width: number;
    }

    export interface IColumnChartSettings {

    }

    export interface ILegendAreaSettings {
        height: number;
        position: string;
        title: string;
        width: number;
    }

    export interface ILineChartSettings {
        area: {
            enabled: boolean;
            opacity: number;
        };
        interpolation: string;
        markers: {
            enabled: boolean,
            size: number,
            type: MarkerType
        };
    }

    export interface IPlotAreaSettings {
        height: number;
        width: number;
        padding: number;
    }

    export interface IPlotOptionSettings {
        innerPadding: number;
        outerPadding: number;
    }

    export interface IPieChartSettings {
        innerRadius: number;
    }

    export interface ISeriesSettings {
        animate: boolean;
        items: Serie[];
        labels: {
            enabled: boolean,
            format: string,
            rotate: boolean
        };
    }

    export interface ITitleAreaSettings {
        align: string;
        height: number;
        margin: number;
        subtitle: string;
        text: string;
    }
}