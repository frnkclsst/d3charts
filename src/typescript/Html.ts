/// <reference path="_References.ts" />

"use strict";

module frnk.UI.Charts.Html {
    export function getHeight(svg: any): number {
        return svg.node().getBBox().height;
    }

    export function getWidth(svg: any): number {
        return svg.node().getBBox().width;
    }
}