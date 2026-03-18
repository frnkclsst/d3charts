/**
 * Stubs for SVG/DOM APIs that jsdom does not implement.
 * Call `stubSvgLayout()` in a `beforeEach` in every integration test file.
 */

export function stubSvgLayout(): void {
  // Axis overlap detection calls getBBox() on <text> elements.
  Object.defineProperty(SVGElement.prototype, "getBBox", {
    value: () => ({ x: 0, y: 0, width: 50, height: 12 }),
    writable: true,
    configurable: true,
  });

  // getWidth / getHeight (used for axis sizing) call getBoundingClientRect().
  Object.defineProperty(SVGElement.prototype, "getBoundingClientRect", {
    value: () => ({ x: 0, y: 0, width: 50, height: 12, top: 0, right: 50, bottom: 12, left: 0 }),
    writable: true,
    configurable: true,
  });

  // Line animation calls getTotalLength() on <path> elements.
  Object.defineProperty(SVGElement.prototype, "getTotalLength", {
    value: () => 100,
    writable: true,
    configurable: true,
  });

  // ResizeObserver is not available in jsdom.
  global.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}

/** Injects a clean chart container into the document body. */
export function setupContainer(): void {
  document.body.innerHTML =
    '<div id="chart" style="width:800px;height:400px;position:relative;"></div>';
}
