/***
 *	HalftoneGL
 *
 *  A single instance of HalftoneGL for converting an image to a multilayered
 *  halftone using WebGL.  Creates a canvas, but doesn't actually put it anywhere.
 *
 *	@param {string} imagePath
 *	@param {boolean} darkTop - pass true if you want the darkest layer to be the top
 *
 *  @method appendTo - appends canvas to a `DOMElement`
 *    @param {DOMElement} target
 *  @method prependTo - makes canvas the first child of a `DOMElement`
 *    @param {DOMElement} target
 *	@method setSize - defines size for the canvas in pixels
 *		@param {number} x
 *		@param {number} y
 *	@method setImage - sets what image to show
 *		@param {string} path to image - must be on same domain or implodes
 *	@method draw - draws all layers of the halftone
 *	@method drawLayer - draws a single layer of the halftone
 *		@param {int} layer - number between 0 and `layers.length`, with
 *			`layer[layers.length]` being the actual image
 *	@method setFade()
 *		@param {float} black offset
 *		@param {float} white offset
 *	@method animIn()
 *		@param {int} duration in ms
 *	@method animOut()
 *		@param {int} duration in ms
 *
 *	@static {function} setLayerColors - sets the colors for the layers, and how
 *		many layers based on number passed.
 *		@param {Array} layerColors - array of strings which are the color for the
 *			layer. How many you pass defines how many layers to use.
 *		@param {float} layerOverlap - number between 0 and 1 (anything above .5
 *			looks silly, though) for what percentage of depth the layers should share
 *
 *	TODO:
 *	@event shadersReady - fires when shaders finish loading
 *	@event programsReady - fires when the programs finish getting built
 *	@event layersReady - fires when all the layers finish getting built
 *	@event imageReady - fires when the image is ready to use
 *	@event ready - fires when capable of drawing
 */

// requirements
var windowSize = require('lib/windowSize');
var GLShaders = require('lib/webgl/GLShaders');
var GLProgram = require('lib/webgl/GLProgram');
var GLBuffer = require('lib/webgl/GLBuffer');
var GLTexture2D = require('lib/webgl/GLTexture2D');

var AnimatedValue = require('lib/AnimatedValue');
var eases = require('lib/eases');

// settings
var MIN_SIZE = 0;
var MAX_SIZE = 16;
//var SPACING = MAX_SIZE;
var LAYER_COLORS = [
	//'#011c1f',
	//'#013C40',
	'#014c51',
	'#02787F'
];
var LAYER_OVERLAP = 0.05; // percentage of luminosity depth layers should overlap

// store
var halftoneGls = [];

//////////////////////////////////////////////////////
//	make sprite canvases, and define setLayerColors
//////////////////////////////////////////////////////
var layerSprites;
var layerDepths;
function setLayerColors (layerColors, overlap) {
	layerSprites = [];
	layerDepths = [];
	overlap = overlap !== undefined ? overlap : LAYER_OVERLAP;
	var dark = 0,
			light;
	var lumDepth = 1 / (layerColors.length - (layerColors.length - 1) * overlap);
	for (var i = 0; i < layerColors.length; i++) {
		var canvas = document.createElement('canvas');
		canvas.width = 64;
		canvas.height = 64;
		var ctx = canvas.getContext('2d');
		ctx.beginPath();
		ctx.arc(32,32,32,0,2*Math.PI);
		ctx.fillStyle = layerColors[i];
		ctx.fill();
		layerSprites.push(canvas);

		// depth
		light = dark + lumDepth;
		layerDepths.push([
			dark, // dark
			light // light
		]);
		dark = light - overlap * lumDepth;
	}
}
// setup default sprites
setLayerColors(LAYER_COLORS);

//////////////////////////////////////////////////////
//	class that controls an individual layer
//////////////////////////////////////////////////////
/**
 *	HalftoneLayer
 *
 *	@param {HalftoneGL} parent
 *	@param {canvas} sprite
 *	@param {array} depths - array of 2 elements, zero depth and one depth
 *	@method draw()
 *		@param {GLTexture2D, optional} image - image to bind to uImage, but won't
 *			do anything if undefined (so you can bind the image just once for all layers)
 */
var HalftoneLayer = function (parent, sprite, depths) {
	this.parent = parent;
	this.gl = parent.gl;
	this.sprite = new GLTexture2D(this.gl, sprite);
	this.depths = depths;
}
HalftoneLayer.prototype = {
	draw: function (image) {
		var program = GLProgram.getActiveProgram();
		// set image if needed
		if (image) {
			image.setActive(this.gl.TEXTURE1);
			this.gl.uniform1i(program.uniforms.uImage, 1);
		}
		// set uniforms
    this.gl.uniform2fv(program.uniforms.uResolution, this.parent.resolution);
    this.gl.uniform1f(program.uniforms.uMinSize, MIN_SIZE);
    this.gl.uniform1f(program.uniforms.uMaxSize, this.parent.dotSize);
		this.gl.uniform2fv(program.uniforms.uDepths, this.depths);
		// activate sprite
		this.sprite.setActive(this.gl.TEXTURE0);
		this.gl.uniform1i(program.uniforms.uPointSprite, 0);

		this.gl.drawArrays(this.gl.POINTS, 0, this.parent.points.length / 2);
	}
}

//////////////////////////////////////////////////////
//	big sexy class that does the heavy lifting
//////////////////////////////////////////////////////
var HalftoneGL = function (imagePath, darkTop, dotSize) {
	this.index = halftoneGls.length;
	this.inverted = darkTop || false;
	this.dotSize = dotSize || MAX_SIZE;
	//	make the canvas and init gl
	this.canvas = document.createElement('canvas');
	this.canvas.setAttribute('class','halftone-gl halftone-gl--' + this.index);
	this.gl = this.canvas.getContext('webgl') || this.canvas.getContext('experimental-webgl');
  // ensure gl context was successful
  if (!this.gl) {
    console.error('failed to get WebGL context.');
    return false;
  }
	this.mask = document.createElement('canvas');
	this.maskTexture = new GLTexture2D(this.gl, this.mask);

	//	establish some defaults
	//	clear to transparent, and let sprites combine without multiplying output
	this.gl.clearColor(0.0,0.0,0.0,0.0);
  this.gl.clearDepth(1.0);
	this.gl.enable(this.gl.BLEND);
	this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);

	// start making our thingies
	this.buffers = {};
	this._makeLayers();
	this._loadShaders(this._initPrograms);
	if (imagePath)
		this.setImage(imagePath);

	halftoneGls.push(this);
}
HalftoneGL.prototype = {
	// appends canvas to a `DOMElement
	appendTo: function (target) {
    target.appendChild(this.canvas);
		return this;
	},
	// makes canvas the first child of a `DOMElement`
  prependTo: function (target) {
    if (!target.childNodes.length)
      return this.appendTo(target);
    target.insertBefore(this.canvas, target.childNodes[0]);
		return this;
	},
	// defines size for the canvas in pixels
  setSize: function (x, y) {
		var computedStyles = getComputedStyle(this.canvas);
		this.resolution = [
      x || parseInt(computedStyles.width, 10),
      y || parseInt(computedStyles.height, 10)
    ];
    this.canvas.width = this.resolution[0];
    this.canvas.height = this.resolution[1];
		this.mask.width = this.resolution[0];
		this.mask.height = this.resolution[1];
    this.gl.viewport(0, 0, this.resolution[0], this.resolution[1]);
		this._updateImageTexture();
		this._makePoints();

		return this;
	},
	// sets what image to show
	setImage: function (path) {
		var _this = this;
		this.image = new Image();
		this.image.addEventListener('load', function () {
    	_this._updateImageTexture();
		});
    this.image.src = path;
		return this;
	},
	// draws all layers of the halftone
  draw: function () {
		if (!this.resolution || !this.points) {
			this.setSize();
		}
		if (this._programsReady && this.buffers.vertices) {
			this.programs.halftone.use();
	    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
			this.buffers.vertices.bindToAttribute(this.programs.halftone.attributes['aPosition']);
			this.imageTexture.setActive(this.gl.TEXTURE1);
			this.gl.uniform1i(this.programs.halftone.uniforms.uImage, 1);

			// mask
			this.maskTexture.setActive(this.gl.TEXTURE2);
			this.maskTexture.update();
			this.gl.uniform1i(this.programs.halftone.uniforms.uMask, 2);

			if (!this.inverted) {
				for (var i = 0, len = this.layers.length; i < len; i++) {
					this.layers[i].draw();
				}
			}
			else {
				for (var i = this.layers.length - 1; i > -1; i--) {
					this.layers[i].draw();
				}
			}
		}
	},
	// draws a single layer of the halftone
  drawLayer: function (layer) {
		// set active program
		if (this._programsReady) {
			this.programs.halftone.use();
			this.buffers.vertices.bindToAttribute(this.programs.halftone.attributes['aPosition']);

			// mask
			this.maskTexture.setActive(this.gl.TEXTURE2);
			this.maskTexture.update();
			this.gl.uniform1i(this.programs.halftone.uniforms.uMask, 2);

			this.layers[layer].draw(this.imageTexture);
		}
	},
	// animates layers in
	animIn: function (duration) {
		// set some animatable values
		var black = new AnimatedValue([
			{frame: 0, value: 1, ease: eases.easeOut},
			{frame: 1, value: -.7}
		]);
		var white = new AnimatedValue([
			{frame: 0, value: 2, ease: eases.easeOutCubic},
			{frame: 1, value: 0}
		]);
		this._doAnim(black, white, duration);
	},
	// animates layers out
	animOut: function (duration) {
		// set some animatable values
		var white = new AnimatedValue([
			{frame: 0, value: 1, ease: eases.easeOut},
			{frame: 1, value: -.4}
		]);
		var black = new AnimatedValue([
			{frame: 0, value: 1.1, ease: eases.easeOut},
			{frame: 1, value: 0}
		]);
		this._doAnim(black, white, duration);
	},
	setFade: function (black, white) {
		var ctx = this.mask.getContext('2d');
		var size = Math.max (this.mask.width, this.mask.height);
		var grad = ctx.createLinearGradient(0,0,size,size);
		var blackColor = '#000';
		var whiteColor = '#fff';
		// function to determine a color for a truncated stop
		function getCutoffColor (black, white) {
			var range = black - white;
			var perc = 1;
			perc = (Math.min(1, Math.max(0, black)) - (Math.min(1, Math.max(0, white)))) / range;
			// invert percentage if black is the one out of bounds
			if (black < 0 || black > 1)
				perc = 1 - perc;
			var val = Math.round(perc * 255);
			return 'rgba(' + val + ',' + val + ',' + val + ',1)';
		}
		// can't add color stop < 0 or > 1, so normalize
		if (black < 0 || black > 1) {
			blackColor = getCutoffColor (black, white);
		}
		if (white < 0 || white > 1) {
			whiteColor = getCutoffColor (black, white);
		}
		grad.addColorStop(Math.max(0, Math.min(1, black)), blackColor);
		grad.addColorStop(Math.max(0, Math.min(1, white)), whiteColor);
		ctx.fillStyle = grad;
		ctx.fillRect(0,0,size,size);
	},
	//////////
	// "internal" functions (obviously still callable outside of class, but not
	// intended to be)
	//////////
	_doAnim: function (black, white, duration) {
		var startTime = new Date().getTime();
		var _this = this;
		(function doAnimLoop () {
			var deltaTime = new Date().getTime() - startTime;
			var timePerc = deltaTime / duration;
			_this.setFade(
				black.get(timePerc),
				white.get(timePerc)
			)
			_this.draw();
			if (timePerc < 1)
				requestAnimationFrame(doAnimLoop);
		})();
	},
	_makeLayers: function () {
		this.layers = [];
		for (var i = 0, len = layerSprites.length; i < len; i++) {
			this.layers[i] = new HalftoneLayer (this, layerSprites[i], layerDepths[i]);
		}
		this._layersReady = true;
		// TODO: emit custom event
	},
	// load the shaders we need
	_loadShaders: function (cb) {
		var _this = this;
		console.log(this.index + ': start loading shaders');
    GLShaders.loadAll(this.gl, [
      [this.gl.VERTEX_SHADER, 'halftoneVertex', !this.inverted ? 'js/glsl/halftone.vs.glsl' : 'js/glsl/halftone-inverted.vs.glsl'],
      [this.gl.FRAGMENT_SHADER, 'halftoneFragment', 'js/glsl/halftone.fs.glsl']
    ], function (success) {
      if (!success)
        throw 'Failed to load all shaders files.';
			_this._shadersReady = true;
			console.log(_this.index + ': done loading shaders');
			// TODO: emit custom event
			if (cb)
      	cb.call(_this);
    });
  },
	// init the program
	_initPrograms: function () {
    console.log(this.index + ': Initializing GL Programs');
    this.programs = {
      halftone: GLProgram.create(
				// name
        'halftone' + this.index,
				// context
        this.gl,
				// shaders
        [	GLShaders.get(this.gl, 'halftoneVertex'),
          GLShaders.get(this.gl, 'halftoneFragment')],
				// attributes
        ['aPosition'],
				// uniforms
        [ 'uResolution',		'uMinSize',			'uMaxSize',		'uDepths',
					'uImage',					'uPointSprite',	'uMask']
      )
    }
		this._programsReady = true;
		// TODO: emit custom event
  },
	_makePoints: function () {
    // make array of 2d points
    var points = [];
    for (var row = 0; row < this.resolution[1] / this.dotSize + 1; row++) {
      for (var col = 0; col < this.resolution[0] / (this.dotSize / 2) + 1; col++) {
        points.push(col * (this.dotSize / 2));
        points.push(row * (this.dotSize) + (col % 2 * (this.dotSize / 2)));
      }
    }
    this.buffers.vertices = GLBuffer.create(this.gl, this.gl.ARRAY_BUFFER, 2);
    this.points = points;
    this.buffers.vertices.bindData(points);
  },
	_updateImageTexture: function () {
		if (!this.resolution) {
			return this.setSize();
		}
		if (!this.imageCanvas) {
			this.imageCanvas = document.createElement('canvas');
		}
		this.imageCanvas.width = this.resolution[0];
		this.imageCanvas.height = this.resolution[1];
		var scale = Math.max(this.resolution[0] / this.image.width, this.resolution[1] / this.image.height);
		var ctx = this.imageCanvas.getContext('2d');
		if (this.image)
			ctx.drawImage(
				this.image,
				(this.resolution[0] - (this.image.width * scale)) / 2,
				(this.resolution[1] - (this.image.height * scale)) / 2,
				(this.image.width * scale),
				(this.image.height * scale)
			);
		else {
			// no image, just make it white so we can play with it in some other way
			ctx.fillStyle = "#fff";
			ctx.fillRect(0,0,this.imageCanvas.width, this.imageCanvas.height);
		}

		this.imageTexture = new GLTexture2D (this.gl, this.imageCanvas);
	}
}

module.exports = HalftoneGL;
module.exports.setLayerColors = setLayerColors;
