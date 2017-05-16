/* exported guiSkel */
/* globals domlib */
const guiSkel = {};

(function init () {
	'use strict';

	const view = guiSkel;
	let container = null,
		el = null;

	function update () {
		console.warn('Do not run dummies');
	}

	view.bind = function bind (bindEl) {
		container = bindEl;
	};
	view.render = function render () {
		if (!container) {
			return;
		} else if (el) {
			container.appendChild(el);
			update();

			return;
		}
		console.log('generate new view for skel');
		el = domlib.newAt(container, 'div');

		update();
	};
})();
