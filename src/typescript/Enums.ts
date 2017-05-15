"use strict";

export enum AxisType {
    X,
    Y
}
export enum GridLineType {
    None,
    Major,
    Minor
}

export enum ScaleType {
    Linear,
    Ordinal,
    Time
}

export enum StackType {
    None,
    Normal,
    Percent
}

export type MarkerType =
    "circle" |
    "cross" |
    "diamond" |
    "square" |
    "triangle-up" |
    "triangle-down" |
    "mixed";

export type OrientationType =
    "bottom" |
    "left" |
    "right" |
    "top" |
    "";

export var SymbolType =
    ["circle",
    "cross",
    "diamond",
    "square",
    "triangle-up",
    "triangle-down"];
