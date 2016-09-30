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
            for (var serie = 0; serie < this.series.length; serie++) {
                var svgSerie = svgSeries.append("g")
                    .attr("id", "serie-" + serie)
                    .selectAll("rect")
                    .data(this.series.getMatrixItem(serie))
                    .enter();

                // draw single bar
                var svgBar = svgSerie.append("rect")
                    .attr({
                        "class": "bar",
                        "fill": ColorPalette.color(serie),
                        "height": (d: any, i: number): number => {
                            return this.getHeight(d, i, serie);
                        },
                        "width": 0,
                        "x": (d: any, i: number): number => {
                            if (d.y < 0) {
                                return this.xAxes[0].scale(0); // TODO - take the right axis in case there are multiple
                            }
                            else {
                                return this.getXCoordinate(d, i, serie);
                            }
                        },
                        "y": (d: any, i: number): void => { return this.getYCoordinate(d, i, serie); }
                    });

                // add animation
                var duration = this.settings.series.animate === true ? 600 : 0;
                var count = 0;
                svgBar
                    .each((): void => {
                        count++; // count number of bars
                    })
                    .transition()
                    .duration(duration)
                    .attr("width", (d: any, i: number): number => {
                        return this.getWidth(d, i, serie);
                    })
                    .attr("x", (d: any, i: number): number => {
                        return this.getXCoordinate(d, i, serie);
                    })
                    .each("end", (): void => {
                        count--;
                        if (this.settings.series.showLabels === true && !count) { // only draw labels after all transitions ended
                            this.drawLabels(svgSeries);
                        }
                    });

                // draw tooltip
                this.tooltip.draw(svgBar, serie);
            }
        }

        public drawLabels(svg: D3.Selection): void {
            for (var serie = 0; serie < this.series.length; serie++) {
                var svgLabels = svg.append("g").attr("id", "labels-" + serie);
                d3.selectAll("g#serie-" + serie).selectAll("rect")
                    .each((d: any, i: number): void => {
                        svgLabels.append("text")
                            .text(d3.format(this.series.items[serie].tooltipPointFormat)(d.y))
                            .style("text-anchor", "middle")
                            .attr({
                                "alignment-baseline": "central",
                                "class": "label",
                                "fill": "#fff",
                                "x": this.getXCoordinate(d, i, serie),
                                "y": this.getYCoordinate(d, i, serie),
                                "dx": this.getWidth(d, i, serie) / 2,
                                "dy": this.getHeight(d, i, serie) / 2
                            });
                    });
            }
        }

        public getXCoordinate(d: any, i: number, serie: number): any {
            var index = this.getAxisByName(AxisType.X, this.series.items[serie].name);

            if (d.y < 0) {
                return Math.abs(this.xAxes[index].scale(d.y));
            }
            else {
                return this.xAxes[index].scale(0);
            }
        }

        public getYCoordinate(d: any, i: number, serie: number): any {
            var index = this.getAxisByName(AxisType.Y, this.series.items[serie].name);

            var axisScale = this.categories.parseFormat(this.categories.getItem(i));

            if (this.yAxes[index].getScaleType() === ScaleType.Ordinal) {
                return this.yAxes[index].scale(axisScale) + (this.yAxes[index].scale.rangeBand() / this.series.length * serie);
            }
            else {
                return this.yAxes[index].scale(axisScale) + (this.canvas.width / this.series.length / this.categories.length / this.series.length * serie);
            }
        }

        public getHeight(d: any, i: number, serie: number): any {
            var index = this.getAxisByName(AxisType.Y, this.series.items[serie].name);

            if (this.yAxes[0].getScaleType() === ScaleType.Ordinal) {
                return Math.abs(this.yAxes[index].scale.rangeBand() / this.series.length);
            }
            else {
                return Math.abs(this.canvas.width / this.series.length / this.categories.length / this.series.length);
            }
        }

        public getWidth(d: any, i: number, serie: number): any {
            var index = this.getAxisByName(AxisType.X, this.series.items[serie].name);

            return Math.abs(this.xAxes[index].scale(d.y) - this.xAxes[index].scale(0));
        }
    }
}