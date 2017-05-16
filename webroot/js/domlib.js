/* exported domlin */

const domlib = {};

(function init () {
	'use strict';

	domlib.newAt = function newAt (at, eltype) {
		const el = document.createElement(eltype);

		at.appendChild(el);

		return el;
	};
	domlib.removeChildren = function removeChildren (el) {
		if (el) {
			while (el.firstChild) {
				el.removeChild(el.firstChild);
			}
		}
	};
})();
