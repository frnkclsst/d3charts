/// <reference path="_References.ts" />

"use strict";

module frnk.UI.Charts {
    export class StackedLineChart extends LineChart {

        constructor(args: any, selector: string) {
            super(args, selector);
            this.stackType = StackType.Normal;
        }

        public drawArea(svg: D3.Selection, serie: number): D3.Selection {
            var d3Area: D3.Svg.Area;

            d3Area = d3.svg.area()
                .interpolate(this.interpolation)
                .x(this.getXCoordinate(serie))
                .y0(
                    (d: any): number => {
                        // negative values
                        if (d.y < 0) {
                            return (this.yAxis.scale(d.y0 * this.normalizer(d)));
                        }
                        // positive values
                        else {
                            return (this.yAxis.scale((d.y0 - d.y) * this.normalizer(d)));
                        }
                    })
                .y1(this.getYCoordinate(serie));

            var svgArea = svg.append("path")
                .attr("class", "area")
                .attr("d", d3Area(this.series.getMatrixItem(serie)))
                .style("fill", this.series.getColor(serie))
                .style("opacity", "0.2");

            return svgArea;
        }

        public getXCoordinate(serie: number): any {
            return (d: any, i: number): number => {
                if (this.xAxis.isOrdinalScale() || this.xAxis.isLinearScale()) {
                    return this.xAxis.scale(this.categories.parseFormat(this.categories.getItem(i))) + this.xAxis.scale.rangeBand() / 2;
                }
                else {
                    return this.xAxis.scale(this.categories.parseFormat(this.categories.getItem(i))); // for time scales
                }
            };
        }

        public getYCoordinate(serie: number): any {
            return (d: any): number => {
                // negative numbers
                if (d.y0 < 1) {
                    return this.yAxis.scale((d.y0 + d.y) * this.normalizer(d));
                }
                // positive numbers
                else {
                    return this.yAxis.scale(d.y0 * this.normalizer(d));
                }
            };
        }

        protected normalizer(d: any): number {
            return StackType.Normal;
        }
    }
}