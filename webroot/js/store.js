const current = {},
	list = {};

export function getNode (nodeid) {
	let node = {};

	if (list[nodeid]) {
		node = list[nodeid];
		if (current[nodeid]) {
			const cNode = current[nodeid];

			// eslint-disable-next-line no-underscore-dangle
			node._wireless = cNode.wireless;
			node.lastseen = cNode.lastseen;
		}
	} else {
		// eslint-disable-next-line camelcase
		node.node_id = nodeid;
		node.wireless = {};
		node.location = {};
		list[nodeid] = node;
	}

	return node;
};

export function updateNode (node, system) {
	if (system) {
		list[node.node_id] = node;
	} else {
		current[node.node_id] = node;
	}
};

export function getNodes () {
	return Object.keys(list).map(getNode);
};
