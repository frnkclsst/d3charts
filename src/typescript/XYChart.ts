/// <reference path="_References.ts" />

"use strict";

module frnk.UI.Charts {

    export class XYChart extends Chart {
        public axes: Axis[] = [];

        constructor(selector: string, data: IData, options?: IOptions) {
            super(selector, data, options);

            for (var i = 0; i < this.options.xAxes.length; i++) {
                var xAxis = new XAxis(this, this.options.xAxes[i]);
                this.axes.push(xAxis);
            }

            for (var j = 0; j < this.options.yAxes.length; j++) {
                var yAxis = new YAxis(this, this.options.yAxes[j]);
                this.axes.push(yAxis);
            }
        }

        public draw(): void {
            super.draw();

            for (var i = 0; i < this.axes.length; i++) {
                this.axes[i].getSize();
            }

            for (var j = 0; j < this.axes.length; j++) {
                this.axes[j].draw();
                if (this.axes.length > 1) {
                    this.axes[j].setColor(ColorPalette.color(j));
                }
            }
        }

        public getXCoordinate(d: any, i: number, serie: number): any {
            // child classes are responsible for implementing this method
        }

        public getYCoordinate(d: any, i: number, serie: number): any {
            // child classes are responsible for implementing this method
        }

        public getY0Coordinate(d: any, i: number, serie: number): any {
            // child classes are responsible for implementing this method
        }

        public getAxisByName(axisType: AxisType, ref: string): number {
            var last = 0;
            if (ref != "") {
                for (var i = 0; i <  this.axes.length; i++) {
                    if (this.axes[i].type === axisType) {
                        last = i;
                        if (this.axes[i].name === ref) {
                            return i;
                        }
                    }
                }
            }
            return last;
        }
    }
}