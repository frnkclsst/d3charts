/// <reference path="_References.ts" />

"use strict";

module frnk.UI.Charts {
    export class BarChart extends XYChart {

        constructor(args: ISettings, selector: string) {
            super(args, selector);
        }

        public draw(): void {
            super.draw();

            // draw chart
            var svgSeries = this.canvas.plotArea.svg.append("g")
                .attr("class", "series");

            // draw bars
            for (var j = 0; j < this.series.length; j++) {
                var svgSerie = svgSeries.append("g")
                    .attr("id", "serie-" + j)
                    .selectAll("rect")
                    .data(this.series.getMatrixItem(j))
                    .enter();

                // draw bar
                var svgBar = svgSerie.append("rect")
                    .attr({
                        "x": this.getXCoordinate(j),
                        "y": this.getYCoordinate(j),
                        "class": "bar",
                        "width": this.getWidth(j),
                        "height": this.getHeight(j),
                        "fill": ColorPalette.getColor(j)
                    });

                // draw tooltip
                this.tooltip.draw(svgBar, j);

                // no value indication
                svgSerie.append("text")
                    .attr("class", "data-label")
                    .attr("x", this.getXCoordinate(j))
                    .attr("y", this.getYCoordinate(j))
                    .attr("fill", "#878787")
                    //.attr("dx", 0) // TODO - align text with middle of the bar
                    .attr("dy", -3) // TODO - align text in bar or on top of bar
                    .text(function (d: any): string {
                        if (d.y == 0) {
                            return parseFloat(d.y).toFixed(0);
                        }
                    });

                //TODO - drawing data labels should be an option, not only to indicate a zero value
            }

            this.drawLabels(svgSeries);
        }

        public drawLabels(svg: D3.Selection): void {
            // draw data labels
            if (this.settings.series.showLabels == true) {
                for (var j = 0; j < this.series.length; j++) {
                    d3.selectAll("g#serie-" + j).selectAll("rect")
                        .each(function(d: any): void {
                            svg.append("text")
                                .text(d.y) // TODO - should be d3.format(this.series.items[j].tooltipPointFormat)(d.y)
                                .style("text-anchor", "middle")
                                .attr({
                                    "class": "label",
                                    "alignment-baseline": "central",
                                    "fill": "#fff",
                                    "x": this.getAttribute("x"),
                                    "y": this.getAttribute("y"),
                                    "dx": Number(this.getAttribute("width")) / 2,
                                    "dy": (Number(this.getAttribute("height")) / 2)
                                });
                        });
                }
            }
        }

        public getXCoordinate(serie: number): any {
            var index = this.getAxisByName(AxisType.X, this.series.items[serie].name);

            return (d: any): any => {
                if (d.y < 0) {
                    return Math.abs(this.xAxes[index].scale(d.y));
                }
                else {
                    return this.xAxes[index].scale(0);
                }
            };
        }

        public getYCoordinate(serie: number): any {
            var index = this.getAxisByName(AxisType.Y, this.series.items[serie].name);

            return (d: any, i: number): number => {
                var axisScale = this.categories.parseFormat(this.categories.getItem(i));
                var series = this.series;
                if (this.yAxes[index].getScaleType() == ScaleType.Ordinal) {
                    return this.yAxes[index].scale(axisScale) + (this.yAxes[index].scale.rangeBand() / series.length * serie);
                }
                else {
                    return this.yAxes[index].scale(axisScale) + (this.canvas.width / series.length / this.categories.length / series.length * serie);
                }
            };
        }

        public getHeight(serie: number): any {
            var index = this.getAxisByName(AxisType.Y, this.series.items[serie].name);

            return (d: any): any => {
                if (this.yAxes[0].getScaleType() == ScaleType.Ordinal) {
                    return Math.abs(this.yAxes[index].scale.rangeBand() / this.series.length);
                }
                else {
                    return Math.abs(this.canvas.width / this.series.length / this.categories.length / this.series.length);
                }
            };
        }

        public getWidth(serie: number): any {
            var index = this.getAxisByName(AxisType.X, this.series.items[serie].name);

            return (d: any): number => {
                return Math.abs(this.xAxes[index].scale(d.y) - this.xAxes[index].scale(0));
            };
        }
    }
}