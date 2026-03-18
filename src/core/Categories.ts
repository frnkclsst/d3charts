import * as d3 from "d3";

/**
 * Holds the category labels that form the X axis domain (or Y axis domain for bar charts).
 *
 * Categories are the shared "columns" of the data matrix — each category corresponds to
 * one data point in every series (e.g. months, product names, dates).
 *
 * The `format` string controls how raw label strings are interpreted:
 * - `"%s"` — plain strings (ordinal / categorical axis).
 * - Any d3 time-format string (e.g. `"%Y-%m-%d"`) — parsed to `Date` objects for a time axis.
 */
export class Categories {
  /** The format string used to parse or display category labels. */
  public format: string;
  /** Number of categories. */
  public length: number;

  private readonly _items: string[];

  public constructor(data: string[], format: string) {
    this._items = [...data];
    this.format = format;
    this.length = this._items.length;
  }

  /**
   * Returns the raw string label at position `i`.
   * @param i - Zero-based category index.
   */
  public getItem(i: number): string {
    return this._items[i];
  }

  /**
   * Parses a raw category string according to `this.format`.
   *
   * - Returns the string unchanged when `format` is `"%s"` or `"%n"`.
   * - Returns a `Date` when the format is a valid d3 time-parse pattern.
   * - Falls back to the original string if parsing fails.
   *
   * @param value - Raw category label string.
   * @returns The parsed value (string or Date).
   */
  public parseFormat(value: string): string | Date {
    if (this.format === "%s" || this.format === "%n") {
      return value;
    }
    const parsed = d3.timeParse(this.format)(value);
    return parsed ?? value;
  }

  /** All category labels as an ordered array. */
  public get labels(): string[] {
    return this._items;
  }
}
