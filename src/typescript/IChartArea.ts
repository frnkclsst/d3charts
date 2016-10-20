/// <reference path="_References.ts" />

"use strict";

module frnk.UI.Charts {

    export interface IChartArea {
        height: number;
        width: number;
        svg: D3.Selection;
        x: number;
        y: number;
    }
}