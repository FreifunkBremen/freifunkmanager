import config from './config';

const list = {},
	storeMaxPing = 5;

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
		'location': {},
		'pingstate':[]
	};
};

// Overwrites the values for the specified node (identified by its node_id) with new values.
export function updateNode (node) {
	list[node.node_id] = node;
};

function updateNodePingTo(value){
	return (nodeid) => {
		if (!list[nodeid]) {
			return;
		}
		list[nodeid]['pingstate'].unshift(value);
		if (list[nodeid]['pingstate'].length > storeMaxPing) {
			list[nodeid]['pingstate'].length = storeMaxPing;
		}
	}
}

export function updateNodePing(ping) {
	ping["true"].forEach(updateNodePingTo(true));
	ping["false"].forEach(updateNodePingTo(false));
};

// Returns a list of all known nodes.
export function getNodes () {
	return Object.keys(list).map(getNode);
};
