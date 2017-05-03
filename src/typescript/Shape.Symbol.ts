"use strict";

import { SVGShape } from "./Shape";
import { Chart } from "./Chart";
import { ComboChart } from "./ComboChart";
import { LineChart } from "./LineChart";
import { ScatterChart } from "./ScatterChart";

export class SVGSymbol extends SVGShape {

    public symbolWidth: number = 24;
    public symbolHeight: number = 12;
    public area: {
        visible: boolean;
    };
    public marker: {
        size: number;
        type: string;
        visible: boolean;
    };

    constructor(svg: D3.Selection, chart: Chart, serie: number) {
        super(svg, chart, serie);
        this.chart = chart;

        this.area = {
            visible: chart.options.plotOptions.area.visible
        };
        this.marker = {
            size: chart.options.plotOptions.markers.size,
            type: serie < chart.series.length ? chart.series.items[serie].marker : "circle",
            visible: chart.options.plotOptions.markers.visible
        };
    }

    public draw(data: any): void {
        var _self = this;

        if (_self.chart instanceof ComboChart) {
            if (_self.chart.series.items[_self.serie].type === "line") {
                _self.drawLineSymbol(this.svg);
            }
            else {
                _self.drawRectangleSymbol(this.svg);
            }
        }
        else if (_self.chart instanceof ScatterChart) {
            _self.drawMarkerSymbol(this.svg);
        }
        else if (_self.chart instanceof LineChart) {
            _self.drawLineSymbol(this.svg);
        }
        else {
            _self.drawRectangleSymbol(this.svg);
        }
    }

    private drawLineSymbol(svg: D3.Selection): void {
        svg.append("line")
            .attr("x1", 0)
            .attr("x2", this.symbolWidth)
            .attr("y1", this.symbolHeight / 2)
            .attr("y2", this.symbolHeight / 2)
            .style("stroke", this.color)
            .style("stroke-width", "2");

        // draw area
        if (this.area.visible === true) {
            svg.append("rect")
                .attr("x", 0)
                .attr("y", this.symbolHeight / 2)
                .attr("opacity", this.opacity)
                .attr("width", this.symbolWidth)
                .attr("height", this.symbolHeight / 2)
                .style("fill", this.color);
        }

        // draw marker
        if (this.marker.visible === true) {
            this.drawMarkerSymbol(svg);
        }
    }

    private drawMarkerSymbol(svg: D3.Selection): void {
        var _self = this;
        svg
            .append("path")
            .each(function(d: any, i: number): void {
                d3.select(this)
                    .attr({
                        "class": "marker",
                        "d": d3.svg.symbol()
                            .size(60)
                            .type(_self.marker.type)(),
                        "stroke": _self.color,
                        "stroke-width": 0,
                        "transform": "translate(" + _self.symbolWidth / 2 + ", " + _self.symbolHeight / 2 + ")"
                    });
            });
    }

    private drawRectangleSymbol(svg: D3.Selection): void {
        svg.append("rect")
            .attr("x", 0)
            .attr("width", this.symbolWidth)
            .attr("height", 11)
            .style("fill", this.color);
    }
}