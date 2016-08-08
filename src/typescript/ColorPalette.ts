/// <reference path="_References.ts" />

"use strict";

module frnk.UI.Charts.ColorPalette {

    export function getColor(i: number): string {
        var _colors =
            [
                "#5491F6",
                "#7AC124",
                "#FFA300",
                "#129793",
                "#F16A73",
                "#1B487F",
                "#FF6409",
                "#CC0000",
                "#8E44AD",
                "#936A4A",
                "#2C5195",
                "#4B7717",
                "#D58A02",
                "#005D5D",
                "#BD535B",
                "#123463",
                "#980101",
                "#D85402",
                "#622E79",
                "#60452F"
            ];
        return _colors[i];
    }

    export function getFillColor(i: number): string {
        var _fillColors =
            [
                "#C9DCFE",
                "#D6EEAF",
                "#FFE4AF",
                "#B6E0DE",
                "#FCD2D4",
                "#BAC8D9",
                "#FFD0B0",
                "#F1B2B1",
                "#DDC6E7",
                "#DED2C7",
                "#BFCAE0",
                "#C9D7B8",
                "#F3DDB1",
                "#B1CECE",
                "#ECCBCD",
                "#B7C2D1",
                "#E1B2B1",
                "#F4CBB1",
                "#D0BFD8",
                "#CFC7C0"
            ];
        return _fillColors[i];
    }
}