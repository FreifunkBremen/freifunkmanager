/* exported socket */
/* globals notify,gui,store,config*/
let socket = {'readyState': 0};

(function init () {
	'use strict';

	const RECONNECT_AFTER = 5000;

	function onerror (err) {
		console.warn(err);
		// eslint-disable-next-line no-magic-numbers
		if (socket.readyState !== 3) {
			notify.send('error', 'Es gibt Übertragungsprobleme!');
			gui.render();
		}
	}

	function onopen () {
		gui.render();
	}

	function onmessage (raw) {
		const msg = JSON.parse(raw.data);

		switch (msg.type) {
		case 'system':
			store.updateNode(msg.node, true);
			break;
		case 'current':
			store.updateNode(msg.node);
			break;
		case 'stats':
			if (msg.body) {
				store.stats = msg.body;
			}
			break;
		default:
			notify.send('warn', `unable to identify message: ${raw}`);
			break;
		}
		gui.render();
	}

	function onclose () {
		console.log('socket closed by server');
		notify.send('warn', 'Es besteht ein Verbindungsproblem!');
		gui.render();
		// eslint-disable-next-line no-use-before-define
		window.setTimeout(connect, RECONNECT_AFTER);
	}

	function sendnode (node) {
		const notifyMsg = `Einstellungen für '${node.node_id}' gespeichert.`,
			socketMsg = JSON.stringify({
				'node': node,
				'type': 'system'
			});


		socket.send(socketMsg);


		notify.send('success', notifyMsg);
	}

	function connect () {
		socket = new window.WebSocket(config.backend);
		socket.onopen = onopen;
		socket.onerror = onerror;
		socket.onmessage = onmessage;
		socket.onclose = onclose;
		socket.sendnode = sendnode;
	}

	connect();
})();
