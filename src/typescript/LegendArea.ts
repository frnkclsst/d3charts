"use strict";

import * as d3 from "d3";
import { Chart } from "./Chart";
import { ChartArea } from "./ChartArea";
import { SVGSymbol } from "./Symbol";

export class LegendArea extends ChartArea {
    public items: string[];
    public position: string;
    public title: string;

    constructor(chart: Chart) {
        super(chart);

        this.border = {
            bottom: chart.options.legend.border.bottom,
            left: chart.options.legend.border.left,
            right: chart.options.legend.border.right,
            top: chart.options.legend.border.top
        };
        this.height = chart.options.legend.height;
        this.position = chart.options.legend.position;
        this.title = chart.options.legend.title;
        this.width = chart.options.legend.width;
    }

    public draw(): void {
        if (this.width === 0) {
            return;
        }

        this.svg = this._chart.canvas.svg.append("g")
            .attr("class", "legend")
            .attr("transform", "translate(" + this.x + "," + this.y + ")");

        this._drawTitle(this.svg);
        this._drawItems(this.svg);
        this.drawBorders();
    }

    private _drawItems(svg: d3.Selection<SVGElement>): void {
        for (var i = 0; i < this.items.length; i++) {
            var _self = this;
            var g = svg.append("g")
                .attr("class", "item")
                .attr("data-serie", i)
                .attr("transform", "translate(" + 22 + "," + ((i * 20) + 60) + ")")
                .on("click", function (): void {
                    // TODO - add checkbox next to legend item to show / hide the serie
                    var item = Number(d3.select(this).attr("data-serie"));
                    _self._chart.toggleSerie(_self.items, item);
                });

            var symbol = new SVGSymbol(g, this._chart, i);
            symbol.color = this._chart.colorPalette.color(i);
            symbol.opacity = this._chart.options.plotOptions.area.opacity;
            symbol.draw();

            this._drawText(g, i);
        }
    }

    private _drawText(svg: d3.Selection<SVGElement>, serie: number): void {
        svg.append("text")
            .attr("x", 24 + 6)
            .attr("y", 9)
            .attr("dy", "0px")
            .style("text-anchor", "begin")
            .text((): string => {
               return this.items[serie];
            });
    }

    private _drawTitle(svg: d3.Selection<SVGElement>): void {
        // draw horizontal line
        var svgTitle = svg.append("g")
            .attr("class", "title");

        svgTitle.append("line")
            .attr("class", "sep")
            .attr("x1", 20)
            .attr("y1", 40)
            .attr("x2", this.width - 20)
            .attr("y2", 40);

        // add legend title
        svgTitle.append("text")
            .attr("class", "title")
            .text(this.title)
            .attr("x", 22)
            .attr("y", 26);
    }
}
