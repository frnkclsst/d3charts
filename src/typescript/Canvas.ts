/// <reference path="_References.ts" />

"use strict";

module frnk.UI.Charts {
    export class Canvas implements IArea {
        public height: number;
        public legend: LegendArea;
        public plotArea: PlotArea;
        public svg: D3.Selection;
        public title: TitleArea;
        public width: number;

        private _chart: Chart;

        constructor(chart: Chart) {
            this._chart = chart;
            this.height = Number(chart.settings.getValue("canvas.height", "200"));
            this.width = Number(chart.settings.getValue("canvas.width", "200"));

            // update canvas size
            this.updateCanvasSize();

            // draw areas
            this.title = new TitleArea(chart, this);
            this.legend = new LegendArea(chart, this);
            this.plotArea = new PlotArea(chart, this);
        }

        public draw(): void {
            // update canvas size
            this.updateCanvasSize();

            // draw chart area
            this.svg = d3.select(this._chart.selector)
                .append("svg")
                .attr("width", this.width)
                .attr("height", this.height);

            // draw title area
            this.title.draw();

            // draw legend area
            this.legend.draw();

            // draw plot area
            this.plotArea.draw();
        }

        public updateCanvasSize(): void {
            var container = d3.select(this._chart.selector);
            var width = Number(container.style("width").substring(0, container.style("width").length - 2));
            var height = Number(container.style("height").substring(0, container.style("height").length - 2));
            this.width = width == 0 ? this.width : width;
            this.height =  height == 0 ? this.height : height;
        }
    }
}