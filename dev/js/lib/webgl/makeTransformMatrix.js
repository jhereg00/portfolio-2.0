/**
 *  Makes a transform matrix from passed values
 */
// requirements
var Matrix = require('lib/math/Matrix');
var Vector = require('lib/math/Vector');

// settings
var DEFAULT_ORDER = ['rx', 'ry', 'rz', 't']

/**
 *  makeTransformMatrix
 *  @param rotationX in radians
 *  @param rotationY in radians
 *  @param rotationZ in radians
 *  @param translationX
 *  @param translationY
 *  @param translationZ
 *  [@param {array} order] array with values 'rx','ry','rz', and 't' in the order the transforms should be applied
 *
 *  @returns {Matrix}
 */
var makeTransformMatrix = function makeTransformMatrix (rx, ry, rz, tx, ty, tz, order) {
  var m = Matrix.create.identity(4);
  order = order || DEFAULT_ORDER;
  for (var i = 0, len = order.length; i < len; i++) {
    switch (order[i]) {
      case 'rx':
        m = m.x(Matrix.create.rotationX(rx));
        break;
      case 'ry':
        m = m.x(Matrix.create.rotationY(ry));
        break;
      case 'rz':
        m = m.x(Matrix.create.rotationZ(rz));
        break;
      case 't':
        m = m.x(Matrix.create.translation3d(Vector.create([tx, ty, tz])));
        break;
    }
  }
  return m;
}

module.exports = makeTransformMatrix;
