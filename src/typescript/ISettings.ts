/// <reference path="_References.ts" />

"use strict";

module frnk.UI.Charts {
    export interface IAxisSettings {
        gridlines: string;
        labels: {
            rotate: string;
        };
        orient: string;
        position: string;
        tickmarks: string;
        title?: {
            text?: string;
        };
    }

    export interface ICanvasSettings {
        height: number;
        width: number;
        padding: number;
    }
}