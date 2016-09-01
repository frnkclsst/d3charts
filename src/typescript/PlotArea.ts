/// <reference path="_References.ts" />

"use strict";

module frnk.UI.Charts {
    export class PlotArea implements IArea {
        public height: number;
        public width: number;
        public svg: D3.Selection;
        public padding: number;

        private _chart: Chart;

        constructor(settings: Settings, chart: Chart) {
            this._chart = chart;

            this.padding = settings.canvas.padding;
            this.height = settings.canvas.height - settings.title.height - this.padding * 2;
            this.width = settings.canvas.width - this.padding * 2 - settings.legend.width;
        }

        public draw(): void {
            // initialize
            this.height = this._chart.canvas.height - this._chart.settings.title.height - this.padding * 2;
            this.width = this._chart.canvas.width - this.padding * 2 - this._chart.settings.legend.width;

            // draw plot area
            this.svg = this._chart.canvas.svg.append("g")
                .attr("class", "plotarea")
                .attr("transform", "translate(" + this.padding + ","
                    + (this._chart.settings.title.height
                    + this.padding) + ")");
        }
    }
}