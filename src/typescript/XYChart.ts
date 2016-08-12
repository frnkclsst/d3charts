/// <reference path="_References.ts" />

"use strict";

module frnk.UI.Charts {
    export class XYChart extends Chart {
        public xAxes: XAxis[] = [];
        public yAxes: YAxis[] = [];

        constructor(settings: ISettings, selector: string) {
            super(settings, selector);

            this.xAxes =  this.settings.xAxes;
            this.yAxes = this.settings.yAxes;
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
            // child classes are responsible for implementing this method
        }

        public getYCoordinate(serie: number): any {
            // child classes are responsible for implementing this method
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
    }
}