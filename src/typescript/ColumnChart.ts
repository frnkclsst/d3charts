/// <reference path="_References.ts" />

"use strict";

module frnk.UI.Charts {
    export class ColumnChart extends XYChart {

        public draw(): void {
            super.draw();

            // draw chart
            var svgSeries = this.canvas.plotArea.svg.append("g")
                .attr("class", "series");

            // draw columns
            for (var i = 0; i < this.series.length; i++) {
                var svgSerie = svgSeries.append("g")
                    .attr("id", "serie-" + i)
                    .selectAll("rect")
                    .data(this.series.getMatrixItem(i))
                    .enter();

                // draw bar
                var svgColumn = svgSerie.append("rect")
                    .attr({
                        "x": this.getXCoordinate(i),
                        "y": this.getYCoordinate(i),
                        "class": "bar",
                        "width": this.getWidth(i),
                        "height": this.getHeight(i),
                        "fill": ColorPalette.getColor(i)
                    });

                // draw tooltip
                this.tooltip.draw(svgColumn, i);
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
                                    "dy": Number(this.getAttribute("height")) / 2
                                });
                        });
                }
            }
        }

        public getXCoordinate(serie: number): any {
            var index = this.getAxisByName(AxisType.X, this.series.items[serie].name);

            return (d: any, i: number): number => {
                var axisScale = this.categories.parseFormat(this.categories.getItem(i));
                if (this.xAxes[index].getScaleType() == ScaleType.Ordinal) {
                    return this.xAxes[index].scale(axisScale) + (this.xAxes[index].scale.rangeBand() / this.series.length * serie);
                }
                else {
                    return this.xAxes[index].scale(axisScale) + (this.canvas.width / this.series.length / this.categories.length * serie);
                }
            };
        }

        public getYCoordinate(serie: number): any {
            var index = this.getAxisByName(AxisType.Y, this.series.items[serie].name);

            return (d: any): number => {
                if (d.y < 0) {
                    return this.yAxes[index].scale(d.y) - Math.abs(this.yAxes[index].scale(d.y) - this.yAxes[index].scale(0));
                }
                else {
                    return this.yAxes[index].scale(d.y);
                }
            };
        }

        public getHeight(serie: number): any {
            var index = this.getAxisByName(AxisType.Y, this.series.items[serie].name);

            return (d: any): any => {
                return Math.abs(this.yAxes[index].scale(d.y) - this.yAxes[index].scale(0));
            };
        }

        public getWidth(serie: number): any {
            var index = this.getAxisByName(AxisType.X, this.series.items[serie].name);

            return (d: any): number => {
                if (this.xAxes[index].getScaleType() == ScaleType.Ordinal) {
                    return this.xAxes[index].scale.rangeBand() / this.series.length;
                }
                else {
                    return this.canvas.width / this.series.length / this.categories.length;
                }
            };
        }
    }
}