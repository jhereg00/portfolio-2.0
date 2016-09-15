/**
 *	Matrix maths
 *	Based heavily (i.e., largely copies) on the Sylvester library
 *	Some differences, though:
 *		can be created with new keyword
 *		row/column idexes are 0 based, not 1 based
 *		not all methods have been ported over
 */

// requirements
var Vector = require('lib/math/Vector');

// settings
var PRECISION = 1e-6;

/**
 *	Matrix class
 *	@param {Array} elements - an array of arrays from which to build the matrix [rows[cols]]
 */
var Matrix = function (elements) {
	if (elements) {
		this.setElements(elements);
	}
};
Matrix.prototype = {
	/**
	 *	.setElements
	 *	@param {Array} elements
	 *	@returns this matrix
	 */
	setElements: function(els) {
    var i, j, elements = els.elements || els;
    if (elements[0] && typeof(elements[0][0]) !== 'undefined') {
      i = elements.length;
      this.elements = [];
      while (i--) { j = elements[i].length;
        this.elements[i] = [];
        while (j--) {
          this.elements[i][j] = elements[i][j];
        }
      }
      return this;
    }
    var n = elements.length;
    this.elements = [];
    for (i = 0; i < n; i++) {
      this.elements.push([elements[i]]);
    }
    return this;
  },

	/**
	 *	.row
	 *	@param {int} row index to retrieve
	 *	@returns {Vector}
	 */
	row: function (i) {
		if (i > this.elements.length)
			return null;
		return new Vector (this.elements[i]);
	},

	/**
	 *	.col
	 *	@param {int} col index to retrieve
	 *	@returns {Vector}
	 */
	col: function (j) {
		if (this.elements.length === 0) { return null; }
		if (j > this.elements[0].length) { return null; }
		var col = []; n = this.elements.length;
		for (var i = 0; i < n; i++)
			col.push(this.elements[i][j]);
		return new Vector (col);
	},

	/**
	 *	.dimensions
	 *	@returns {Object}
	 *		@prop {int} rows
	 *		@prop {int} cols
	 */
	dimensions: function () {
		var cols = (this.elements.length === 0) ? 0 : this.elements[0].length;
		return {
			rows: this.elements.length,
			cols: cols
		};
	},

	/**
	 *	.equals
	 *	@param {Matrix} matrix to compare to
	 *	@returns {boolean} true if values are the same
	 */
	equals: function (matrix) {
		var M = matrix.elements || matrix;
		// make sure it's a matrix, not just arrays
		if (!M[0] || typeof(M[0][0]) === 'undefined') { M = Matrix.create(M).elements; }
		// empty matrices?
		if (this.elements.length === 0 || M.length === 0)
      return this.elements.length === M.length;
		// easy part, same size?
    if (this.elements.length !== M.length) { return false; }
    if (this.elements[0].length !== M[0].length) { return false; }
		// real comparison
		var i = this.elements.length, nj = this.elements[0].length, j;
    while (i--) { j = nj;
      while (j--) {
        if (Math.abs(this.elements[i][j] - M[i][j]) > PRECISION) { return false; }
      }
    }
    return true;
	},

	/**
	 *	.duplicate
	 *	@returns {Matrix} new Matrix instance
	 */
	duplicate: function () {
		return new Matrix (this.elements);
	},

	/**
	 *	.map
	 *	@param {Function} thing to do to each value
	 *	[@param] {Object} context for `this` keyword in function
	 *	@returns {Matrix} new Matrix instance
	 */
	map: function (fn, context) {
		if (this.elements.length === 0) { return Matrix.create([]); }
    var els = [], i = this.elements.length, nj = this.elements[0].length, j;
    while (i--) { j = nj;
      els[i] = [];
      while (j--) {
        els[i][j] = fn.call(context, this.elements[i][j], i + 1, j + 1);
      }
    }
    return Matrix.create(els);
	},

	/**
	 *	.isSameSizeAs
	 *	@param {Matrix} compared matrix
	 *	@returns {boolean}
	 */
	isSameSizeAs: function (matrix) {
		var M = matrix.elements || matrix;
    if (typeof(M[0][0]) === 'undefined') { M = Matrix.create(M).elements; }
    if (this.elements.length === 0) { return M.length === 0; }
    return (this.elements.length === M.length &&
        this.elements[0].length === M[0].length);
	},

	/**
	 *	.add
	 *	@param {Matrix} to add to this one
	 *	@returns {Matrix} new Matrix of result
	 */
	add: function (matrix) {
		if (this.elements.length === 0) return this.map(function(x) { return x });
    var M = matrix.elements || matrix;
    if (typeof(M[0][0]) === 'undefined') { M = Matrix.create(M).elements; }
    if (!this.isSameSizeAs(M)) { return null; } // can only add same dimensioned matrices
    return this.map(function(x, i, j) { return x + M[i-1][j-1]; });
	},

	/**
	 *	.subtract
	 *	@param {Matrix} to subtract from this one
	 *	@returns {Matrix} new Matrix of result
	 */
	subtract: function (matrix) {
		if (this.elements.length === 0) return this.map(function(x) { return x });
    var M = matrix.elements || matrix;
    if (typeof(M[0][0]) === 'undefined') { M = Matrix.create(M).elements; }
    if (!this.isSameSizeAs(M)) { return null; }
    return this.map(function(x, i, j) { return x - M[i-1][j-1]; });
	},

	/**
	 *	.canMultiplyFromLeft
	 *	@param {Matrix}
	 *	@returns {boolean} if matrix is compatible to multiply with this one
	 */
	canMultiplyFromLeft: function(matrix) {
    if (this.elements.length === 0) { return false; }
    var M = matrix.elements || matrix;
    if (typeof(M[0][0]) === 'undefined') { M = Matrix.create(M).elements; }
    // this.columns should equal matrix.rows
    return (this.elements[0].length === M.length);
  },

	/**
	 *	.multiply
	 *	@param {Matrix}
	 *	@returns {Matrix} product
	 */
  multiply: function(matrix) {
    if (this.elements.length === 0) { return null; }
    if (!matrix.elements) {
      return this.map(function(x) { return x * matrix; });
    }
    var returnVector = matrix.modulus ? true : false;
    var M = matrix.elements || matrix;
    if (typeof(M[0][0]) === 'undefined') { M = Matrix.create(M).elements; }
    if (!this.canMultiplyFromLeft(M)) { return null; }
    var i = this.elements.length, nj = M[0].length, j;
    var cols = this.elements[0].length, c, elements = [], sum;
    while (i--) { j = nj;
      elements[i] = [];
      while (j--) { c = cols;
        sum = 0;
        while (c--) {
          sum += this.elements[i][c] * M[c][j];
        }
        elements[i][j] = sum;
      }
    }
    var M = Matrix.create(elements);
    return returnVector ? M.col(1) : M;
  },

	/**
	 *	.inverse
	 *	@returns {Matrix} new matrix of this one's inverse
	 */
	inverse: function() {
    if (this.elements.length === 0) { return null; }
    if (!this.isSquare() || this.isSingular()) { return null; }
    var n = this.elements.length, i= n, j;
    var M = this.augment(Matrix.I(n)).toRightTriangular();
    var np = M.elements[0].length, p, els, divisor;
    var inverse_elements = [], new_element;
    // Matrix is non-singular so there will be no zeros on the
    // diagonal. Cycle through rows from last to first.
    while (i--) {
      // First, normalise diagonal elements to 1
      els = [];
      inverse_elements[i] = [];
      divisor = M.elements[i][i];
      for (p = 0; p < np; p++) {
        new_element = M.elements[i][p] / divisor;
        els.push(new_element);
        // Shuffle off the current row of the right hand side into the results
        // array as it will not be modified by later runs through this loop
        if (p >= n) { inverse_elements[i].push(new_element); }
      }
      M.elements[i] = els;
      // Then, subtract this row from those above it to give the identity matrix
      // on the left hand side
      j = i;
      while (j--) {
        els = [];
        for (p = 0; p < np; p++) {
          els.push(M.elements[j][p] - M.elements[i][p] * M.elements[j][i]);
        }
        M.elements[j] = els;
      }
    }
    return Matrix.create(inverse_elements);
  },

	/**
	 *	.inspect
	 *	@returns {String} human readable output of matrix
	 */
	inspect: function() {
    var matrix_rows = [];
    var n = this.elements.length;
    if (n === 0) return '[]';
    for (var i = 0; i < n; i++) {
      matrix_rows.push(Vector.create(this.elements[i]).inspect());
    }
    return matrix_rows.join('\n');
  },

	/**
	 *	.flatten
	 *	@returns {Array} values as a single array
	 */
	flatten: function () {
		var out = [];
		for (var i = 0; i < this.elements.length; i++) {
			out = out.concat(this.elements[i]);
		}
		return out;
	},

	/**
	 *	.transpose
	 *	@returns {Matrix} this matrix transposed, or with rows exchanged with columns
	 */
	transpose: function() {
    if (this.elements.length === 0) return Matrix.create([]);
    var rows = this.elements.length, i, cols = this.elements[0].length, j;
    var elements = [], i = cols;
    while (i--) { j = rows;
      elements[i] = [];
      while (j--) {
        elements[i][j] = this.elements[j][i];
      }
    }
    return Matrix.create(elements);
  },

	/**
	 *	useful for internal purposes...
	 */
	toRightTriangular: function() {
    if (this.elements.length === 0) return Sylvester.Matrix.create([]);
    var M = this.dup(), els;
    var n = this.elements.length, i, j, np = this.elements[0].length, p;
    for (i = 0; i < n; i++) {
      if (M.elements[i][i] === 0) {
        for (j = i + 1; j < n; j++) {
          if (M.elements[j][i] !== 0) {
            els = [];
            for (p = 0; p < np; p++) { els.push(M.elements[i][p] + M.elements[j][p]); }
            M.elements[i] = els;
            break;
          }
        }
      }
      if (M.elements[i][i] !== 0) {
        for (j = i + 1; j < n; j++) {
          var multiplier = M.elements[j][i] / M.elements[i][i];
          els = [];
          for (p = 0; p < np; p++) {
            // Elements with column numbers up to an including the number of the
            // row that we're subtracting can safely be set straight to zero,
            // since that's the point of this routine and it avoids having to
            // loop over and correct rounding errors later
            els.push(p <= i ? 0 : M.elements[j][p] - M.elements[i][p] * multiplier);
          }
          M.elements[j] = els;
        }
      }
    }
    return M;
  },

  isSingular: function() {
    return (this.isSquare() && this.determinant() === 0);
  },

	isSquare: function() {
    var cols = (this.elements.length === 0) ? 0 : this.elements[0].length;
    return (this.elements.length === cols);
  },

	determinant: function() {
    if (this.elements.length === 0) { return 1; }
    if (!this.isSquare()) { return null; }
    var M = this.toRightTriangular();
    var det = M.elements[0][0], n = M.elements.length;
    for (var i = 1; i < n; i++) {
      det = det * M.elements[i][i];
    }
    return det;
  },

	augment: function(matrix) {
    if (this.elements.length === 0) { return this.dup(); }
    var M = matrix.elements || matrix;
    if (typeof(M[0][0]) === 'undefined') { M = Sylvester.Matrix.create(M).elements; }
    var T = this.dup(), cols = T.elements[0].length;
    var i = T.elements.length, nj = M[0].length, j;
    if (i !== M.length) { return null; }
    while (i--) { j = nj;
      while (j--) {
        T.elements[i][cols + j] = M[i][j];
      }
    }
    return T;
  }
}

// aliases
Matrix.prototype.eql = Matrix.prototype.equals;
Matrix.prototype.dup = Matrix.prototype.duplicate;
Matrix.prototype.x = Matrix.prototype.multiply;

// namespaced functions
/**
 *	.create
 *	@param {Array} elements - an array of arrays from which to build the matrix [rows[cols]]
 *	@returns shiny new Matrix
 */
Matrix.create = function (elements) {
	return new Matrix (elements);
}
/**
 *	.I
 *	@param {int} size
 *	@returns {Matrix} square identity matrix of `n` size
 */
Matrix.I = function(n) {
  var els = [], i = n, j;
  while (i--) { j = n;
    els[i] = [];
    while (j--) {
      els[i][j] = (i === j) ? 1 : 0;
    }
  }
  return Matrix.create(els);
};
Matrix.create.identity = Matrix.I;

/**
 *	rotations
 */
Matrix.create.rotation = function (angle, a /* axis vector */) {
	if (!a) {
    return Matrix.create([
      [Math.cos(angle),  -Math.sin(angle)],
      [Math.sin(angle),   Math.cos(angle)]
    ]);
  }
  var axis = a.dup();
  if (axis.elements.length !== 3) { return null; }
  var mod = axis.modulus();
  var x = axis.elements[0]/mod, y = axis.elements[1]/mod, z = axis.elements[2]/mod;
  var s = Math.sin(angle), c = Math.cos(angle), t = 1 - c;
  // Formula derived here: http://www.gamedev.net/reference/articles/article1199.asp
  // That proof rotates the co-ordinate system so angle becomes -angle and sin
  // becomes -sin here.
  return Matrix.create([
    [ t*x*x + c, t*x*y - s*z, t*x*z + s*y ],
    [ t*x*y + s*z, t*y*y + c, t*y*z - s*x ],
    [ t*x*z - s*y, t*y*z + s*x, t*z*z + c ]
  ]);
}
Matrix.create.rotationX = function (angle) {
	var c = Math.cos(angle), s = Math.sin(angle);
  return Matrix.create([
    [  1,  0,  0, 0 ],
    [  0,  c, -s, 0 ],
    [  0,  s,  c, 0 ],
		[	 0,  0,  0, 1 ]
  ]);
}
Matrix.create.rotationY = function(angle) {
  var c = Math.cos(angle), s = Math.sin(angle);
  return Matrix.create([
    [  c,  0,  -s, 0 ],
    [  0,  1,  0, 0 ],
    [  s,  0,  c, 0 ],
		[	 0,  0,  0, 1 ]
  ]);
};
Matrix.create.rotationZ = function(angle) {
  var c = Math.cos(angle), s = Math.sin(angle);
  return Matrix.create([
    [  c, -s,  0,	0 ],
    [  s,  c,  0,	0 ],
    [  0,  0,  1,	0 ],
		[	 0,	 0,  0, 1 ]
  ]);
};
/**
 *	translation
 */
Matrix.create.translation3d = function (vector) {
	return Matrix.create([
		[1, 0, 0, 0],
		[0, 1, 0, 0],
		[0, 0, 1, 0],
		[vector.elements[0], vector.elements[1], vector.elements[2], 1]
	]);
}

module.exports = Matrix;
