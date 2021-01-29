/**
 * canvas.toBlob image/webp polyfill.
 *
 * Google Chrome and MS Edge > 18 can creata a WebP Blob representing the
 * image contained in a canvas.
 *
 * - canvas.toBlob(callback, 'image/webp', 0.8)
 *
 * This polyfill adds the ability to do the same on browsers that
 * do not support this natively (Firefox, Safari, MS Edge <= 18 and others).
 * It creates a WebP blob from the canvas' pixel data, through a web worker.
 * The web worker calls a WebAssembly WebP encoder to make a WebP blob.
 * The WebP encoder used is:
 * https://github.com/saschazar21/webassembly/tree/master/packages/webp
 *
 * Made by Arjan Haverkamp, https://www.webgear.nl
 * Copyright 2021 Arjan Haverkamp
 * MIT Licensed
 * @version 1.0 - 2021-01-29
 * @url https://github.com/av01d/toblob-webp-polyfill
 */

(function() {

if (typeof importScripts != 'function') {
	// This is the parent script (not the web worker)

	// Whether or not to support alpha channels.
	// When false, the .webp image will not have opacity.
	const useAlpha = true;

	// Default options for the WebP encoder.
	// Modify only when there's good reason to.
	const webpOptions = {
		quality: 75,
		target_size: 0,
		target_PSNR: 0,
		method: 4,
		sns_strength: 50,
		filter_strength: 60,
		filter_sharpness: 0,
		filter_type: 1,
		partitions: 0,
		segments: 4,
		pass: 1,
		show_compressed: 0,
		preprocessing: 0,
		autofilter: 0,
		partition_limit: 0,
		alpha_compression: 1,
		alpha_filtering: 1,
		alpha_quality: 100,
		lossless: 0,
		exact: 0,
		image_hint: 0,
		emulate_jpeg_size: 0,
		thread_level: 0,
		low_memory: 0,
		near_lossless: 100,
		use_delta_palette: 0,
		use_sharp_yuv: 0
	};

	// Check whether the browser has built-in support for saving canvas as image/webp.
	// If so, this polyfill can remain dormant.
	const hasWebp = (function() {
		const elem = document.createElement('canvas');
		if (!!(elem.getContext && elem.getContext('2d'))) {
			return elem.toDataURL('image/webp').indexOf('data:image/webp') == 0;
		}
		return false;
	}());

	if (hasWebp) {
		// Nothing to do, browser has built-in image/webp support.
		return;
	}

	//
	// HTMLCanvasElement.toBlob polyfill
	//
	const toBlob_org = HTMLCanvasElement.prototype.toBlob;
	Object.defineProperty(HTMLCanvasElement.prototype, 'toBlob', {
		value: function (callback, type, quality) {
			if ('image/webp' == type) {
				// Invoke polyfill for mimetype 'image/webp'
				makeBlob(this, quality)
				.then(function(blob) {
					callback(blob);
				})
			}
			else {
				if (!toBlob_org) {
					// Old Edge (<= 18) doesn't have canvas.toBlob at all.
					// Work around it using an alternative implementation.
					const canvas = this,
						binStr = atob(canvas.toDataURL(type, quality).split(',')[1]),
						len = binStr.length, arr = new Uint8Array(len);
					for (let i = 0; i < len; i++) {
						arr[i] = binStr.charCodeAt(i);
					}
					callback(new Blob([arr], {type: type || 'image/png'}));
				}
				else {
					// Invoke browser's default toBlob for mimetypes != 'image/webp'
					return toBlob_org.apply(this, arguments)
				}
			}
		}
	});

	//
	// Convert a canvas to a webp blob, using a web worker
	//
	const scriptPath = document.currentScript.src;
	const makeBlob = function(canvas, quality) {
		const worker = new Worker(scriptPath),
			ctx = canvas.getContext('2d'),
			w = canvas.width, h = canvas.height,
			imgData = ctx.getImageData(0, 0, w, h),
			data = useAlpha ? imgData.data : imgData.data.filter((_, i) => i % 4 !== 3),
			options = Object.assign(webpOptions, {quality:quality*100});

		return new Promise((resolve, reject) => {
			worker.onmessage = function(e) {
				resolve(e.data);
			}
			worker.postMessage({options, data, width:w, height:h, useAlpha});
		});
	};

}
else {
	// This is the web worker
	importScripts('wasm_webp.min.js');
	onmessage = function(e) {
		wasm_webp()
		.then(function(encoder) {
			const blob = new Blob([encoder.encode(e.data.data, e.data.width, e.data.height, e.data.useAlpha ? 4 : 3, e.data.options)], { type:'image/webp' });
			encoder.free();
			postMessage(blob);
		});
	}
}

})();
