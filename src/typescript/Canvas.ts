/// <reference path="_References.ts" />

"use strict";

module frnk.UI.Charts {
    export class Canvas implements IArea {
        public height: number;
        public legendArea: LegendArea;
        public padding: number;
        public plotArea: PlotArea;
        public svg: D3.Selection;
        public titleArea: TitleArea;
        public width: number;

        private _chart: Chart;

        constructor(chart: Chart) {
            this._chart = chart;

            this.titleArea = new TitleArea(chart.settings.title, chart);
            this.legendArea = new LegendArea(chart.settings.legend, chart);
            this.plotArea = new PlotArea(chart.settings, chart);

            this.height = chart.settings.canvas.height;
            this.padding = chart.settings.canvas.padding;
            this.width = chart.settings.canvas.width;
        }

        public draw(): void {
            // update canvas size
            this.updateSize();

            // draw chart area
            this.svg = d3.select(this._chart.selector)
                .append("svg")
                .attr("width", this.width)
                .attr("height", this.height);

            // draw title area
            this.titleArea.draw();

            // draw legend area
            this.legendArea.draw();

            // draw plot area
            this.plotArea.draw();
        }

        public updateSize(): void {
            var container = d3.select(this._chart.selector);
            var width = Number(container.style("width").substring(0, container.style("width").length - 2));
            var height = Number(container.style("height").substring(0, container.style("height").length - 2));
            this.width = width === 0 ? this.width : width;
            this.height =  height === 0 ? this.height : height;
        }
    }
}