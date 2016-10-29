/// <reference path="_References.ts" />

"use strict";

module frnk.UI.Charts {

    export class Canvas implements IChartArea {
        public height: number;
        public legendArea: LegendArea;
        public padding: number;
        public plotArea: PlotArea;
        public svg: D3.Selection;
        public titleArea: TitleArea;
        public width: number;
        public x: number;
        public y: number;

        private _chart: Chart;

        constructor(chart: Chart) {
            this._chart = chart;

            this.titleArea = new TitleArea(chart);
            this.legendArea = new LegendArea(chart);
            this.plotArea = new PlotArea(chart);

            this.height = chart.options.canvas.height;
            this.width = chart.options.canvas.width;
            this.x = 0;
            this.y = 0;
        }

        public draw(): void {
            // update canvas size
            this.positionAreas();

            // draw chart area
            this.svg = d3.select(this._chart.selector)
                .append("svg")
                .attr("width", this.width)
                .attr("height", this.height);

            // TODO - should be drawn by areas themselves
            // there should be a border property on an area
            // draw separator for title
            if (this.titleArea.position === "bottom") {
                this.drawSeparator(this.titleArea.x, this.width, this.titleArea.y, this.titleArea.y);
            }
            else {
                // default position is top
                this.drawSeparator(this.titleArea.x, this.width, this.titleArea.height, this.titleArea.height);
            }

            // draw separator for legend
            if (this.legendArea.position === "right") {
                this.drawSeparator(this.legendArea.x, this.legendArea.x, this.legendArea.y, this.legendArea.height);
            }
            else if (this.legendArea.position === "bottom") {
                this.drawSeparator(this.legendArea.x, this.legendArea.width, this.legendArea.y, this.legendArea.y);
            }
            else if (this.legendArea.position === "top") {
                this.drawSeparator(this.legendArea.x, this.legendArea.width, this.legendArea.y + this.legendArea.height, this.legendArea.y + this.legendArea.height);
            }
            else {
                // default position is left
                this.drawSeparator(this.legendArea.width, this.legendArea.width, this.legendArea.y, this.legendArea.height);
            }

            // draw areas
            this.titleArea.draw();
            this.legendArea.draw();
            this.plotArea.draw();
        }

        public drawSeparator(x1: number, x2: number, y1: number, y2: number): void {
            this.svg.append("line")
                .attr("class", "sep")
                .attr("x1", x1)
                .attr("y1", y1)
                .attr("x2", x2)
                .attr("y2", y2);
        }
        public positionAreas(): void {
            var container = d3.select(this._chart.selector);

            // get element size
            var elementWidth = Number(container.style("width").substring(0, container.style("width").length - 2));
            var elementHeight = Number(container.style("height").substring(0, container.style("height").length - 2));

            this.width = elementWidth === 0 ? this.width : elementWidth;
            this.height =  elementHeight === 0 ? this.height : elementHeight;

            // position areas
            this.titleArea.width = this.width;
            this.titleArea.height = this._chart.options.title.height;

            this.plotArea.height = this.height - this.titleArea.height - this.plotArea.padding * 2;
            this.plotArea.width = this.width - this.plotArea.padding * 2 - this.legendArea.width;

            if (this.titleArea.position === "bottom") {
                this.titleArea.x = 0;
                this.titleArea.y = this.height - this.titleArea.height;

                if (this.legendArea.position === "right") {
                    this.legendArea.x = this.width - this.legendArea.width;
                    this.legendArea.y = 0;
                    this.legendArea.height = this.height - this.titleArea.height;
                    this.plotArea.x = 0;
                    this.plotArea.y = 0;
                }
                else if (this.legendArea.position === "left") {
                    this.legendArea.x = 0;
                    this.legendArea.y = 0;
                    this.legendArea.height = this.height - this.titleArea.height;
                    this.plotArea.x = this.legendArea.width;
                    this.plotArea.y = 0;
                }
                else if (this.legendArea.position === "bottom") {
                    this.legendArea.x = 0;
                    this.legendArea.y = this.height - this.legendArea.height - this.titleArea.height;
                    this.legendArea.width = this.width;
                    this.plotArea.x = 0;
                    this.plotArea.y = 0;
                    this.plotArea.height = this.plotArea.height - this.legendArea.height;
                    this.plotArea.width = this.width - 2 * this.plotArea.padding;
                }
                else if (this.legendArea.position === "top") {
                    this.legendArea.x = 0;
                    this.legendArea.y = 0;
                    this.legendArea.width = this.width;
                    this.plotArea.x = 0;
                    this.plotArea.y = this.legendArea.height;
                    this.plotArea.height = this.plotArea.height - this.legendArea.height;
                    this.plotArea.width = this.width - 2 * this.plotArea.padding;
                }
            }
            else {
                this.titleArea.x = 0;
                this.titleArea.y = 0;

                if (this.legendArea.position === "right") {
                    this.legendArea.x = this.width - this.legendArea.width;
                    this.legendArea.y = this.titleArea.height;
                    this.legendArea.height = this.height;
                    this.plotArea.x = 0;
                    this.plotArea.y = this.titleArea.height;
                }
                else if (this.legendArea.position === "left") {
                    this.legendArea.x = 0;
                    this.legendArea.y = this.titleArea.height;
                    this.legendArea.height = this.height;
                    this.plotArea.x = this.legendArea.width;
                    this.plotArea.y = this.titleArea.height;
                }
                else if (this.legendArea.position === "bottom") {
                    this.legendArea.x = 0;
                    this.legendArea.y = this.height - this.legendArea.height;
                    this.legendArea.width = this.width;
                    this.plotArea.x = 0;
                    this.plotArea.y = this.titleArea.height;
                    this.plotArea.height = this.plotArea.height - this.legendArea.height;
                    this.plotArea.width = this.width - 2 * this.plotArea.padding;
                }
                else if (this.legendArea.position === "top") {
                    this.legendArea.x = 0;
                    this.legendArea.y = this.titleArea.height;
                    this.legendArea.width = this.width;
                    this.plotArea.x = 0;
                    this.plotArea.y = this.titleArea.height + this.legendArea.height;
                    this.plotArea.height = this.plotArea.height - this.legendArea.height;
                    this.plotArea.width = this.width - 2 * this.plotArea.padding;
                }
            }
        }
    }
}