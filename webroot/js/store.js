import config from './config';

const list = {};

// Returns the node with specified id (or null if node doesn't exist).
export function getNode (nodeid) {
	if (!list[nodeid]) {
		return null;
	}

	let node = list[nodeid];
	// keep structur for pings later
	return node;
};

// Creates an empty node, but doesn't add it to the list.
export function createNode (nodeid) {
	return {
		'node_id': nodeid,
		'hostname': '',
		'owner': '',
		'lastseen': null,
		'wireless': {
			'channel24': config.node.channel24,
			'channel5': config.node.channel5,
		},
		'location': {}
	};
};

// Overwrites the values for the specified node (identified by its node_id) with new values.
export function updateNode (node) {
	list[node.node_id] = node;
};

// Returns a list of all known nodes.
export function getNodes () {
	return Object.keys(list).map(getNode);
};
