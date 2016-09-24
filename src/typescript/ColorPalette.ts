/// <reference path="_References.ts" />

"use strict";

module frnk.UI.Charts.ColorPalette {

    /* TODO - load colors from config
    d3.json("/config/colors.config", function(data: any): void {
        console.log(data[0]);
    });
    */

    var custom = d3.scale.ordinal()
        .range([
            "#5491F6", //  1
            "#7AC124", //  2
            "#FFA300", //  3
            "#129793", //  4
            "#F16A73", //  5
            "#1B487F", //  6
            "#FF6409", //  7
            "#CC0000", //  8
            "#8E44AD", //  9
            "#936A4A", // 10
            "#2C5195", // 11
            "#4B7717", // 12
            "#D58A02", // 13
            "#005D5D", // 14
            "#BD535B", // 15
            "#123463", // 16
            "#980101", // 17
            "#D85402", // 18
            "#622E79", // 19
            "#60452F"  // 20
        ]);

    export var color = custom;
}