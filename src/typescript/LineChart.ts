/// <reference path="_References.ts" />

"use strict";

module frnk.UI.Charts {
    export class LineChart extends XYChart {
        public showMarkers: boolean;
        public interpolation: string;
        public fillArea: boolean;

        constructor(args: any, selector: string) {
            super(args, selector);
            this.showMarkers = this.settings.getValue("linechart.showMarkers").toUpperCase() == "YES" ? true : false;
            this.interpolation = this.settings.getValue("linechart.interpolation", "linear");
            this.fillArea = this.settings.getValue("linechart.fillArea").toUpperCase() == "YES" ? true : false;
        }

        public draw(): void {
            super.draw();

            // draw areas
            // areas need to be drawn first, because the line and markers need to be drawn on top of it
            if (this.fillArea) {
                var svgAreas = this.canvas.plotArea.svg.append("g")
                    .attr("class", "areas");

                for (var i = 0; i < this.series.length; i++) {
                    var svgArea = svgAreas.append("g")
                        .attr("id", "area-" + i);

                    this.drawArea(svgArea, i);
                }
            }

            // draw lines
            var svgSeries = this.canvas.plotArea.svg.append("g")
                .attr("class", "series");
            for (var j = 0; j < this.series.length; j++) {
                var svgSerie = svgSeries.append("g")
                    .attr("id", "serie-" + j);

                // draw line
                this.drawLine(svgSerie, j);

                // draw markers
                if (this.showMarkers) {
                    var svgMarkers = this.drawMarkers(svgSerie, j);

                    // draw tooltip
                    this.drawTooltip(svgMarkers, j);
                }
            }
        }

        public drawArea(svg: D3.Selection, serie: number): D3.Selection {
            var d3Area: D3.Svg.Area;

            d3Area = d3.svg.area()
                .interpolate(this.interpolation)
                .x(this.getXCoordinate(serie))
                .y0(this.yAxis.scale(0))
                .y1(this.getYCoordinate(serie));

            var svgArea = svg.append("path")
                .attr("class", "area")
                .attr("d", d3Area(this.series.getMatrixItem(serie)))
                .style("fill", this.series.getColor(serie))
                .style("opacity", "0.2");

            return svgArea;
        }

        public drawLine(svg: D3.Selection, serie: number): D3.Selection {
            var d3Line = d3.svg.line()
                .interpolate(this.interpolation)
                .x(this.getXCoordinate(serie))
                .y(this.getYCoordinate(serie));

            var svgLine = svg.append("path")
                .attr("class", "line")
                .attr("d", d3Line(this.series.getMatrixItem(serie)))
                .attr("stroke", this.series.getColor(serie))
                .attr("stroke-width", 1)
                .attr("fill", "none");

            return svgLine;
        }

        public drawMarkers(svg: D3.Selection, serie: number): D3.Selection {
            var svgMarkers = svg.selectAll(".marker")
                .data(this.series.getMatrixItem(serie))
                .enter().append("circle")
                .attr("class", "marker")
                .attr("stroke", this.series.getColor(serie))
                .attr("stroke-width", "0")
                .attr("fill", this.series.getColor(serie))
                .attr("cx", this.getXCoordinate(serie))
                .attr("cy", this.getYCoordinate(serie))
                .attr("r", 4);

            return svgMarkers;
        }

        public drawTooltip(svg: D3.Selection, serie: number): void {
            var _this = this;
            var div = d3.select("body").append("div")
                .attr("class", "tooltip")
                .style("opacity", 0);

            svg.on("mouseover", function (d: any): void {
                    div.transition()
                        .duration(200)
                        .style("opacity", .9);
                    div.html(_this.settings.getValue("tooltip.title") + "<br/>"  + d.y + _this.settings.getValue("tooltip.valueSuffix"))
                        .style("left", (d3.mouse(this)[0]) + "px")
                        .style("top", (d3.mouse(this)[1]) + 175 + "px");  // TODO - hardcoded value only works in some occasions
                })
                .on("mouseout", function(d: any): void {
                    div.transition()
                        .duration(500)
                        .style("opacity", 0);
                });
        }

        public getXCoordinate(serie: number): any {
            return (d: any, i: number): number => {
                if (this.xAxis.isOrdinalScale()) {
                    return this.xAxis.scale(this.categories.parseFormat(this.categories.getItem(i))) + this.xAxis.scale.rangeBand() / 2;
                }
                else {
                    return this.xAxis.scale(this.categories.parseFormat(this.categories.getItem(i)));
                }
            };
        }

        public getYCoordinate(serie: number): any {
            return (d: any): number => {
                return this.yAxis.scale(d.y);
            };
        }
    }
}