/**
 *  framebuffers that render to textures, so multiple passes can happen
 */
// requirements

// settings

// objects
/***
 *  GLTextureFramebuffer
 *
 *  @param {WebGLContext} gl
 *  @param {number} width
 *  @param {number} height
 *
 *  @method use() - sets as active framebuffer
 *  @method getTexture() - gets the texture instance for use
 *    @returns {WebGLTexture2d}
 */
var GLTextureFramebuffer = function (gl, width, height) {
  this.gl = gl;
  this.width = width;
  this.height = height;

  this.texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, this.texture);
  // basic params
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);

  this.renderbuffer = gl.createRenderbuffer();
  gl.bindRenderbuffer(gl.RENDERBUFFER, this.renderbuffer);
  gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height);

  this.framebuffer = gl.createFramebuffer();
  gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);

  // attach texture to framebuffer
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.texture, 0);
	gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, this.renderbuffer);
}
GLTextureFramebuffer.prototype = {
  use: function () {
    this.gl.bindRenderbuffer(this.gl.RENDERBUFFER, this.renderbuffer);
    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.framebuffer);
    this.gl.viewport(0, 0, this.width, this.height);
  },
  getTexture: function () {
    return this.texture;
  }
}

GLTextureFramebuffer.create = function (gl, width, height) {
  return new GLTextureFramebuffer(gl, width, height);
}

module.exports = GLTextureFramebuffer;
