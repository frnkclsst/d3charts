/// <reference path="_References.ts" />

"use strict";

module frnk.UI.Charts {

    export interface ISettings {
        canvas: ICanvasSettings;
        legend: ILegendAreaSettings;
        plotOptions: PlotOptions;
        title: ITitleAreaSettings;
        xAxes: IAxisSettings;
        yAxes: IAxisSettings;

        getValue(propStr: string, defaultValue?: string): any;
    }

    export interface IAxisSettings {
        gridlines: string;
        labels: {
            rotate: number;
        };
        name: string;
        orient: OrientationType;
        tickmarks: string;
        title: {
            text: string;
        };
    }

    export interface ICanvasSettings {
        height: number;
        padding: number;
        width: number;
    }

    export interface ILegendAreaSettings {
        height: number;
        position: string;
        title: string;
        width: number;
    }

    export interface IPlotAreaSettings {
        height: number;
        width: number;
        padding: number;
    }

    export interface ITitleAreaSettings {
        align: string;
        height: number;
        margin: number;
        subtitle: string;
        text: string;
    }
}