/// <reference path="_References.ts" />

"use strict";

module frnk.UI.Charts {
    export enum AxisType {
        X,
        Y
    }
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

    export type OrientationType =
        "bottom" |
        "left" |
        "right" |
        "top" |
        "";

    export type MarkerType =
        "circle" |
        "cross" |
        "diamond" |
        "square" |
        "triangle-up" |
        "triangle-down";
}