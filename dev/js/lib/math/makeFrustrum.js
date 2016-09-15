/**
 *	generates a Frustrum matrix
 *	@param left
 *	@param right
 *	@param bottom
 *	@param top
 *	@param znear
 *	@param zfar
 */
var Matrix = require('lib/math/Matrix');

function makeFrustum(left, right,
                     bottom, top,
                     znear, zfar)
{
    var X = 2*znear/(right-left);
    var Y = 2*znear/(top-bottom);
    var A = (right+left)/(right-left);
    var B = (top+bottom)/(top-bottom);
    var C = -(zfar+znear)/(zfar-znear);
    var D = -2*zfar*znear/(zfar-znear);

    return new Matrix ([[X, 0, A, 0],
               [0, Y, B, 0],
               [0, 0, C, D],
               [0, 0, -1, 0]]);
}

module.exports = makeFrustum;
