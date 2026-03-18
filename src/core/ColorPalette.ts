/**
 * Provides a cyclic color palette for series rendering.
 *
 * Colors are indexed by series position and wrap around automatically when
 * there are more series than colors in the palette.
 */
export class ColorPalette {
  private readonly _colors: string[];

  /**
   * @param colors - Ordered array of hex or CSS color strings.
   *   Typically sourced from `resolvedOptions.plotOptions.colors`.
   */
  public constructor(colors: string[]) {
    this._colors = colors;
  }

  /**
   * Returns the color for the given series index, cycling if necessary.
   * @param index - Zero-based series index.
   */
  public color(index: number): string {
    return this._colors[index % this._colors.length];
  }
}
