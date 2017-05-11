"use strict";

import { ChartArea } from "./ChartArea";
import { Chart } from "./Chart";
import * as Html from "./Html";

export class TitleArea extends ChartArea {
    public align: string;
    public margin: number;
    public position: string;
    public subTitle: string;
    public text: string;

    constructor(chart: Chart) {
        super(chart);

        this.align = chart.options.title.align;
        this.border = {
            bottom: chart.options.title.border.bottom,
            left: chart.options.title.border.left,
            right: chart.options.title.border.right,
            top: chart.options.title.border.top
        };
        this.margin = chart.options.title.margin;
        this.height = chart.options.title.height;
        this.position = chart.options.title.position;
        this.subTitle = chart.options.title.subtitle;
        this.text = chart.options.title.text;
    }

    public draw(): void {

        if (this.height === 0) {
            return;
        }

        // get text
        this.svg = this._chart.canvas.svg.append("g")
            .attr("class", "titlearea")
            .attr("width", this.width)
            .attr("height", this.height)
            .attr("transform", "translate(" + this.x + ", " + this.y + ")");

        var svgTitle = this.svg.append("g")
            .attr("class", "title");

        var svgTitleMain = svgTitle.append("text")
            .attr("class", "title")
            .text(this.text);

        var svgSubTitle = svgTitle.append("text")
            .attr("class", "subtitle")
            .text(this.subTitle);

        // align text
        var x = Html.align(svgTitle, this.width, this.align, this.margin);
        var xSubtitle = Html.align(svgSubTitle, this.width, this.align, this.margin);
        var y = ((this.height + Html.getHeight(svgTitleMain)) - Html.getHeight(svgSubTitle)) / 2;

        svgTitleMain.attr("transform", "translate(" + x + "," + y + ")");
        svgSubTitle.attr("transform", "translate(" + xSubtitle + ", " + (y + Html.getHeight(svgSubTitle)) + ")");

        this.drawBorders();
    }
}