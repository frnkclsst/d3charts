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
                var svgSerie = svgSeries.append("g")
                    .attr("id", "serie-" + serie)
                    .selectAll("rect")
                    .data(this.series.getMatrixItem(serie))
                    .enter();

                // draw column
                var svgColumn = svgSerie.append("rect")
                    .attr({
                        "class": "bar",
                        "fill": ColorPalette.getColor(serie),
                        "height": 0,
                        "width": (d: any, i: number): void => { return this.getWidth(d, i, serie); },
                        "x": (d: any, i: number): void => { return this.getXCoordinate(d, i, serie); },
                        "y": (d: any, i: number): void => { return (this.getHeight(d, i, serie) + this.getYCoordinate(d, i, serie)); }
                    });

                // add animation
                var duration = this.settings.series.animate == true ? 600 : 0;
                svgColumn
                    .transition()
                    .duration(duration)
                    .attr({
                        "height": (d: any, i: number): void => { return this.getHeight(d, i, serie); },
                        "y": (d: any, i: number): void => { return this.getYCoordinate(d, i, serie); }
                    });

                // draw tooltip
                this.tooltip.draw(svgColumn, serie);
            }

            if (this.settings.series.showLabels == true) {
                this.drawLabels(svgSeries);
            }
        }

        public drawLabels(svg: D3.Selection): void {
            for (var serie = 0; serie < this.series.length; serie++) {
                d3.selectAll("g#serie-" + serie).selectAll("rect")
                    .each((d: any, i: number): void  => {
                        svg.append("text")
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
            var axisScale = this.categories.parseFormat(this.categories.getItem(i));

            if (this.xAxes[index].getScaleType() == ScaleType.Ordinal) {
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

            if (this.xAxes[index].getScaleType() == ScaleType.Ordinal) {
                return this.xAxes[index].scale.rangeBand() / this.series.length;
            }
            else {
                return this.canvas.width / this.series.length / this.categories.length;
            }
        }
    }
}