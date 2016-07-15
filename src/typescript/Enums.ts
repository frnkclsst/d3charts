/// <reference path="_References.ts" />

"use strict";

module frnk.UI.Charts {
    export type OrientationType =
        "bottom" |
        "left" |
        "right" |
        "top";

    export enum GridLineType {
        None,
        Major,
        Minor
    }

    export enum StackType {
        None,
        Normal,
        Percent
    }

    export enum ScaleType {
        Linear,
        Ordinal,
        Time
    }
}