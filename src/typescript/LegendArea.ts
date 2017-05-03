"use strict";

import { Chart } from "./Chart";
import { ChartArea } from "./ChartArea";
import { PieChart } from "./PieChart";
import { ScatterChart } from "./ScatterChart";
import { SVGSymbol } from "./Shape.Symbol";

export class LegendArea extends ChartArea {
    public position: string;
    public title: string;

    private _items: string[];

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

        if (this._chart instanceof PieChart) {
            this._items = this._chart.categories.getLabels();
        }
        else {
            this._items = this._chart.series.getLabels();
        }

        if (this._chart instanceof ScatterChart) {
            this._items = this._items.slice(1, this._items.length);
        }

        this.svg = this._chart.canvas.svg.append("g")
            .attr("class", "legend")
            .attr("transform", "translate(" + this.x + "," + this.y + ")");

        this.drawTitle(this.svg);
        this.drawItems(this.svg);
        this.drawBorders();
    }

    private drawItems(svg: D3.Selection): void {
        for (var i = 0; i < this._items.length; i++) {
            var _self = this;
            var g = svg.append("g")
                .attr("class", "item")
                .attr("data-serie", i)
                .attr("transform", "translate(" + 22 + "," + ((i * 20) + 60) + ")")
                .on("click", function(): void {
                    // TODO - refactor clicking items in legend
                    // - add checkbox
                    // - add interpolation when in stacked / pie charts
                    var item = Number(d3.select(this).attr("data-serie"));
                    var opacity: number;
                    if (_self._chart instanceof PieChart) {
                        var slice = d3.selectAll(_self._chart.selector + " #slice-" + item);
                        opacity = slice.style("opacity") === "1" ? 0 : 1;
                        d3.selectAll(_self._chart.selector + " #slice-" + item).transition().duration(200).style("opacity", opacity);
                        d3.selectAll(_self._chart.selector + " #labels-" + item).transition().duration(200).style("opacity", opacity); //TODO - doesn't remove right labels
                    }
                    else {
                        var serie = d3.selectAll(_self._chart.selector + " #serie-" + item);
                        opacity = serie.style("opacity") === "1" ? 0 : 1;
                        d3.select(_self._chart.selector + " #serie-" + item).transition().duration(200).style("opacity", opacity);
                        d3.select(_self._chart.selector + " #labels-" + item).transition().duration(200).style("opacity", opacity);
                        d3.select(_self._chart.selector + " #area-" + item).transition().duration(200).style("opacity", opacity);
                    }
                });

            var symbol = new SVGSymbol(g, this._chart, i);
            symbol.color = this._chart.colorPalette.color(i);
            symbol.opacity = this._chart.options.plotOptions.area.opacity;
            symbol.draw(this._items[i]);

            this.drawText(g, i);

        }
    }

    private drawText(svg: D3.Selection, serie: number): void {
        svg.append("text")
            .attr("x", 24 + 6)
            .attr("y", 9)
            .attr("dy", "0px")
            .style("text-anchor", "begin")
            .text((): string => {
                if (this._chart instanceof PieChart) {
                    return this._items[serie];
                }
                else if (this._chart instanceof ScatterChart) {
                    return this._chart.series.getLabel(serie + 1);
                }
                else {
                    return this._chart.series.getLabel(serie);
                }
            });
    }

    private drawTitle(svg: D3.Selection): void {
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