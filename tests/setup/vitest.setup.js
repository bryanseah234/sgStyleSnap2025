// Basic jsdom and canvas/Image mocks for tests that use DOM APIs

if (typeof global.window === 'undefined') {
  // @ts-ignore
  global.window = {};
}

if (typeof global.document === 'undefined') {
  // @ts-ignore
  global.document = {
    createElement: (tag) => {
      if (tag === 'canvas') {
        return {
          getContext: () => ({
            drawImage: () => {},
            getImageData: () => ({ data: new Uint8ClampedArray(4) })
          }),
          width: 0,
          height: 0
        }
      }
      return {};
    }
  }
}

if (typeof global.Image === 'undefined') {
  // @ts-ignore
  global.Image = class MockImage {
    set src(_) {
      setTimeout(() => {
        if (typeof this.onload === 'function') this.onload();
      }, 0)
    }
  }
}


