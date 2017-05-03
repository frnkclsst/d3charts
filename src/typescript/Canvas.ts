"use strict";

import { Chart } from "./Chart";
import { ChartArea } from "./ChartArea";
import { LegendArea } from "./LegendArea";
import { TitleArea } from "./TitleArea";
import { PlotArea } from "./PlotArea";

export class Canvas extends ChartArea {
    public border: {
        bottom: boolean;
        left: boolean;
        right: boolean;
        top: boolean;
    };
    public legendArea: LegendArea;
    public plotArea: PlotArea;
    public titleArea: TitleArea;

    constructor(chart: Chart) {
        super(chart);

        this.titleArea = new TitleArea(chart);
        this.legendArea = new LegendArea(chart);
        this.plotArea = new PlotArea(chart);
        this.border = {
            bottom: chart.options.canvas.border.bottom,
            left: chart.options.canvas.border.left,
            right: chart.options.canvas.border.right,
            top: chart.options.canvas.border.top
        };
        this.height = chart.options.canvas.height;
        this.width = chart.options.canvas.width;
    }

    public draw(): void {
        // update canvas size
        this.positionAreas();

        // draw chart area
        this.svg = d3.select(this._chart.selector)
            .append("svg")
            .attr("class", "svg_chart")
            .attr("width", this.width)
            .attr("height", this.height);

        // draw areas
        if (this._chart.series.items[0].data.length > 0) {
            this.titleArea.draw();
            this.legendArea.draw();
            this.plotArea.draw();
            this.drawBorders();
        }
        else {
            this.svg.append("text")
                .attr("x", "50%")
                .attr("y", "50%")
                .attr("alignment-baseline", "middle")
                .attr("text-anchor", "middle")
                .text("No data available");

            throw Error("No data available");
        }

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
                this.legendArea.height = this.height - this.titleArea.height;
                this.plotArea.x = 0;
                this.plotArea.y = this.titleArea.height;
            }
            else if (this.legendArea.position === "left") {
                this.legendArea.x = 0;
                this.legendArea.y = this.titleArea.height;
                this.legendArea.height = this.height - this.titleArea.height;
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