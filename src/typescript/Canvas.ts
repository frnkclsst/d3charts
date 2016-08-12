/// <reference path="_References.ts" />

"use strict";

module frnk.UI.Charts {
    export class Canvas implements IArea {
        public height: number;
        public padding: number;
        public svg: D3.Selection;
        public width: number;

        private _chart: Chart;
        private _settings: Settings;

        constructor(canvasSettings: ICanvasSettings, chart: Chart, settings: Settings) {
            this._chart = chart;
            this._settings = settings;

            this.height = canvasSettings.height;
            this.padding = canvasSettings.padding;
            this.width = canvasSettings.width;

            // update canvas size
            this.updateCanvasSize();
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
            this._settings.title.draw();

            // draw legend area
            this._settings.legend.draw();

            // draw plot area
            this._settings.plotArea.draw();
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