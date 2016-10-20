/// <reference path="_References.ts" />

"use strict";

module frnk.UI.Charts {

    export class SVGMarker extends SVGShape {

        protected chart: XYChart;

        public x: (d: any, i: number, serie: number) => number;
        public y: (d: any, i: number, serie: number) => number;

        constructor(svg: D3.Selection, chart: XYChart, serie: number) {
            super(svg, chart, serie);
            this.chart = chart;
        }

        public draw(data: any): void {

        }
    }
}