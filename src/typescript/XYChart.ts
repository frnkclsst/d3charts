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
            // TODO - Refactor
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

        protected getXAxisByName(name: string): number {
            if (name != "") {
                for (var i = 0; i <  this.xAxes.length; i++) {
                    if (this.xAxes[i].name == name) {
                        return i;
                    }
                }
            }
            return 0;
        }

        protected getYAxisByName(name: string): number {
            if (name != "") {
                for (var i = 0; i <  this.yAxes.length; i++) {
                    if (this.yAxes[i].name == name) {
                        return i;
                    }
                }
            }
            return 0;
        }

        private _setXAxes(axes: any): YAxis[] {
            var array: XAxis[] = [];
            if (axes.length != undefined && axes != "") {
                for (var i = 0; i < axes.length; i++) {
                    array.push(new XAxis(axes[i], this));
                }
            }
            else {
                array.push(new XAxis(axes, this));
            }
            return array;
        }

        private _setYAxes(axes: any): YAxis[] {
            var array: YAxis[] = [];
            if (axes.length != undefined && axes != "") {
                for (var i = 0; i < axes.length; i++) {
                    array.push(new YAxis(axes[i], this));
                }
            }
            else {
                array.push(new YAxis(axes, this));
            }
            return array;
        }
    }
}