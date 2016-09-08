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
        format: string;
        labels: {
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
        fillArea: boolean;
        interpolation: string;
        showMarkers: boolean;
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
        data: Serie[];
        showLabels: boolean;
    }

    export interface ITitleAreaSettings {
        align: string;
        height: number;
        margin: number;
        subtitle: string;
        text: string;
    }
}