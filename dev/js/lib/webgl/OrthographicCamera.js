/**
 *	OrthographicCamera camera for webgl
 *	@method makeOrtho
 *		@param height in clipspace
 *		@param aspect ratio
 *		@param znear
 *		@param zfar
 *	@method moveTo
 *		@param {Vector} location to put the camera
 *	@method lookAt
 *		@param {Vector} location to point the camera at
 *	@method getMatrix
 *		@returns final matrix for projection
 */
// requirements
var Matrix = require('lib/math/Matrix');
var Vector = require('lib/math/Vector');

// settings

// objects
var OrthographicCamera = function () {
	this.perspectiveMatrix = Matrix.create.identity(4);
	this.moveTo(Vector.create([0, 0, 0]), false);
	this.lookAt(Vector.create([0, 0, -1]));
	this.makeOrtho(2, 1, 0.1, 2.1);
};
OrthographicCamera.prototype = {
	makeOrtho: function (height, aspect, znear, zfar) {
		var width = height * aspect;
    var tz = - ((zfar + znear) / (zfar - znear));

    this.perspectiveMatrix = Matrix.create(
					[[2 / (width), 0,            0,                   0],
           [0,           -2 / (height), 0,                   0],
           [0,           0,            -2 / (zfar - znear), 0],
           [0,           0,            0,                   1]]);

		this.buildProjectionMatrix();
		return this;
	},
	moveTo: function (newPos, doBuild) {
		doBuild = doBuild === undefined ? true : doBuild;
		this.position = {
			x: newPos.elements[0],
			y: newPos.elements[1],
			z: newPos.elements[2]
		};
		if (doBuild)
			this.buildProjectionMatrix();
		return this;
	},
	lookAt: function (newTarget) {
		this.target = {
			x: newTarget.elements[0],
			y: newTarget.elements[1],
			z: newTarget.elements[2]
		};
		this.buildProjectionMatrix();
		return this;
	},
	getMatrix: function () {
		//return Matrix.I(4);
		return this.projectionMatrix;
	},
	buildProjectionMatrix: function () {
		// matrix should be:
		// xAxisX,  xAxisY,  xAxisZ,  0
		// yAxisX,  yAxisY,  yAxisZ,  0
		// zAxisX,  zAxisY,  zAxisZ,  0
		// posX,    posY,    posZ,    1

		// first, determine zAxis
		var zAxisV = new Vector([
			this.position.x - this.target.x,
			this.position.y - this.target.y,
			this.position.z - this.target.z
		]).normalize();
		// cross with up to determine x
		var xAxisV = new Vector([0,1,0]).cross(zAxisV).normalize();
		// cross z and x to get y
		var yAxisV = xAxisV.cross(zAxisV).normalize();

		var tVector = new Vector([this.position.x, this.position.y, this.position.z]).normalize();

		var positionMatrix = new Matrix([
			[xAxisV.elements[0], xAxisV.elements[1], xAxisV.elements[2], 0],
			[yAxisV.elements[0], yAxisV.elements[1], yAxisV.elements[2], 0],
			[zAxisV.elements[0], zAxisV.elements[1], zAxisV.elements[2], 0],
			[this.position.x,    this.position.y,    this.position.z,    1]
		]).inverse();

		this.projectionMatrix = positionMatrix.multiply(this.perspectiveMatrix);
	}
}

module.exports = OrthographicCamera;
