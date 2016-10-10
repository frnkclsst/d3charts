/// <reference path="_References.ts" />

"use strict";

module frnk.UI.Charts {

    export class XYChart extends Chart {
        public xAxes: XAxis[] = [];
        public yAxes: YAxis[] = [];

        constructor(selector: string, data: IData, options?: IOptions) {
            super(selector, data, options);

            for (var i = 0; i < this.options.xAxes.length; i++) {
                this.xAxes.push(new XAxis(this.options.xAxes[i], this));
            }

            for (var j = 0; j < this.options.yAxes.length; j++) {
                this.yAxes.push(new YAxis(this.options.yAxes[j], this));
            }
        }

        public draw(): void {
            super.draw();

            for (var i = 0; i < this.xAxes.length; i++) {
                this.xAxes[i].getSize(this);
            }

            for (var j = 0; j < this.yAxes.length; j++) {
                this.yAxes[j].getSize(this);
            }

            for (var x = 0; x < this.xAxes.length; x++) {
                this.xAxes[x].draw(this);
                if (this.xAxes.length > 1) {
                    this.xAxes[x].setColor(this, ColorPalette.color(x));
                }
            }
            for (var y = 0; y < this.yAxes.length; y++) {
                this.yAxes[y].draw(this);
                if (this.yAxes.length > 1) {
                    this.yAxes[y].setColor(this, ColorPalette.color(y));
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

        protected getAxisByName(axis: AxisType, ref: string): number {
            var axes: any;

            if (axis === AxisType.X) {
                axes = this.xAxes;
            }
            else {
                axes = this.yAxes;
            }

            if (ref != "") {
                for (var i = 0; i <  axes.length; i++) {
                    if (axes[i].name === ref) {
                        return i;
                    }
                }
            }
            return 0;
        }
    }
}