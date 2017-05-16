/* exported gui,router */
/* globals socket,notify,domlib,guiList,guiMap,guiStats,guiNode */

const gui = {},
	router = new Navigo(null, true, '#');


(function init () {
	'use strict';

	const GUI_RENDER_DEBOUNCER_TIME = 100;

	let currentView = {
		'bind': function bind () {
			console.warn('Do not run dummies');
		},
		// eslint-disable-next-line func-name-matching
		'render': function renderDummy () {
			console.warn('DO not run dummies');
		}
	};

	function renderView () {
		// eslint-disable-next-line prefer-destructuring
		const status = document.getElementsByClassName('status')[0];

		if (!status) {
			console.log('unable to render, render later');
			window.setTimeout(renderView, GUI_RENDER_DEBOUNCER_TIME);

			return;
		}
		status.classList.remove('connecting', 'offline');
		if (socket.readyState !== 1) {
			let statusClass = 'offline';

			// eslint-disable-next-line no-magic-numbers
			if (socket.readyState === 0 || socket.readyState === 2) {
				statusClass = 'connecting';
			}
			status.classList.add(statusClass);
		}

		// eslint-disable-next-line prefer-destructuring
		notify.bind(document.getElementsByClassName('notifications')[0]);

		currentView.render();
		router.resolve();
	}

	function setView (toView) {
		currentView = toView;
		const main = document.querySelector('main');

		domlib.removeChildren(main);
		currentView.bind(main);
		currentView.render();
	}

	router.on({
		'/list': function routerList () {
			setView(guiList);
		},
		'/map': function routerMap () {
			setView(guiMap);
		},
		'/n/:nodeID': {
			'as': 'node',
			// eslint-disable-next-line func-name-matching
			'uses': function routerNode (params) {
				guiNode.setNodeID(params.nodeID.toLowerCase());
				setView(guiNode);
			}
		},
		'/statistics': function routerStats () {
			setView(guiStats);
		}
	});
	router.on(() => {
		router.navigate('/list');
	});

	gui.render = function render () {
		let timeout = false;

		function reset () {
			timeout = null;
		}

		if (timeout) {
			console('skip rendering, because to often');
			window.clearTimeout(timeout);
		} else {
			renderView();
		}
		timeout = window.setTimeout(reset, GUI_RENDER_DEBOUNCER_TIME);
	};

	window.onload = gui.render;
})();
