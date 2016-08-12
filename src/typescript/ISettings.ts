/// <reference path="_References.ts" />

"use strict";

module frnk.UI.Charts {
    export interface ISettings {
        canvas: ICanvasSettings;
        xAxes: IAxisSettings;
        yAxes: IAxisSettings;
        title: ITitleSettings;
        legend: ILegendSettings;
    }

    export interface IAxisSettings {
        gridlines: string;
        labels: {
            rotate: string;
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
        svg: D3.Selection;
        width: number;
    }

    export interface ITitleSettings {
        align: string;
        height: number;
        margin: number;
        subtitle: string;
        text: string;
    }

    export interface ILegendSettings {
        height: number;
        position: string;
        title: string;
        width: number;
    }
}