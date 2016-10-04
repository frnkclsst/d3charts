/// <reference path="_References.ts" />

"use strict";

module frnk.UI.Charts {

    export class LineChart extends XYChart {
        public fillArea: boolean;
        public interpolation: string;
        public markers: {
            enabled: boolean,
            size: number,
            type: MarkerType
        };

        constructor(args: ISettings, selector: string) {
            super(args, selector);
            this.fillArea = this.settings.linechart.fillArea;
            this.interpolation = this.settings.linechart.interpolation;
            this.markers = {
                enabled: this.settings.linechart.markers.enabled,
                size: this.settings.linechart.markers.size,
                type: this.settings.linechart.markers.type
            };
        }

        public draw(): void {
            super.draw();

            var svgSeries = this.canvas.plotArea.svg.append("g")
                .attr("class", "series");

            // draw areas
            // areas need to be drawn first, because the line and markers need to be drawn on top of it
            if (this.fillArea === true) {
                for (var serieArea = 0; serieArea < this.series.length; serieArea++) {
                    var area = new SVGArea(svgSeries, this, serieArea);
                    area.draw();
                }
            }

            // draw lines
            for (var serieLine = 0; serieLine < this.series.length; serieLine++) {
                var line = new SVGLine(svgSeries, this, serieLine);
                line.draw();
            }
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

                        if (this.settings.series.labels.rotate === true) {
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
                            dx = Html.getHeight(text) + this.settings.linechart.markers.size / 2;
                        }
                        else {
                            dy = -Html.getHeight(text) - this.settings.linechart.markers.size / 2;
                        }

                        text
                            .attr("dy", dy)
                            .attr("dx", dx);
                    });
            }
        }

        public getXCoordinate(d: any, i: number, serie: number): any {
            var index = this.getAxisByName(AxisType.X, this.series.items[serie].name);

            if (this.xAxes[index].getScaleType() === ScaleType.Ordinal) {
                return this.xAxes[index].scale(this.categories.parseFormat(this.categories.getItem(i))) + this.xAxes[0].scale.rangeBand() / 2;
            }
            else {
                return this.xAxes[index].scale(this.categories.parseFormat(this.categories.getItem(i)));
            }
        }

        public getYCoordinate(d: any, i: number, serie: number): any {
            var index = this.getAxisByName(AxisType.Y, this.series.items[serie].name);

            return this.yAxes[index].scale(d.y);
        }

        public getY0Coordinate(d: any, i: number, serie: number): any {
            var index = this.getAxisByName(AxisType.Y, this.series.items[serie].name);

            return this.yAxes[index].scale(0);
        }
    }
}