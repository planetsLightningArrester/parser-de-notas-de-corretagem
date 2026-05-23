if (typeof globalThis.DOMMatrix === 'undefined') {
  // @ts-expect-error: DOMMatrix is not standard in Node.js, so we polyfill it dynamically
  globalThis.DOMMatrix = class DOMMatrix {
    a = 1; b = 0; c = 0; d = 1; e = 0; f = 0;
  };
}

if (typeof globalThis.ImageData === 'undefined') {
  // @ts-expect-error: ImageData is not standard in Node.js, so we polyfill it dynamically
  globalThis.ImageData = class ImageData {};
}

if (typeof globalThis.Path2D === 'undefined') {
  // @ts-expect-error: Path2D is not standard in Node.js, so we polyfill it dynamically
  globalThis.Path2D = class Path2D {};
}

const originalWarn = console.warn;
console.warn = (...args: unknown[]) => {
  const msg = args[0];
  if (
    typeof msg === 'string' &&
    (msg.includes('Cannot polyfill') || msg.includes('Cannot access the `require` function'))
  ) {
    return;
  }
  originalWarn(...args);
};

export function restoreConsole(): void {
  console.warn = originalWarn;
}
