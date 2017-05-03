"use strict";

import { Chart } from "./Chart";

export class SVGShape {

    protected chart: Chart;
    protected serie: number;
    protected svg: D3.Selection;
    protected svgLabels: D3.Selection;

    public animation: {
        duration: number,
        ease: string
    };
    public color: string;
    public labels: {
        format: string;
        rotate: boolean;
        visible: boolean;
    };
    public opacity: number;
    public x: (d: any, i: number, serie: number) => number;
    public y: (d: any, i: number, serie: number) => number;

    constructor(svg: D3.Selection, chart: Chart, serie: number) {
        this.chart = chart;
        this.serie = serie;
        this.svg = svg;

        this.animation = {
            duration: 0,
            ease: "linear"
        };
        this.color = "#000";
        this.labels = {
            format: "",
            rotate: false,
            visible: false
        };
        this.opacity = 1;
        this.x = null;
        this.y = null;
    }

    public draw(data: any): void {

    }

    public drawLabels(): void {
        this.svgLabels = this.svg.append("g")
            .attr("id", "labels-" + this.serie)
            .attr("opacity", "1");
    }

    public showLabels(): void {
        this.svg.selectAll("#labels-" + this.serie)
            .attr("opacity", "1");
    }

    public hideLabels(): void {
        this.svg.selectAll("#labels-" + this.serie)
            .attr("opacity", "0");
    }
}