# canvas.toBlob WebP Polyfill

Google Chrome and MS Edge > 18 can creata a WebP Blob representing the
image contained in a canvas:
```
canvas.toBlob(callback, 'image/webp', 0.8);
``` 
This polyfill adds the ability to do the same on browsers that
do not support this natively (Firefox, Safari, MS Edge <= 18 and others).
It creates a WebP blob from the canvas' pixel data, through a web worker.
The web worker calls a WebAssembly WebP encoder to make a WebP blob.
The WebP encoder used is:
https://github.com/saschazar21/webassembly/tree/master/packages/webp

## [Live Demo](https://av01d.github.io/toblob-webp-polyfill/index.html)

## Table of contents
- [Getting started](#getting-started)
- [Browser support](#browser-support)
- [Real world examples](#real-world-examples)
- [License](#license)

## Getting started

### Installation

Copy the files in the `dist` directory in your document root.
Include `dist/toblob-webp-polyfill.js' in your page:
```html
<script src="/path/to/dist/toblob-webp-polyfill.js"></script>
```

That's it!

### Usage

Simply call `canvas.toBlob` with the `image/webp` mimetype, and an optional `quality` argument:

```
const canvas = document.querySelector('canvas');
const img = new Image();
canvas.toBlob(function(blob) {
	const url = window.URL || window.webkitURL;
	img.src = url.createObjectURL(blob);
}, 'image/webp', 0.8);

```

[⬆ back to top](#table-of-contents)

## Browser support

- Firefox and Safari: this polyfill enables saving the image on a canvas as a WebP image.
- Chrome: saving the image on a canvas as WebP image is supported natively: this polyfill remains dormant
- MS Edge > 18: saving the image on a canvas as WebP image is supported natively: this polyfill remains dormant
- MS Edge <= 18: This browser doesn't have `canvas.toBlob`. This polyfill provides an alternative `canvas.toBlob` implementation *and* allows you to save a canvas as `image/webp`.
- Internet Explorer: Not supported (on all versions)

[⬆ back to top](#table-of-contents)

## Real world examples

This Polyfill is used (among others) on the following websites:

- [PhotoEditor.com](https://www.photoeditor.com/)
- [PhotoFilters.com](https://www.photofilters.com/)

[⬆ back to top](#table-of-contents)

## License

This plugin is released under the MIT license. It is simple and easy to understand and places almost no restrictions on what you can do with the code.
[More Information](http://en.wikipedia.org/wiki/MIT_License)

The development of this plugin was funded by [Zygomatic](https://www.zygomatic.nl/).

[⬆ back to top](#table-of-contents)
