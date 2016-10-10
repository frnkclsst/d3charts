/// <reference path="_References.ts" />

"use strict";

module frnk.UI.Charts {

    export class PlotArea implements IArea {
        public height: number;
        public width: number;
        public svg: D3.Selection;
        public padding: number;
        public axisSize: {
            left: number;
            right: number;
            top: number;
            bottom: number;
        };

        private _chart: Chart;

        constructor(settings: Options, chart: Chart) {
            this._chart = chart;

            this.padding = settings.plotArea.padding;
            this.height = settings.canvas.height - settings.title.height - this.padding * 2;
            this.width = settings.canvas.width - this.padding * 2 - settings.legend.width;
            this.axisSize = {
                left: 0,
                right: 0,
                top: 0,
                bottom: 0
            };
        }

        public draw(): void {
            // initialize
            this.initialize();

            this.svg = this._chart.canvas.svg.append("g")
                .attr("class", "plotarea")
                .attr("transform", "translate(" + this.padding + ","
                    + (this._chart.options.title.height
                    + this.padding) + ")");
        }

        public initialize(): void {
            this.height = this._chart.canvas.height - this._chart.options.title.height - this.padding * 2;
            this.width = this._chart.canvas.width - this.padding * 2 - this._chart.options.legend.width;
            this.axisSize = {
                left: 0,
                right: 0,
                top: 0,
                bottom: 0
            };
        }
    }
}