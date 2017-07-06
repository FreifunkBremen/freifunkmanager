/* exported guiStats */
/* globals store, domlib */
const guiStats = {};

(function init () {
	'use strict';

	const view = guiStats;

	let container = null,
		el = null,
		channelTabelle = null,

		nodes = null,
		clients = null,
		clientsWifi = null,
		clientsWifi24 = null,
		clientsWifi5 = null;

	function update () {
		nodes.innerHTML = store.stats.Nodes;
		clients.innerHTML = store.stats.Clients;
		clientsWifi.innerHTML = store.stats.ClientsWifi;
		clientsWifi24.innerHTML = store.stats.ClientsWifi24;
		clientsWifi5.innerHTML = store.stats.ClientsWifi5;

		domlib.removeChildren(channelTabelle);


		let tr = domlib.newAt(channelTabelle, 'tr');

		let title = domlib.newAt(tr, 'th');
		title.innerHTML = '2.4 Ghz';
		title.setAttribute('colspan', '2');

		title = domlib.newAt(tr, 'th');
		title.innerHTML = '5 Ghz';
		title.setAttribute('colspan', '2');
		const storeNodes = store.getNodes();
		for (let ch = 1; ch <= 33; ch++) {
			tr = domlib.newAt(channelTabelle, 'tr');
			if (ch < 14) {
				domlib.newAt(tr, 'td').innerHTML = ch;
				domlib.newAt(tr, 'td').innerHTML = storeNodes.reduce((c, node) => node.wireless.channel24 === ch ? c + 1 : c, 0);
			} else {
				domlib.newAt(tr, 'td');
				domlib.newAt(tr, 'td');
			}
			const ch5 = 32 + ch * 4;
			domlib.newAt(tr, 'td').innerHTML = ch5;
			domlib.newAt(tr, 'td').innerHTML = storeNodes.reduce((c, node) => node.wireless.channel5 === ch5 ? c + 1 : c, 0);
		}
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
		console.log('generate new view for stats');
		el = domlib.newAt(container, 'div');
		domlib.newAt(el, 'h1').innerHTML = 'Statistics';

		const table = domlib.newAt(el, 'table');

		table.classList.add('stats');

		let tr = domlib.newAt(table, 'tr'),
			title = domlib.newAt(tr, 'th');

		title.innerHTML = 'Nodes';
		title.setAttribute('colspan', '2');
		nodes = domlib.newAt(tr, 'td');

		tr = domlib.newAt(table, 'tr');
		title = domlib.newAt(tr, 'th');
		title.innerHTML = 'Clients';
		title.setAttribute('colspan', '2');
		clients = domlib.newAt(tr, 'td');

		tr = domlib.newAt(table, 'tr');
		tr.classList.add('line');
		domlib.newAt(tr, 'th').innerHTML = 'Wifi';
		domlib.newAt(tr, 'th').innerHTML = '2.4 Ghz';
		domlib.newAt(tr, 'th').innerHTML = '5 Ghz';

		tr = domlib.newAt(table, 'tr');
		clientsWifi = domlib.newAt(tr, 'td');
		clientsWifi24 = domlib.newAt(tr, 'td');
		clientsWifi5 = domlib.newAt(tr, 'td');

		// Channels table
		domlib.newAt(el, 'h1').innerHTML = 'Channels';
		channelTabelle = domlib.newAt(el, 'table');
		channelTabelle.classList.add('stats');

		update();
	};
})();
