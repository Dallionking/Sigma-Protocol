// Shim for import.meta
if (typeof global.import === 'undefined') {
  // @ts-ignore
  global.import = {};
}

// @ts-ignore
if (typeof global.import.meta === 'undefined') {
  // @ts-ignore
  global.import.meta = { url: '' };
}

