/// <reference path="_References.ts" />

"use strict";

module frnk.UI.Charts {

    export class PlotArea implements IChartArea {
        public axisSize: {
            left: number;
            right: number;
            top: number;
            bottom: number;
        };
        public height: number;
        public padding: number;
        public width: number;
        public svg: D3.Selection;
        public x: number;
        public y: number;

        private _chart: Chart;

        constructor(chart: Chart) {
            this._chart = chart;

            this.axisSize = {
                left: 0,
                right: 0,
                top: 0,
                bottom: 0
            };
            this.height = 0;
            this.padding = chart.options.plotArea.padding;
            this.width = 0;
            this.x = 0;
            this.y = 0;
        }

        public draw(): void {
            this.axisSize = {
                left: 0,
                right: 0,
                top: 0,
                bottom: 0
            };

            this.svg = this._chart.canvas.svg.append("g")
                .attr("class", "plotarea")
                .attr("transform", "translate(" + (this.x + this.padding) + "," + (this.y + this.padding) + ")");
        }
    }
}