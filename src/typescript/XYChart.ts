/// <reference path="_References.ts" />

"use strict";

module frnk.UI.Charts {
    export class XYChart extends Chart {
        public xAxis: XAxis;
        public yAxis: YAxis;

        constructor(args: any, selector: string) {
            super(args, selector);
            this.xAxis = new XAxis(args, this);
            this.yAxis = new YAxis(args, this);
        }

        public draw(): void {
            super.draw();
            this.xAxis.draw(this);
            this.yAxis.draw(this);
        }
    }
}