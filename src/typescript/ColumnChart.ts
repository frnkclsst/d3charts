/// <reference path="_References.ts" />

"use strict";

module frnk.UI.Charts {
    export class ColumnChart extends XYChart {

        public showDataLabels: boolean;

        constructor(args: any, selector: string) {
            super(args, selector);
            this.showDataLabels = this.settings.getValue("columnchart.dataLabels").toUpperCase() == "YES" ? true : false;
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
                var svgColumn = svgSerie.append("rect")
                    .attr({
                        "x": this.getXCoordinate(j),
                        "y": this.getYCoordinate(j),
                        "class": "bar",
                        "width": this.getWidth(j),
                        "height": this.getHeight(j),
                        "fill": this.series.getColor(j)
                    });

                // draw tooltip
                this.tooltip.draw(svgColumn, j);

                // draw data labels
                if (this.showDataLabels) {
                    svgSerie.append("text")
                        .attr("class", "data-label")
                        .text(function (d: any): string {
                            return parseFloat(d.y).toFixed(0);
                        })
                        .attr("x", this.getXCoordinate(j))
                        .attr("y", this.getYCoordinate(j))
                        .attr("fill", "#878787")
                        //.attr("dx", dx) // TODO - align text with middle of the bar
                        .attr("dy", -3); // TODO - align text in bar or on top of bar
                }
            }
        }

        public getXCoordinate(serie: number): any {
            return (d: any, i: number): number => {
                var axisScale = this.categories.parseFormat(this.categories.getItem(i));
                if (this.xAxis.getScaleType() == ScaleType.Ordinal) {
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
                if (this.xAxis.getScaleType() == ScaleType.Ordinal) {
                    return this.xAxis.scale.rangeBand() / this.series.length;
                }
                else {
                    return this.canvas.width / this.series.length / this.categories.length;
                }
            };
        }
    }
}