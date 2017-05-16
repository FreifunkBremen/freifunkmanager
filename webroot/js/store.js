/* exported store */


const store = {
	'stats': {
		'Clients': 0,
		'ClientsWifi': 0,
		'ClientsWifi24': 0,
		'ClientsWifi5': 0,
		'Firmwares': {},
		'Gateways': 0,
		'Models': {},
		'Nodes': 0
	}
};

(function init () {
	'use strict';

	const list = {},
		toupdate = {};

	function getNode (nodeid) {
		let node = {};

		if (toupdate[nodeid]) {
			node = toupdate[nodeid];
		} else if (list[nodeid]) {
			node = list[nodeid];
		} else {
			return null;
		}
		// eslint-disable-next-line no-underscore-dangle
		node._wireless = list[nodeid].wireless;

		return node;
	}

	store.updateNode = function updateNode (node, real) {
		if (real) {
			list[node.node_id] = node;
		} else {
			toupdate[node.node_id] = node;
		}
	};

	store.getNode = getNode;

	store.getNodes = function getNodes () {
		return Object.keys(list).map(getNode);
	};
})();
