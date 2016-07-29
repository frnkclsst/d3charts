/// <reference path="_References.ts" />

"use strict";

module frnk.UI.Charts {
    export class ColumnChart extends XYChart {

        constructor(args: any, selector: string) {
            super(args, selector);
        }

        public draw(): void {
            super.draw();

            // draw chart
            var svgSeries = this.canvas.plotArea.svg.append("g")
                .attr("class", "series");

            // draw columns
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
                        "fill": this.series.getColor(j)
                    });

                // draw tooltip
                this.drawTooltip(svgBar, j);

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
        }

        public getXCoordinate(serie: number): any {
            return (d: any, i: number): number => {
                var axisScale = this.categories.parseFormat(this.categories.getItem(i));
                if (this.xAxis.isOrdinalScale()) {
                    return this.xAxis.scale(axisScale) + (this.xAxis.scale.rangeBand() / this.series.length * serie);
                }
                else {
                    return this.xAxis.scale(axisScale) + (this.canvas.width / this.series.length / this.categories.length * serie);
                }
            };
        }

        public getYCoordinate(serie: number): any {
            return (d: any): number => {
                if (d.y < 0) {
                    return this.yAxis.scale(d.y) - Math.abs(this.yAxis.scale(d.y) - this.yAxis.scale(0));
                }
                else {
                    return this.yAxis.scale(d.y);
                }
            };
        }

        public getHeight(serie: number): any {
            return (d: any): any => {
                return Math.abs(this.yAxis.scale(d.y) - this.yAxis.scale(0));
            };
        }

        public getWidth(serie: number): any {
            return (d: any): number => {
                if (this.xAxis.isOrdinalScale()) {
                    return this.xAxis.scale.rangeBand() / this.series.length;
                }
                else {
                    return this.canvas.width / this.series.length / this.categories.length;
                }
            };
        }
    }
}