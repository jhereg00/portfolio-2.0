/**
 *	Perspective camera for webgl
 *	@method makePerspective
 *		@param field of view angle in y direction in degrees
 *		@param aspect ratio, width / height
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
var makeFrustrum = require('lib/math/makeFrustrum');

// settings

// objects
var PerspectiveCamera = function () {
	this.perspectiveMatrix = Matrix.create.identity(4);
	this.moveTo(Vector.create([0, 0, 0]), false);
	this.lookAt(Vector.create([0, 0, -1]));
};
PerspectiveCamera.prototype = {
	makePerspective: function (fovy, aspect, znear, zfar) {
		var top = znear * Math.tan(fovy * Math.PI / 360);
		var bottom = -top;
		var left = bottom * aspect;
		var right = top * aspect;

		this.perspectiveMatrix = makeFrustrum(left, right, top, bottom, znear, zfar);
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
			this.target.x - this.position.x,
			this.target.y - this.position.y,
			this.target.z - this.position.z
		]).normalize().multiply(-1);
		// cross with up to determine x
		var xAxisV = new Vector([0,1,0]).cross(zAxisV).normalize();
		// cross z and x to get y
		var yAxisV = zAxisV.cross(xAxisV).normalize().multiply(-1);

		var positionMatrix = new Matrix([
			[xAxisV.elements[0], xAxisV.elements[1], xAxisV.elements[2], 0],
			[yAxisV.elements[0], yAxisV.elements[1], yAxisV.elements[2], 0],
			[zAxisV.elements[0], zAxisV.elements[1], zAxisV.elements[2], 0],
			[this.position.x,    this.position.y,    this.position.z,    1]
		]).inverse();

		this.projectionMatrix = positionMatrix.multiply(this.perspectiveMatrix);
	}
}

module.exports = PerspectiveCamera;
