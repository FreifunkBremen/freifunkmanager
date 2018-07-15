const current = {},
	list = {};

// Returns the node with specified id (or null if node doesn't exist).
export function getNode (nodeid) {
	if (!list[nodeid]) {
		return null;
	}

	let node = list[nodeid];
	if (current[nodeid]) {
		const cNode = current[nodeid];

		// eslint-disable-next-line no-underscore-dangle
		node._wireless = cNode.wireless;
		node.lastseen = cNode.lastseen;
	}
	return node;
};

// Creates an empty node, but doesn't add it to the list.
export function createNode (nodeid) {
	return {
		'node_id': nodeid,
		'wireless': {},
		'location': {}
	};
};

// Overwrites the values for the specified node (identified by its node_id) with new values.
// If system==false, the special "current" node will be modified instead.
export function updateNode (node, system) {
	if (system) {
		list[node.node_id] = node;
	} else {
		current[node.node_id] = node;
	}
};

// Returns a list of all known nodes.
export function getNodes () {
	return Object.keys(list).map(getNode);
};
