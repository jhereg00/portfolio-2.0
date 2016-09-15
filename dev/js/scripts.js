/**
 *  scripts.js
 *  This should include objects, which in turn include the lib files they need.
 *  This keeps us using a modular approach to dev while also only including the
 *  parts of the library we need.
 */

// temp, auto init
var HalftoneGL = require('app/HalftoneGL');
var halftoneEls = document.querySelectorAll('.js-make-halftone');
for (var i = 0, len = halftoneEls.length; i < len; i++) {
	(function (el) {
		var ht = new HalftoneGL (el.getAttribute('data-halftone'), false, 12);
		ht.appendTo(el);
		el.parentElement.addEventListener('mouseenter', function (e) {
			ht.animIn(3000);
		}, false);
		el.parentElement.addEventListener('mouseleave', function (e) {
			ht.animOut(3000);
		});
	})(halftoneEls[i]);
}
