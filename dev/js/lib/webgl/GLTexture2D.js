/***
 *	GLTexture2D
 *
 *	Creates a basic 2d texture for WebGL.  Converts to a canvas properly sized as
 *	a power of 2.  Assumes RGBA format.
 *
 *	@param {WebGLContext} gl
 *	@param {image or canvas} image - actual image to turn into the texture
 *
 *	@prop {int} size
 *
 *	@method setImage(image)
 *		@param {image or canvas} image
 *		@returns {GLTexture2D} self
 *	@method getTexture()
 *		@returns {WebGLTexture} the actual texture object
 *	@method update() - rebinds data. Useful for updating a canvas
 *		@returns {GLTexture2D} self
 *	@method bind() - just an alias for gl.bindTexture without needing params
 *		@returns {GLTexture2D} self
 *	@method setActive(slot) - sets as an active texture and binds
 *		@param {int} WebGLTextureSlot - like `gl.TEXTURE0`.
 *		@returns {GLTexture2D} self
 */
// requirements

// settings

// the class
var GLTexture2D = function (gl, image) {
	this.gl = gl;
	if (image) {
		this.setImage(image);
	}
}
GLTexture2D.prototype = {
	setImage: function (image) {
		this.image = image;
		// determine size
		var size = 2;
		while (size < image.width || size < image.height) {
			size *= 2;
		}
		this.size = size;
		this.canvas = document.createElement('canvas');
		this.canvas.width = this.canvas.height = size;

		// ok, we have the image in a properly sized canvas
		// now make the actual texture
		this.texture = this.gl.createTexture();
		this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
		this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
		this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);

		this.update();

		return this;
	},
	getTexture: function () {
		return this.texture;
	},
	update: function () {
		var ctx = this.canvas.getContext('2d');
		ctx.drawImage(this.image, 0, 0, this.size, this.size);
		this.bind();
		this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, this.canvas);
		return this;
	},
	bind: function () {
		// bind the texture to this.gl context
		this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
		return this;
	},
	setActive: function (slot) {
		this.gl.activeTexture(slot);
		this.bind();
		return this;
	}
}

module.exports = GLTexture2D;
