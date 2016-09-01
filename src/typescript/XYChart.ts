/// <reference path="_References.ts" />

"use strict";

module frnk.UI.Charts {
    export class XYChart extends Chart {
        public xAxes: XAxis[] = [];
        public yAxes: YAxis[] = [];

        constructor(settings: ISettings, selector: string) {
            super(settings, selector);

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
            }

            for (var j = 0; j < this.yAxes.length; j++) {
                this.yAxes[j].draw(this);
            }
        }

        public getXCoordinate(serie: number): any {
            // child classes are responsible for implementing this method
        }

        public getYCoordinate(serie: number): any {
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