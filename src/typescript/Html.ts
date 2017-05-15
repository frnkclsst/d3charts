"use strict";

export function getHeight(svg: d3.Selection<SVGElement>): number {
    let node = <HTMLElement>svg.node();
    return node.getBoundingClientRect().height;
}

export function getWidth(svg: d3.Selection<SVGElement>): number {
    let node = <HTMLElement>svg.node();
    return node.getBoundingClientRect().width;
}

export function align (svg: d3.Selection<SVGElement>, width: number, alignment: string, margin: number): number {
    var x: number = 0;
    switch (alignment) {
        case "left":
            x = 0 + margin;
            break;
        case "center":
            x = (width - this.getWidth(svg)) / 2;
            break;
        case "right":
            x = width - this.getWidth(svg) - margin;
            break;
    }
    return x;
}

export function valign(svg: d3.Selection<SVGElement>, height: number, alignment: string, margin: number): number {
    var y: number = 0;
    switch (alignment) {
        case "top":
            y = 0 + margin;
            break;
        case "middle":
            y = (height - this.getHeight(svg)) / 2;
            break;
        case "bottom":
            y = height - this.getHeight(svg) - margin;
            break;
    }
    return y;
}
