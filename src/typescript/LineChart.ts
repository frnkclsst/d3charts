/// <reference path="_References.ts" />

"use strict";

module frnk.UI.Charts {
    export class LineChart extends XYChart {
        public fillArea: boolean;
        public interpolation: string;
        public showMarkers: boolean;

        constructor(args: ISettings, selector: string) {
            super(args, selector);
            this.fillArea = this.settings.linechart.fillArea;
            this.interpolation = this.settings.linechart.interpolation;
            this.showMarkers = this.settings.linechart.showMarkers;
        }

        public draw(): void {
            super.draw();

            // draw areas
            // areas need to be drawn first, because the line and markers need to be drawn on top of it
            if (this.fillArea == true) {
                var svgAreas = this.canvas.plotArea.svg.append("g")
                    .attr("class", "areas");

                for (var i = 0; i < this.series.length; i++) {
                    var area = new Area(svgAreas, this, i);
                    area.draw();
                }
            }

            // draw lines
            var svgSeries = this.canvas.plotArea.svg.append("g")
                .attr("class", "series");

            for (var j = 0; j < this.series.length; j++) {
                var line = new Line(svgSeries, this, j);
                line.draw();
            }
        }

        public getXCoordinate(serie: number): any {
            var index = this.getAxisByName(AxisType.X, this.series.items[serie].name);

            return (d: any, i: number): number => {
                if (this.xAxes[index].getScaleType() == ScaleType.Ordinal) {
                    return this.xAxes[index].scale(this.categories.parseFormat(this.categories.getItem(i))) + this.xAxes[0].scale.rangeBand() / 2;
                }
                else {
                    return this.xAxes[index].scale(this.categories.parseFormat(this.categories.getItem(i)));
                }
            };
        }

        public getYCoordinate(serie: number): any {
            var index = this.getAxisByName(AxisType.Y, this.series.items[serie].name);

            return (d: any): number => {
                return this.yAxes[index].scale(d.y);
            };
        }

        public getY0Coordinate(serie: number): any {
            var index = this.getAxisByName(AxisType.Y, this.series.items[serie].name);

            return this.yAxes[index].scale(0);
        }
    }
}