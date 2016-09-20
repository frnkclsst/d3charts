/// <reference path="_References.ts" />

"use strict";

module frnk.UI.Charts {
    export class XYChart extends Chart {
        public xAxes: XAxis[] = [];
        public yAxes: YAxis[] = [];

        constructor(args: ISettings, selector: string) {
            super(args, selector);

            for (var i = 0; i < this.settings.xAxes.length; i++) {
                this.xAxes.push(new XAxis(this.settings.xAxes[i], this));
            }

            for (var j = 0; j < this.settings.yAxes.length; j++) {
                this.yAxes.push(new YAxis(this.settings.yAxes[j], this));
            }
        }

        public draw(): void {
            super.draw();

            for (var i = 0; i < this.xAxes.length; i++) {
                this.xAxes[i].draw(this);
                if (this.xAxes.length > 1) {
                    this.xAxes[i].setColor(this, ColorPalette.getColor(i));
                }
            }

            for (var j = 0; j < this.yAxes.length; j++) {
                this.yAxes[j].draw(this);
                if (this.yAxes.length > 1) {
                    this.yAxes[j].setColor(this, ColorPalette.getColor(j));
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

        protected getAxisByName(axis: AxisType, name: string): number {
            var axes: any;

            if (axis == AxisType.X) {
                axes = this.xAxes;
            }
            else {
                axes = this.yAxes;
            }

            if (name != "") {
                for (var i = 0; i <  axes.length; i++) {
                    if (axes[i].name == name) {
                        return i;
                    }
                }
            }
            return 0;
        }
    }
}