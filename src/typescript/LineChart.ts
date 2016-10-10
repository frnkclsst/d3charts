/// <reference path="_References.ts" />

"use strict";

module frnk.UI.Charts {

    export class LineChart extends XYChart {
        public area: {
            visible: boolean,
            opacity: number
        };
        public interpolation: string;
        public markers: {
            visible: boolean,
            size: number,
            type: MarkerType
        };

        constructor(selector: string, args: ISettings) {
            super(selector, args);
            this.area = {
                visible: this.settings.linechart.area.visible,
                opacity: this.settings.linechart.area.opacity
            };
            this.interpolation = this.settings.linechart.interpolation;
            this.markers = {
                visible: this.settings.linechart.markers.visible,
                size: this.settings.linechart.markers.size,
                type: this.settings.linechart.markers.type
            };
        }

        public draw(): void {
            super.draw();

            var svgSeries = this.canvas.plotArea.svg.append("g")
                .attr("class", "series");

            // draw areas
            // areas need to be drawn first, because the line and markers need to be drawn on top of it
            if (this.area.visible === true) {
                for (var areaSerie = 0; areaSerie < this.series.length; areaSerie++) {
                    var area = new SVGArea(svgSeries, this, areaSerie);
                    area.draw();
                }
            }

            // draw lines
            for (var serie = 0; serie < this.series.length; serie++) {
                var line = new SVGLine(svgSeries, this, serie);
                line.draw();
            }

            // draw tooltip line
            /* TODO - improve tooltips for line charts
               - code below only works if ordinal scale
               - need to use invert method to discover domain value in a linear scale

            var _self = this;
            svgSeries.append("line").attr("id", "tooltipLine");

            var overlay = this.canvas.svg
                .append("rect")
                .attr("class", "overlay")
                .attr("width", _self.canvas.plotArea.width)
                .attr("height", _self.canvas.plotArea.height)
                .attr("opacity", "0")
                .attr("transform", "translate(" + (_self.canvas.plotArea.padding + _self.canvas.plotArea.axisSize.left) + ", "
                    + (_self.canvas.titleArea.height + _self.canvas.plotArea.padding) + ")")
                .on("mousemove", function (): void {
                    if (_self instanceof LineChart) {
                        var mouseX = d3.mouse(this)[0];
                        var leftEdges = _self.xAxes[0].scale.range();
                        var width = _self.xAxes[0].scale.rangeBand();
                        var domainValue = "";
                        for (var j = 0; j < leftEdges.length; j++) {
                            var threshold = leftEdges[j] - width / 2;
                            if (mouseX > threshold) {
                                domainValue = _self.xAxes[0].scale.domain()[j];
                            }
                        }
                        var left = _self.xAxes[0].scale(domainValue) + width / 2;

                        svgSeries.select("#tooltipLine")
                            .attr("x1", left)
                            .attr("x2", left)
                            .attr("y1", "0")
                            .attr("y1", _self.canvas.plotArea.height)
                            .attr("stroke", "#ddd");
                    }
                });
                */
        }

        public getXCoordinate(d: any, i: number, serie: number): any {
            var index = this.getAxisByName(AxisType.X, this.series.items[serie].name);

            if (this.xAxes[index].getScaleType() === ScaleType.Ordinal) {
                return this.xAxes[index].scale(this.categories.parseFormat(this.categories.getItem(i))) + this.xAxes[0].scale.rangeBand() / 2;
            }
            else {
                return this.xAxes[index].scale(this.categories.parseFormat(this.categories.getItem(i)));
            }
        }

        public getYCoordinate(d: any, i: number, serie: number): any {
            var index = this.getAxisByName(AxisType.Y, this.series.items[serie].name);

            return this.yAxes[index].scale(d.y);
        }

        public getY0Coordinate(d: any, i: number, serie: number): any {
            var index = this.getAxisByName(AxisType.Y, this.series.items[serie].name);

            return this.yAxes[index].scale(0);
        }
    }
}