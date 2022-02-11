const ImageHandling = (type, img) => {
	// Creates a new image object
	var image = new Image();
	image.src = img;

	// Creates a canvas for the manipulation of the image
	var canvas = document.createElement('canvas');
	var imgWidth = image.naturalWidth;
	var imgHeight = image.naturalHeight;
	var size = 0;

	// Sets the size of the image depending on the type of it
	if (type === 'profile') {
		size = 250;

		var smallerSide = Math.min(imgWidth, imgHeight);

		// Sets the starting point of the crop to get the largest center square of the image
		const sx = imgWidth / 2 - smallerSide / 2;
		const sy = imgHeight / 2 - smallerSide / 2;

		// Sets the size of the canvas
		canvas.width = size;
		canvas.height = size;
		canvas
			.getContext('2d')
			.drawImage(image, sx, sy, smallerSide, smallerSide, 0, 0, size, size); // Crops the image
	} else if (type === 'post') {
		var height = imgHeight;
		var width = imgWidth;
		var finalHeight = 0;
		var finalWidth = 0;
		var aspectRatio = 4 / 3;
		var sx = 0;
		var sy = 0;

		size = 800;

		// Sizes of image for 4:3 ratio
		if (imgWidth / imgHeight > aspectRatio) {
			width = imgHeight * aspectRatio;
			sx = (imgWidth - width) / 2;
		} else if (imgWidth / imgHeight < aspectRatio || imgWidth === imgHeight) {
			height = imgWidth / aspectRatio;
			sy = (imgHeight - height) / 2;
		}

		finalHeight = size / aspectRatio;
		finalWidth = size;

		canvas.width = finalWidth;
		canvas.height = finalHeight;
		canvas
			.getContext('2d')
			.drawImage(image, sx, sy, width, height, 0, 0, finalWidth, finalHeight);
	}
	var dataUrl = canvas.toDataURL('image/jpeg', 0.7); // Saves as a jpeg with the 70% quality of the original image
	var resizedImage = dataURLToBlob(dataUrl);
	return resizedImage;
};

// Creates a blob from the data url
const dataURLToBlob = (dataURL) => {
	var BASE64_MARKER = ';base64,';
	var parts;
	var contentType;
	var raw;
	var rawLength;

	if (dataURL.indexOf(BASE64_MARKER) === -1) {
		parts = dataURL.split(',');
		contentType = parts[0].split(':')[1];
		raw = parts[1];

		return new Blob([raw], { type: contentType });
	}

	parts = dataURL.split(BASE64_MARKER);
	contentType = parts[0].split(':')[1];
	raw = window.atob(parts[1]);

	rawLength = raw.length;

	var uInt8Array = new Uint8Array(rawLength);

	for (var i = 0; i < rawLength; ++i) {
		uInt8Array[i] = raw.charCodeAt(i);
	}

	return new Blob([uInt8Array], { type: contentType });
};

export default ImageHandling;
