/**
 *	Vector maths
 *	Based heavily (i.e., largely copies) on the Sylvester library
 *	Some differences, though:
 *		can be created with new keyword
 *		indexes are 0 based, not 1 based
 *
 *	TODO: document methods
 */

// settings
var PRECISION = 1e-6;

/**
 *	Vector class
 *	@param {Array} elements - an array of values
 */
var Vector = function (elements) {
	if (elements) {
		this.setElements(elements);
	}
}
Vector.prototype = {
	/**
	 *	.setElements
	 *	@param {Array} elements
	 */
	setElements: function (els) {
		this.elements = (els.elements || els).slice();
    return this;
	},

	e: function(i) {
    return (i < 1 || i > this.elements.length) ? null : this.elements[i-1];
  },

  dimensions: function() {
    return this.elements.length;
  },

  modulus: function() {
    return Math.sqrt(this.dot(this));
  },

  eql: function(vector) {
    var n = this.elements.length;
    var V = vector.elements || vector;
    if (n !== V.length) { return false; }
    while (n--) {
      if (Math.abs(this.elements[n] - V[n]) > PRECISION) { return false; }
    }
    return true;
  },

  dup: function() {
    return Vector.create(this.elements);
  },

  map: function(fn, context) {
    var elements = [];
    this.each(function(x, i) {
      elements.push(fn.call(context, x, i));
    });
    return Vector.create(elements);
  },

  forEach: function(fn, context) {
    var n = this.elements.length;
    for (var i = 0; i < n; i++) {
      fn.call(context, this.elements[i], i+1);
    }
  },

  toUnitVector: function() {
    var r = this.modulus();
    if (r === 0) { return this.dup(); }
    return this.map(function(x) { return x/r; });
  },

  angleFrom: function(vector) {
    var V = vector.elements || vector;
    var n = this.elements.length, k = n, i;
    if (n !== V.length) { return null; }
    var dot = 0, mod1 = 0, mod2 = 0;
    // Work things out in parallel to save time
    this.each(function(x, i) {
      dot += x * V[i-1];
      mod1 += x * x;
      mod2 += V[i-1] * V[i-1];
    });
    mod1 = Math.sqrt(mod1); mod2 = Math.sqrt(mod2);
    if (mod1*mod2 === 0) { return null; }
    var theta = dot / (mod1*mod2);
    if (theta < -1) { theta = -1; }
    if (theta > 1) { theta = 1; }
    return Math.acos(theta);
  },

  isParallelTo: function(vector) {
    var angle = this.angleFrom(vector);
    return (angle === null) ? null : (angle <= PRECISION);
  },

  isAntiparallelTo: function(vector) {
    var angle = this.angleFrom(vector);
    return (angle === null) ? null : (Math.abs(angle - Math.PI) <= PRECISION);
  },

  isPerpendicularTo: function(vector) {
    var dot = this.dot(vector);
    return (dot === null) ? null : (Math.abs(dot) <= PRECISION);
  },

  add: function(vector) {
    var V = vector.elements || vector;
    if (this.elements.length !== V.length) { return null; }
    return this.map(function(x, i) { return x + V[i-1]; });
  },

  subtract: function(vector) {
    var V = vector.elements || vector;
    if (this.elements.length !== V.length) { return null; }
    return this.map(function(x, i) { return x - V[i-1]; });
  },

  multiply: function(k) {
    return this.map(function(x) { return x*k; });
  },

  dot: function(vector) {
    var V = vector.elements || vector;
    var i, product = 0, n = this.elements.length;
    if (n !== V.length) { return null; }
    while (n--) { product += this.elements[n] * V[n]; }
    return product;
  },

  cross: function(vector) {
    var B = vector.elements || vector;
    if (this.elements.length !== 3 || B.length !== 3) { return null; }
    var A = this.elements;
    return Vector.create([
      (A[1] * B[2]) - (A[2] * B[1]),
      (A[2] * B[0]) - (A[0] * B[2]),
      (A[0] * B[1]) - (A[1] * B[0])
    ]);
  },

  max: function() {
    var m = 0, i = this.elements.length;
    while (i--) {
      if (Math.abs(this.elements[i]) > Math.abs(m)) { m = this.elements[i]; }
    }
    return m;
  },

  indexOf: function(x) {
    var index = null, n = this.elements.length;
    for (var i = 0; i < n; i++) {
      if (index === null && this.elements[i] === x) {
        index = i + 1;
      }
    }
    return index;
  },

  round: function() {
    return this.map(function(x) { return Math.round(x); });
  },

  snapTo: function(x) {
    return this.map(function(y) {
      return (Math.abs(y - x) <= PRECISION) ? x : y;
    });
  },

  distanceFrom: function(obj) {
    if (obj.anchor || (obj.start && obj.end)) { return obj.distanceFrom(this); }
    var V = obj.elements || obj;
    if (V.length !== this.elements.length) { return null; }
    var sum = 0, part;
    this.each(function(x, i) {
      part = x - V[i-1];
      sum += part * part;
    });
    return Math.sqrt(sum);
  },

  liesOn: function(line) {
    return line.contains(this);
  },

  liesIn: function(plane) {
    return plane.contains(this);
  },

  reflectionIn: function(obj) {
    if (obj.anchor) {
      // obj is a plane or line
      var P = this.elements.slice();
      var C = obj.pointClosestTo(P).elements;
      return Vector.create([C[0] + (C[0] - P[0]), C[1] + (C[1] - P[1]), C[2] + (C[2] - (P[2] || 0))]);
    } else {
      // obj is a point
      var Q = obj.elements || obj;
      if (this.elements.length !== Q.length) { return null; }
      return this.map(function(x, i) { return Q[i-1] + (Q[i-1] - x); });
    }
  },

  to3D: function() {
    var V = this.dup();
    switch (V.elements.length) {
      case 3: break;
      case 2: V.elements.push(0); break;
      default: return null;
    }
    return V;
  },

  inspect: function() {
    return '[' + this.elements.join(', ') + ']';
  },

	normalize: function () {
		var len = Math.sqrt(
			this.elements[0] * this.elements[0] +
			this.elements[1] * this.elements[1] +
			this.elements[2] * this.elements[2]);
		if (len > PRECISION) {
			return Vector.create([
				this.elements[0] / len,
				this.elements[1] / len,
				this.elements[2] / len
			]);
		}
		else
			return Vector.create([0,0,0]);
	}
}

// aliases
Vector.prototype.each = Vector.prototype.forEach;

/**
 *	.create
 *	@param {Array} elements
 *	@returns {Vector}
 */
Vector.create = function (elements) {
	return new Vector (elements);
}

module.exports = Vector;
