/// <reference path="_References.ts" />

"use strict";

module frnk.UI.Charts {
    export class TitleArea implements IArea {
        public align: string;
        public height: number;
        public subTitle: string;
        public svg: D3.Selection;
        public text: string;
        public width: number;

        private _chart: Chart;

        constructor(chart: Chart, canvas: Canvas) {
            this._chart = chart;

            this.align = chart.settings.getValue("title.align", "center");
            this.height = Number(chart.settings.getValue("title.height", "50"));
            this.subTitle = chart.settings.getValue("title.subTitle");
            this.text = chart.settings.getValue("title.text");
        }

        public draw(): void {
            // initialize
            this.width = this._chart.canvas.width;

            // get text
            this.svg = this._chart.canvas.svg.append("g")
                .attr("class", "title")
                .attr("width", this.width)
                .attr("height", this.height)
                .attr("transform", "translate(0,0)");

            var svgTitle = this.svg.append("text")
                .text(this.text);

            // calculate alignment
            var svgText: any = this.svg.node();
            var textBox = svgText.getBBox();
            var x;
            switch (this.align) {
                case "left":
                    x = 0;
                    break;
                case "center":
                    x = (this.width - textBox.width) / 2;
                    break;
                case "right":
                    x = this.width - textBox.width;
                    break;
            }

            var y = (this.height + textBox.height) / 2;

            // set title position
            svgTitle
                .attr("x", function (): number {
                    return x;
                })
                .attr("y", function (): number {
                    return y;
                });

            // draw line
            this.svg.append("line")
                .attr("class", "sep")
                .attr("x1", 0)
                .attr("y1", this.height)
                .attr("x2", this.width)
                .attr("y2", this.height);
        }
    }
}
