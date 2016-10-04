/// <reference path="_References.ts" />

"use strict";

module frnk.UI.Charts {

    export class BarChart extends XYChart {

        public draw(): void {
            super.draw();

            // draw chart
            var svgSeries = this.canvas.plotArea.svg.append("g")
                .attr("class", "series");

            // draw bars
            for (var serie = 0; serie < this.series.length; serie++) {
                var bar = new SVGBar(svgSeries, this, serie);
                bar.draw();
            }
        }

        public drawLabels(svg: D3.Selection): void {
            for (var serie = 0; serie < this.series.length; serie++) {
                var svgLabels = svg.append("g").attr("id", "labels-" + serie);
                d3.selectAll("g#serie-" + serie).selectAll("rect")
                    .each((d: any, i: number): void => {
                        var rotation = 0;
                        var x = this.getXCoordinate(d, i, serie);
                        var y = this.getYCoordinate(d, i, serie);
                        var dx = 0;
                        var dy = 0;

                        if (this.settings.series.labels.rotate === true) {
                            rotation = -90;
                        }

                        if (rotation != 0) {
                            dx = -this.getHeight(d, i, serie) / 2;
                            dy = this.getWidth(d, i, serie) / 2;
                        }
                        else {
                            dx = this.getWidth(d, i, serie) / 2;
                            dy = this.getHeight(d, i, serie) / 2;
                        }

                        svgLabels.append("text")
                            .text(d3.format(this.series.items[serie].format)(d.y))
                            .style("text-anchor", "middle")
                            .attr({
                                "alignment-baseline": "central",
                                "class": "label",
                                "fill": "#fff",
                                "transform": "translate(" + x + ", " + y + ") rotate(" + rotation + ")",
                                "dx": dx,
                                "dy": dy
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
                return Math.abs(this.canvas.width / this.series.length / this.categories.length / this.series.length); // TODO - dived twice by series.length - is this correct?
            }
        }

        public getWidth(d: any, i: number, serie: number): any {
            var index = this.getAxisByName(AxisType.X, this.series.items[serie].name);

            return Math.abs(this.xAxes[index].scale(d.y) - this.xAxes[index].scale(0));
        }
    }
}