/// <reference path="_References.ts" />

"use strict";

module frnk.UI.Charts {
    export class TitleArea implements IArea {
        public align: string;
        public height: number;
        public margin: number;
        public subTitle: string;
        public svg: D3.Selection;
        public text: string;
        public width: number;

        private _chart: Chart;

        constructor(chart: Chart, canvas: Canvas) {
            this._chart = chart;

            this.align = chart.settings.getValue("title.align", "center");
            this.margin = chart.settings.getValue("title.margin");
            this.height = Number(chart.settings.getValue("title.height", "0"));
            this.subTitle = chart.settings.getValue("title.subtitle");
            this.text = chart.settings.getValue("title.text");
        }

        public draw(): void {
            // initialize
            this.width = this._chart.canvas.width;

            // get text
            this.svg = this._chart.canvas.svg.append("g")
                .attr("class", "titlearea")
                .attr("width", this.width)
                .attr("height", this.height)
                .attr("transform", "translate(0,0)");

            var svgTitle = this.svg.append("g")
                .attr("class", "title");

            var svgTitleMain = svgTitle.append("text")
                .attr("class", "title")
                .text(this.text);

            var svgSubTitle = svgTitle.append("text")
                .attr("class", "subtitle")
                .text(this.subTitle);

            // align text
            var x;
            var xSubtitle;
            switch (this.align) {
                case "left":
                    x = 0 + this.margin;
                    xSubtitle = 0 + this.margin;
                    break;
                case "center":
                    x = (this.width - Html.getWidth(svgTitleMain)) / 2;
                    xSubtitle = (this.width - Html.getWidth(svgSubTitle)) / 2;
                    break;
                case "right":
                    x = this.width - Html.getWidth(svgTitleMain) - this.margin;
                    xSubtitle = this.width - Html.getWidth(svgSubTitle) - this.margin;
                    break;
            }

            var y = ((this.height + Html.getHeight(svgTitleMain)) - Html.getHeight(svgSubTitle)) / 2;

            svgTitleMain.attr("transform", "translate(" + x + "," + y + ")");
            svgSubTitle.attr("transform", "translate(" + xSubtitle + ", " + (y + Html.getHeight(svgSubTitle)) + ")");

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