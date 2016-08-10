/// <reference path="_References.ts" />

"use strict";

module frnk.UI.Charts {
    export class XYChart extends Chart {
        public xAxes: XAxis[] = [];
        public yAxes: YAxis[] = [];

        constructor(args: any, selector: string) {
            super(args, selector);

            this.xAxes =  this._setXAxes(this.settings.getValue("xAxis"));
            this.yAxes = this._setYAxes(this.settings.getValue("yAxis"));
        }

        public draw(): void {
            super.draw();
            for (var i = 0; i < this.xAxes.length; i++) {
                this.xAxes[i].draw(this);
            }
            for (var j = 0; j < this.yAxes.length; j++) {
                this.yAxes[j].draw(this);
            }
        }

        public getXCoordinate(serie: number): any {
        }

        public getYCoordinate(serie: number): any {

        }

        private _setXAxes(axes: any): YAxis[] {
            var array: XAxis[] = [];
            for (var i = 0; i < axes.length; i++) {
                array.push(new XAxis(axes[i], this));
            }
            return array;
        }

        private _setYAxes(axes: any): YAxis[] {
            var array: YAxis[] = [];
            for (var i = 0; i < axes.length; i++) {
                array.push(new YAxis(axes[i], this));
            }
            return array;
        }
    }
}