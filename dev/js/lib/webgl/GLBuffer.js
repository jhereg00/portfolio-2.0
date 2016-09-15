/**
 *  WebGL Buffer objects to handle common buffer actions
 */
// requirements

// settings

// classes
/**
 *  GLBuffer
 *  static @method create
 *    @param {WebGLContext} gl
 *    @param {int from WebGLBufferType enum} bufferType
 *    @param {int} size - A GLint specifying the number of components per vertex attribute. Must be 1, 2, 3, or 4.
 *    [@param {int from enum} dataType] - A GLenum specifying the data type of each component in the array. Must be one of: gl.BYTE, gl.UNSIGNED_BYTE, gl.SHORT, gl.UNSIGNED_SHORT, gl.FIXED, gl.FLOAT.
 *    [@param {int from enum} normalized ]- gl.TRUE or gl.FALSE
 *    [@param {int} stride] - A GLsizei specifying the offset in bytes between the beginning of consecutive vertex attributes.
 *    [@param {int} offset] - A GLintptr specifying an offset in bytes of the first component in the vertex attribute array. Must be a multiple of type.
 *  @method bind - binds buffer to its WebGLContext so things can be done to it
 *  @method bindToAttribute
 *    @param {int} attribute position to pass to gl.vertexAttribPointer
 *  @method bindData
 *    @param {Array} data to bind
 *    [@param {int from enum}] draw type, defaults to gl.STATIC_DRAW
 *  @prop buffer - the actual WebGLBuffer
 */
var GLBuffer = function (gl, bufferType, size, dataType, normalized, stride, offset) {
  this.gl = gl;
  this.type = bufferType;
  this.attribSettings = {
    size: size,
    type: dataType,
    normalized: normalized,
    stride: stride,
    offset: offset
  }

  this.buffer = gl.createBuffer();
}
GLBuffer.prototype = {
  bind: function () {
    this.gl.bindBuffer(this.type, this.buffer);
  },
  bindToAttribute: function (position) {
    this.bind();
    this.gl.vertexAttribPointer(
      position,
      this.attribSettings.size,
      this.attribSettings.type,
      this.attribSettings.normalized,
      this.attribSettings.stride,
      this.attribSettings.offset
    );
  },
  bindData: function (data, drawType) {
    this.bind();
    if (data instanceof Array)
      data = new Float32Array(data);
    this.gl.bufferData(this.type, data, drawType || this.gl.STATIC_DRAW);
  }
}

GLBuffer.create = function createGLBuffer (gl, bufferType, size, dataType, normalized, stride, offset) {
  return new GLBuffer (
    gl,
    bufferType,
    size,
    dataType || gl.FLOAT,
    normalized || gl.FALSE,
    stride || 0,
    offset || 0
  );
}

module.exports = GLBuffer;
