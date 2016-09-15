/**
 *  Namespace for starting and storing WebGL programs
 */
// requirements

// settings

// storage
var GLPrograms = {};
var activeProgram;

// classes
/***
 *  GLProgram
 *
 *  @param {string} name
 *  @param {WebGLContext} gl
 *  @param {Array} of {WebGLShaders}
 *
 *  @method use
 *    @returns {GLProgram} self
 *  @method addAttribute
 *    @param {string} varName
 *  @prop attributes
 *    object of attribLocations for the attribute of a given name. example: myGLProgram.attributes.aVertexPosition
 *  @prop uniforms
 *    object of uniformLocations for the uniform of a given name. example: myGLProgram.uniforms.uMyTexture
 */
var GLProgram = function (name, gl, shaders) {
  var program = gl.createProgram();
  shaders.forEach(function (s) {
    gl.attachShader(program, s);
  });
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
	  console.error("Unable to initialize the shader program: " + gl.getProgramInfoLog(program));
    return null;
	}
  this.gl = gl;
  this.program = program;
  this.attributeNames = [];
  this.uniformNames = [];
  this.attributes = {};
  this.uniforms = {};

  // save for later
  GLPrograms[name] = this;
}
GLProgram.prototype = {
  use: function () {
    this.gl.useProgram(this.program);
    // enable all attributes
    for (var i = 0, len = this.attributeNames.length; i < len; i++) {
      this.attributes[this.attributeNames[i]] = this.gl.getAttribLocation(this.program, this.attributeNames[i]);
      this.gl.enableVertexAttribArray(this.attributes[this.attributeNames[i]]);
    }
    // enable all uniforms
    for (var i = 0, len = this.uniformNames.length; i < len; i++) {
      this.uniforms[this.uniformNames[i]] = this.gl.getUniformLocation(this.program, this.uniformNames[i]);
    }
		activeProgram = this;
    return this;
  },
  addAttribute: function (name) {
    this.attributeNames.push(name);
  },
  addUniform: function (name) {
    this.uniformNames.push(name);
  }
}

// static functions
/**
 *  create
 *  @param {string} name
 *  @param {WebGLContext} gl
 *  @param {Array} of {WebGLShaders} program shaders
 *  [@param {Array} of {string}s] attribute names
 *  [@param {Array} of {string}s] uniform names
 */
GLProgram.create = function createProgramFromShaders (name, gl, shaders, attributeNames, uniformNames) {
  var glp = new GLProgram (name, gl, shaders);
  if (attributeNames && attributeNames instanceof Array) {
    for (var i = 0, len = attributeNames.length; i < len; i++) {
      glp.addAttribute(attributeNames[i]);
    }
  }
  if (uniformNames && uniformNames instanceof Array) {
    for (var i = 0, len = uniformNames.length; i < len; i++) {
      glp.addUniform(uniformNames[i]);
    }
  }
  return glp;
}
/**
 *  get
 *  @param {string} name
 *  @returns {GLProgram} or NULL
 */
GLProgram.get = function getGLProgramByName (name) {
  return GLPrograms[name] || null;
}
/**
 *	getActiveProgram
 *	@returns {GLProgram} or undefined
 */
GLProgram.getActiveProgram = function getActiveProgram () {
	return activeProgram;
}

module.exports = GLProgram;
