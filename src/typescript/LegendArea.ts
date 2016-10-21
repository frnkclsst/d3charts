/// <reference path="_References.ts" />

"use strict";

module frnk.UI.Charts {

    export class LegendArea implements IChartArea {
        public height: number;
        public position: string;
        public svg: D3.Selection;
        public title: string;
        public width: number;
        public x: number;
        public y: number;

        private _chart: Chart;
        private _items: string[];
        private _symbolWidth: number = 24;
        private _symbolHeight: number = 12;

        constructor(chart: Chart) {
            this._chart = chart;

            this.height = chart.options.legend.height;
            this.position = chart.options.legend.position;
            this.title = chart.options.legend.title;
            this.width = chart.options.legend.width;
            this.x = 0;
            this.y = 0;
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
        }

        private drawItems(svg: D3.Selection): void {
            var items = svg
                .selectAll(".item")
                .data(this._items)
                .enter().append("g")
                .attr("class", "item")
                .attr("transform", (d: any, i: any): string => {
                    return "translate(" + 22 + "," + ((i * 20) + 60) + ")";
                })
                .on("click", (d: any, i: number): void => {
                    // TODO - refactor clicking items in legend
                    // - add checkbox
                    // - add interpolation when in stacked / pie charts
                    var opacity;
                    if (this._chart instanceof PieChart) {
                        var slice = d3.selectAll("#slice-" + i);
                        opacity = slice.style("opacity") === "1" ? 0 : 1;
                        d3.selectAll("#slice-" + i).transition().duration(200).style("opacity", opacity);
                        d3.selectAll("#labels-" + i).transition().duration(200).style("opacity", opacity);
                    }
                    else {
                        var serie = d3.selectAll("#serie-" + i);
                        opacity = serie.style("opacity") === "1" ? 0 : 1;
                        d3.select("#serie-" + i).transition().duration(200).style("opacity", opacity);
                        d3.select("#labels-" + i).transition().duration(200).style("opacity", opacity);
                        d3.select("#area-" + i).transition().duration(200).style("opacity", opacity);
                    }
                });

            this.drawSymbol(items);
            this.drawText(items);
        }

        private drawSymbol(svg: D3.Selection): void {
            var _self = this;
            svg.each(function (d: any, i: number): void {
                var g = d3.select(this);
                if (_self._chart instanceof ComboChart) {
                    if (_self._chart.series.items[i].type === "line") {
                        _self.drawLineSymbol(g, i);
                    }
                    else {
                        _self.drawRectangleSymbol(g, i);
                    }
                }
                else if (_self._chart instanceof ScatterChart) {
                    _self.drawMarkerSymbol(g, i);
                }
                else if (_self._chart instanceof LineChart) {
                    _self.drawLineSymbol(g, i);
                }
                else {
                    _self.drawRectangleSymbol(g, i);
                }
            });
        }

        private drawLineSymbol(svg: D3.Selection, serie: number): void {
            svg.append("line")
                .attr("x1", 0)
                .attr("x2", this._symbolWidth)
                .attr("y1", this._symbolHeight / 2)
                .attr("y2", this._symbolHeight / 2)
                .style("stroke", this._chart.colorPalette.color(serie))
                .style("stroke-width", "2");

            // draw area
            if (this._chart.options.plotArea.area.visible === true) {
                svg.append("rect")
                    .attr("x", 0)
                    .attr("y", this._symbolHeight / 2)
                    .attr("opacity", this._chart.options.plotArea.area.opacity)
                    .attr("width", this._symbolWidth)
                    .attr("height", this._symbolHeight / 2)
                    .style("fill", this._chart.colorPalette.color(serie));
            }

            // draw marker
            if (this._chart.options.plotArea.markers.visible === true) {
                this.drawMarkerSymbol(svg, serie);
            }
        }

        private drawMarkerSymbol(svg: D3.Selection, serie: number): void {
            var _self = this;
            svg
                .append("path")
                .each(function(d: any, i: number): void {
                    d3.select(this)
                        .attr({
                            "class": "marker",
                            "d": d3.svg.symbol()
                                .size(60)
                                .type(_self._chart.series.items[i].marker)(),
                            "stroke": _self._chart.colorPalette.color(serie),
                            "stroke-width": 0,
                            "transform": "translate(" + _self._symbolWidth / 2 + ", " + _self._symbolHeight / 2 + ")"
                        });
                });
        }

        private drawRectangleSymbol(svg: D3.Selection, serie: number): void {
            svg.append("rect")
                .attr("x", 0)
                .attr("width", this._symbolWidth)
                .attr("height", 11)
                .style("fill", this._chart.colorPalette.color(serie));
        }

        private drawText(svg: D3.Selection): void {
            svg.append("text")
                .attr("x", this._symbolWidth + 6)
                .attr("y", 9)
                .attr("dy", "0px")
                .style("text-anchor", "begin")
                .text((d: any, i: any): string => {
                    if (this._chart instanceof PieChart) {
                        return this._items[i];
                    }
                    else if (this._chart instanceof ScatterChart) {
                        return this._chart.series.getLabel(i + 1);
                    }
                    else {
                        return this._chart.series.getLabel(i);
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
}