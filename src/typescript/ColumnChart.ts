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
            for (var serie = 0; serie < this.series.length; serie++) {
                var column = new SVGColumn(svgSeries, this, serie);
                column.draw();
            }
        }

        public drawLabels(svg: D3.Selection): void {
            for (var serie = 0; serie < this.series.length; serie++) {
                var svgLabels = svg.append("g").attr("id", "labels-" + serie);
                d3.selectAll("g#serie-" + serie).selectAll("rect")
                    .each((d: any, i: number): void  => {
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
            var axisScale = this.categories.parseFormat(this.categories.getItem(i));

            if (this.xAxes[index].getScaleType() === ScaleType.Ordinal) {
                return this.xAxes[index].scale(axisScale) + (this.xAxes[index].scale.rangeBand() / this.series.length * serie);
            }
            else {
                return this.xAxes[index].scale(axisScale) + (this.canvas.width / this.series.length / this.categories.length * serie);
            }
        }

        public getYCoordinate(d: any, i: number, serie: number): any {
            var index = this.getAxisByName(AxisType.Y, this.series.items[serie].name);

            if (d.y < 0) {
                return this.yAxes[index].scale(d.y) - Math.abs(this.yAxes[index].scale(d.y) - this.yAxes[index].scale(0));
            }
            else {
                return this.yAxes[index].scale(d.y);
            }
        }

        public getHeight(d: any, i: number, serie: number): any {
            var index = this.getAxisByName(AxisType.Y, this.series.items[serie].name);

            return Math.abs(this.yAxes[index].scale(d.y) - this.yAxes[index].scale(0));
        }

        public getWidth(d: any, i: number, serie: number): any {
            var index = this.getAxisByName(AxisType.X, this.series.items[serie].name);

            if (this.xAxes[index].getScaleType() === ScaleType.Ordinal) {
                return this.xAxes[index].scale.rangeBand() / this.series.length;
            }
            else {
                return this.canvas.width / this.series.length / this.categories.length;
            }
        }
    }
}