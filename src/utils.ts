/* eslint-disable no-undef */
// ? This is the same way as PDF JS knows if this is running in Web or Node
// ? The whole check shouldn't be tricky if the react testing library wasn't recognized as NodeJS, but it's
// ? That causes an error saying that the "worker 'https://cndjs...' isn't available"
// Copied from https://github.com/mozilla/pdf.js/blob/af64149885482cbbe577ef90abf06272f34327bb/src/shared/is_node.js#L21
export const isNodeJS =
  (typeof PDFJSDev === "undefined" || PDFJSDev.test("GENERIC")) &&
  typeof process === "object" &&
  process + "" === "[object process]" &&
  !process.versions.nw &&
  !(process.versions.electron && process.type && process.type !== "browser");