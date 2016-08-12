/// <reference path="_References.ts" />

"use strict";

module frnk.UI.Charts {
    export class PlotArea implements IArea {
        public height: number;
        public width: number;
        public svg: D3.Selection;
        public padding: number;

        private _canvas: Canvas;
        private _chart: Chart;

        constructor(chart: Chart, canvas: Canvas) {
            this._chart = chart;
            this._canvas = canvas;

            this.padding = this._chart.settings.getValue("canvas.padding", "50");
            this.height = this._canvas.height - this._canvas.title.height - this.padding * 2;
            this.width = this._canvas.width - this.padding * 2 - this._canvas.legend.width;
        }

        public draw(): void {
            // initialize
            this.height = this._canvas.height - this._canvas.title.height - this.padding * 2;
            this.width = this._canvas.width - this.padding * 2 - this._canvas.legend.width;

            // draw plot area
            this.svg = this._chart.canvas.svg.append("g")
                .attr("class", "plotarea")
                .attr("transform", "translate(" + this._chart.canvas.plotArea.padding + "," + (this._chart.canvas.title.height + this._chart.canvas.plotArea.padding) + ")");
        }
    }
}