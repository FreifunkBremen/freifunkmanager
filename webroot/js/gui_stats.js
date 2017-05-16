/* exported guiStats */
/* globals store, domlib */
const guiStats = {};

(function init () {
	'use strict';

	const view = guiStats;

	let container = null,
		el = null,

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

		update();
	};
})();
