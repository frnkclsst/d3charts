"use strict";

export function getHeight(svg: any): number {
    return svg.node().getBoundingClientRect().height;
}

export function getWidth(svg: any): number {
    return svg.node().getBoundingClientRect().width;
}

export function align (svg: any, width: number, alignment: string, margin: number): number {
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

export function valign(svg: any, height: number, alignment: string, margin: number): number {
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