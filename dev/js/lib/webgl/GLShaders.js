/**
 *  Namespace for loading and storing WebGL shaders
 */
// requirements
var AjaxRequest = require('lib/AjaxRequest');

// settings

// storage
var shaderRequests = {};
var glContexts = [];
var loadedShaders = [];

// important functions
/***
 *  loadFileContents
 *
 *  loads a file's source
 *
 *  @param {string} path
 *  @param {function} callback - fires on complete
 *  @param {boolean} bustCache - whether to add a cache busting param
 */
var loadFileContents = function (path, cb, bustCache) {
  if (!shaderRequests[path])
	 	shaderRequests[path] = new AjaxRequest (bustCache ? path + '?cache=' + new Date().getTime() : path, {
		    complete: cb
		  });
	else
		shaderRequests[path].addStateListener(AjaxRequest.readyState.DONE, cb);
	return shaderRequests[path];
}

/***
 *  loadAndInitShader
 *
 *  loads a shader from a file, then initializes it
 *
 *  @param {WebGLContext} gl
 *  @param {int} WebGL - Shader type (use the enum), gl.VERTEX_SHADER || gl.FRAGMENT_SHADER
 *  @param {string} shader name
 *  @param {string} shader file path
 *  @param {function} callback
 */
var loadAndInitShader = function (gl, type, name, path, cb) {
	// establish a place to save the shaders
	var index = glContexts.indexOf(gl);
	if (index === -1) {
		index = glContexts.length;
		glContexts.push(gl);
		loadedShaders[index] = {};
	}
  return loadFileContents (path, function (responseText, xhttp) {
    if (/^(2|3)/.test(xhttp.status.toString()) && responseText) {
      // got something
      var shader = gl.createShader(type);
      gl.shaderSource(shader, responseText);
      gl.compileShader(shader);
      // any errors?
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error("An error occurred compiling the shaders (" + name + "): \n" + gl.getShaderInfoLog(shader));
      }
      loadedShaders[index][name] = shader;
      if (cb && typeof cb === 'function')
        cb(shader);
    }
    else if (cb && typeof cb === 'function') {
      console.error("An error occurred loading the shaders: " + name);
      loadedShaders[index][name] = null;
      cb(null);
    }
  });
}

/***
 *  loadAll
 *
 *  loads a bunch of shaders at once
 *
 *  @param {WebGLContext} gl
 *  @param {2DArray} list - Array of Arrays with `[type, name, path]`
 *  @param {function} callback
 *    @param {boolean} success
 */
var loadAll = function (gl, toLoad, cb) {
  var success = true; // assume we'll succeed until proven otherwise
  var requests = [];
  var checkDone = function (shader) {
    if (!shader)
      success = false;

		var index = glContexts.indexOf(gl);
    for (var i = 0, len = toLoad.length; i < len; i++) {
			// can use === undefined because we set failures to null
      if (loadedShaders[index][toLoad[i][1]] === undefined) {
        return false;
      }
    }
    // done, so call our callback
    cb (success);

    return true;
  }

  // make the calls
  for (var j = 0, len = toLoad.length; j < len; j++) {
    requests.push(loadAndInitShader(gl, toLoad[j][0], toLoad[j][1], toLoad[j][2], checkDone));
  }
}

/***
 *  getShader
 *
 *  gets an already loaded shader
 *
 *	@param {WebGLContext} gl
 *  @param {string} name
 */
var getShader = function (gl, name) {
	var index = glContexts.indexOf(gl);
  return loadedShaders[index][name];
}

module.exports = {
  loadAndInitShader: loadAndInitShader,
  loadAndInit: loadAndInitShader,
  loadAll: loadAll,
  getShader: getShader,
  get: getShader
}
