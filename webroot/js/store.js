import config from './config';

const list = {},
	pingState = {},
	storeMaxPing = 10;

// Returns the node with specified id (or null if node doesn't exist).
export function getNode (nodeid) {
	if (!list[nodeid]) {
		return null;
	}

	let node = list[nodeid];
	// keep structur for pings later
	if(pingState[nodeid]) {
		node.pingstate = pingState[nodeid];
	}else{
		node.pingstate = [];
	}
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
		if(pingState[nodeid] === undefined) {
			pingState[nodeid] = [value];
			return
		}
		pingState[nodeid].unshift(value);
		if (pingState[nodeid].length > storeMaxPing) {
			pingState[nodeid].length = storeMaxPing;
		}
	}
}

export function updateNodePing(ping) {
	if(ping['true']) {
		ping['true'].forEach(updateNodePingTo(true));
	}
	if(ping['false']) {
		ping['false'].forEach(updateNodePingTo(false));
	}
};

// Returns a list of all known nodes.
export function getNodes () {
	return Object.keys(list).map(getNode);
};
