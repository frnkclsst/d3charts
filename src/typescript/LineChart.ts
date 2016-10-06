/// <reference path="_References.ts" />

"use strict";

module frnk.UI.Charts {

    export class LineChart extends XYChart {
        public area: {
            enabled: boolean,
            opacity: number
        };
        public interpolation: string;
        public markers: {
            enabled: boolean,
            size: number,
            type: MarkerType
        };

        constructor(args: ISettings, selector: string) {
            super(args, selector);
            this.area = {
                enabled: this.settings.linechart.area.enabled,
                opacity: this.settings.linechart.area.opacity
            };
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
            if (this.area.enabled === true) {
                for (var areaSerie = 0; areaSerie < this.series.length; areaSerie++) {
                    var area = new SVGArea(svgSeries, this, areaSerie);
                    area.draw();
                }
            }

            // draw lines
            for (var serie = 0; serie < this.series.length; serie++) {
                var line = new SVGLine(svgSeries, this, serie);
                line.draw();
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