/// <reference path="_References.ts" />

"use strict";

module frnk.UI.Charts {

    export class ComboChart extends XYChart {

        constructor(selector: string, data: IData, options?: IOptions) {
            super(selector, data, options);
        }

        public draw(): void {
            super.draw();
            /*
            var svgSeries = this.canvas.plotArea.svg.append("g")
                .attr("class", "series");

            // draw lines
            for (var serie = 0; serie < this.series.length; serie++) {
                if (this.series.items[serie].type === "line") {
                    var line = new SVGLine(svgSeries, this, serie);
                    line.draw();
                }
            }
            */
        }

        public drawLabels(svg: D3.Selection): void {
            for (var serie = 0; serie < this.series.length; serie++) {
                var svgLabels = svg.append("g").attr("id", "labels-" + serie);
                d3.selectAll("g#serie-" + serie).selectAll("path.marker")
                    .each((d: any, i: number): void => {
                        var rotation = 0;
                        var x = this.getXCoordinate(d, i, serie);
                        var y = this.getYCoordinate(d, i, serie);
                        var dx = 0;
                        var dy = 0;

                        if (this.options.series.labels.rotate === true) {
                            rotation = -90;
                        }

                        var text = svgLabels.append("text")
                            .text(d3.format(this.series.items[serie].format)(d.y))
                            .style("text-anchor", "middle")
                            .attr({
                                "alignment-baseline": "central",
                                "class": "label",
                                "fill": "#fff",
                                "transform": "translate(" + x + ", " + y + ") rotate(" + rotation + ")"
                            });

                        if (rotation != 0) {
                            dx = Html.getHeight(text) + this.options.linechart.markers.size / 2;
                        }
                        else {
                            dy = -Html.getHeight(text) - this.options.linechart.markers.size / 2;
                        }

                        text
                            .attr("dy", dy)
                            .attr("dx", dx);
                    });
            }
        }

        public getXCoordinate(d: any, i: number, serie: number): any {
            var index = this.getAxisByName(AxisType.X, this.series.items[serie].axis);
            var axis = this.axes[index];

            if (axis.getScaleType() === ScaleType.Ordinal) {
                return axis[index].scale(this.categories.parseFormat(this.categories.getItem(i))) + axis.scale.rangeBand() / 2;
            }
            else {
                return axis.scale(this.categories.parseFormat(this.categories.getItem(i)));
            }
        }

        public getYCoordinate(d: any, i: number, serie: number): any {
            var index = this.getAxisByName(AxisType.Y, this.series.items[serie].axis);
            var axis = this.axes[index];

            return axis.scale(d.y);
        }
    }
}