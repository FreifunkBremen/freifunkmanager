/* exported guiList */
/* global config,domlib,store,router,socket */
/* eslint max-lines: [off] */

const guiList = {};

(function init () {
	'use strict';

	const view = guiList;

	let container = null,
		el = null,
		tbody = null,
		sortReverse = false,
		sortIndex = null,
		hostnameFilter = null,
		nodeidFilter = null,
		editing = false;

	// eslint-disable-next-line id-length
	function sort (a, b) {
		function sortNumber (aNum, bNum) {
			return aNum - bNum;
		}
		if (!sortIndex) {
			return a.node_id.localeCompare(b.node_id);
		}
		switch (sortIndex.innerHTML) {
		case 'Lastseen':
			return a.lastseen - b.lastseen;
		case 'CurPower':
			// eslint-disable-next-line no-underscore-dangle
			return a._wireless.txpower24 - b._wireless.txpower24;
		case 'Power':
			return a.wireless.txpower24 - b.wireless.txpower24;
		case 'CurChannel':
		// eslint-disable-next-line no-underscore-dangle
			return a._wireless.channel24 - b._wireless.channel24;
		case 'Channel':
			return a.wireless.channel24 - b.wireless.channel24;
		case 'Clients':
			return a.statistics.clients.wifi24 - b.statistics.clients.wifi24;
		// eslint-disable-next-line no-case-declarations
		case 'ChanUtil':
			// eslint-disable-next-line id-length
			let aMax = a.statistics.wireless.map((d) =>
				d.ChanUtil
			).sort(sortNumber),
			// eslint-disable-next-line id-length
				bMax = b.statistics.wireless.map((d) =>
					d.ChanUtil
				).sort(sortNumber);

			if (!sortReverse) {
				aMax = aMax.reverse();
				bMax = bMax.reverse();
			}

			return bMax[0] - aMax[0];
		case 'Hostname':
			return a.hostname.localeCompare(b.hostname);
		default:
			return a.node_id.localeCompare(b.node_id);
		}
	}

	function renderRow (node) {
		const startdate = new Date(),
			tr = document.createElement('tr'),
			lastseen = domlib.newAt(tr, 'td'),
			nodeID = domlib.newAt(tr, 'td'),
			hostname = domlib.newAt(tr, 'td'),
			hostnameInput = domlib.newAt(hostname, 'input'),
			freq = domlib.newAt(tr, 'td'),
			curchannel = domlib.newAt(tr, 'td'),
			channel = domlib.newAt(tr, 'td'),
			channel24Input = domlib.newAt(domlib.newAt(channel, 'span'), 'input'),
			channel5Input = domlib.newAt(domlib.newAt(channel, 'span'), 'input'),
			curpower = domlib.newAt(tr, 'td'),
			power = domlib.newAt(tr, 'td'),
			power24Input = domlib.newAt(domlib.newAt(power, 'span'), 'input'),
			power5Input = domlib.newAt(domlib.newAt(power, 'span'), 'input'),
			client = domlib.newAt(tr, 'td'),
			chanUtil = domlib.newAt(tr, 'td'),
			option = domlib.newAt(tr, 'td'),
			edit = domlib.newAt(option, 'div');

		startdate.setMinutes(startdate.getMinutes() - config.node.offline);
		if (new Date(node.lastseen) < startdate) {
			tr.classList.add('offline');
		}
		// eslint-disable-next-line no-underscore-dangle
		if (!node._wireless) {
			tr.classList.add('unseen');
		}

		lastseen.innerHTML = moment(node.lastseen).fromNow(true);

		nodeID.innerHTML = node.node_id;

		hostnameInput.value = node.hostname;
		hostnameInput.readOnly = true;
		hostnameInput.setAttribute('placeholder', 'Hostname');
		hostnameInput.addEventListener('dblclick', () => {
			editing = true;
			hostnameInput.readOnly = false;
		});
		hostnameInput.addEventListener('focusout', () => {
			if (hostnameInput.readOnly) {
				return;
			}
			editing = false;
			hostnameInput.readOnly = true;
			node.hostname = hostnameInput.value;
			socket.sendnode(node);
		});

		domlib.newAt(freq, 'span').innerHTML = '2.4 Ghz';
		domlib.newAt(freq, 'span').innerHTML = '5 Ghz';

		/* eslint-disable no-underscore-dangle */
		if (node._wireless) {
			domlib.newAt(curchannel, 'span').innerHTML = node._wireless.channel24 || '-';
			domlib.newAt(curchannel, 'span').innerHTML = node._wireless.channel5 || '-';
		}
		/* eslint-enable no-underscore-dangle */


		channel24Input.value = node.wireless.channel24 || '';
		channel24Input.type = 'number';
		channel24Input.min = 1;
		channel24Input.max = 14;
		channel24Input.readOnly = true;
		channel24Input.setAttribute('placeholder', '-');
		channel24Input.addEventListener('dblclick', () => {
			editing = true;
			channel24Input.readOnly = false;
		});
		channel24Input.addEventListener('focusout', () => {
			if (channel24Input.readOnly) {
				return;
			}
			editing = false;
			channel24Input.readOnly = true;
			node.wireless.channel24 = parseInt(channel24Input.value, 10);
			socket.sendnode(node);
		});

		channel5Input.value = node.wireless.channel5 || '';
		channel5Input.type = 'number';
		channel5Input.min = 36;
		channel5Input.max = 165;
		channel5Input.step = 4;
		channel5Input.readOnly = true;
		channel5Input.setAttribute('placeholder', '-');
		channel5Input.addEventListener('dblclick', () => {
			editing = true;
			channel5Input.readOnly = false;
		});
		channel5Input.addEventListener('focusout', () => {
			if (channel5Input.readOnly) {
				return;
			}
			editing = false;
			channel5Input.readOnly = true;
			node.wireless.channel5 = parseInt(channel5Input.value, 10);
			socket.sendnode(node);
		});

		/* eslint-disable no-underscore-dangle */
		if (node._wireless) {
			domlib.newAt(curpower, 'span').innerHTML = node._wireless.txpower24 || '-';
			domlib.newAt(curpower, 'span').innerHTML = node._wireless.txpower5 || '-';
		}
		/* eslint-enable no-underscore-dangle */

		power24Input.value = node.wireless.txpower24 || '';
		power24Input.type = 'number';
		power24Input.min = 1;
		power24Input.max = 23;
		power24Input.readOnly = true;
		power24Input.setAttribute('placeholder', '-');
		power24Input.addEventListener('dblclick', () => {
			editing = true;
			power24Input.readOnly = false;
		});
		power24Input.addEventListener('focusout', () => {
			if (power24Input.readOnly) {
				return;
			}
			editing = false;
			power24Input.readOnly = true;
			node.wireless.txpower24 = parseInt(power24Input.value, 10);
			socket.sendnode(node);
		});

		power5Input.value = node.wireless.txpower5 || '';
		power5Input.type = 'number';
		power5Input.min = 1;
		power5Input.max = 23;
		power5Input.readOnly = true;
		power5Input.setAttribute('placeholder', '-');
		power5Input.addEventListener('dblclick', () => {
			editing = true;
			power5Input.readOnly = false;
		});
		power5Input.addEventListener('focusout', () => {
			if (power5Input.readOnly) {
				return;
			}
			editing = false;
			power5Input.readOnly = true;
			node.wireless.txpower5 = parseInt(power5Input.value, 10);
			socket.sendnode(node);
		});

		domlib.newAt(client, 'span').innerHTML = node.statistics.clients.wifi24;
		domlib.newAt(client, 'span').innerHTML = node.statistics.clients.wifi5;

		/* eslint-disable id-length, no-magic-numbers,one-var */
		const chanUtil24 = node.statistics.wireless
				? node.statistics.wireless.filter((d) => d.frequency < 5000)[0] || {}
				: {},
			chanUtil5 = node.statistics.wireless
				? node.statistics.wireless.filter((d) => d.frequency > 5000)[0] || {}
				: {};
		/* eslint-enable id-length, no-magic-numbers,one-var */

		domlib.newAt(chanUtil, 'span').innerHTML = chanUtil24.ChanUtil || '-';
		domlib.newAt(chanUtil, 'span').innerHTML = chanUtil5.ChanUtil || '-';

		edit.classList.add('btn');
		edit.innerHTML = 'Edit';
		edit.addEventListener('click', () => {
			router.navigate(router.generate('node', {'nodeID': node.node_id}));
		});

		return tr;
	}

	function update () {
		if (editing) {
			return;
		}
		domlib.removeChildren(tbody);
		let nodes = store.getNodes();

		if (hostnameFilter && hostnameFilter.value !== '') {
			// eslint-disable-next-line id-length
			nodes = nodes.filter((d) => d.hostname.toLowerCase().indexOf(hostnameFilter.value) > -1);
		}
		if (nodeidFilter && nodeidFilter.value !== '') {
			// eslint-disable-next-line id-length
			nodes = nodes.filter((d) => d.node_id.indexOf(nodeidFilter.value) > -1);
		}

		nodes = nodes.sort(sort);

		if (sortReverse) {
			nodes = nodes.reverse();
		}

		for (let i = 0; i < nodes.length; i += 1) {
			const row = renderRow(nodes[i]);

			tbody.appendChild(row);
		}
	}

	function sortTable (head) {
		if (sortIndex) {
			sortIndex.classList.remove('sort-up', 'sort-down');
		}
		sortReverse = head === sortIndex
			? !sortReverse
			: false;
		sortIndex = head;

		sortIndex.classList.add(sortReverse
			? 'sort-up'
			: 'sort-down');

		update();
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
		console.log('generate new view for list');
		el = domlib.newAt(container, 'div');

		const table = domlib.newAt(el, 'table'),
			thead = domlib.newAt(table, 'thead');

		tbody = domlib.newAt(table, 'tbody');

		// eslint-disable-next-line one-var
		const tr = domlib.newAt(thead, 'tr'),
			cell1 = domlib.newAt(tr, 'th'),
			cell2 = domlib.newAt(tr, 'th'),
			cell3 = domlib.newAt(tr, 'th'),
			cell4 = domlib.newAt(tr, 'th'),
			cell5 = domlib.newAt(tr, 'th'),
			cell6 = domlib.newAt(tr, 'th'),
			cell7 = domlib.newAt(tr, 'th'),
			cell8 = domlib.newAt(tr, 'th'),
			cell9 = domlib.newAt(tr, 'th'),
			cell10 = domlib.newAt(tr, 'th'),
			cell11 = domlib.newAt(tr, 'th');

		cell1.innerHTML = 'Lastseen';
		cell1.addEventListener('click', () => {
			sortTable(cell1);
		});

		cell2.classList.add('sortable');
		nodeidFilter = domlib.newAt(cell2, 'input');
		nodeidFilter.setAttribute('placeholder', 'NodeID');
		nodeidFilter.setAttribute('size', '9');
		nodeidFilter.addEventListener('keyup', update);
		cell2.addEventListener('dblclick', () => {
			sortTable(cell2);
		});
		nodeidFilter.addEventListener('focusin', () => {
			editing = true;
		});
		nodeidFilter.addEventListener('focusout', () => {
			editing = false;
			update();
		});


		cell3.classList.add('sortable');
		hostnameFilter = domlib.newAt(cell3, 'input');
		hostnameFilter.setAttribute('placeholder', 'Hostname');
		hostnameFilter.addEventListener('keyup', update);
		cell3.addEventListener('dblclick', () => {
			sortTable(cell3);
		});
		hostnameFilter.addEventListener('focusin', () => {
			editing = true;
		});
		hostnameFilter.addEventListener('focusout', () => {
			editing = false;
			update();
		});

		cell4.innerHTML = 'Freq';


		cell5.innerHTML = 'CurChannel';
		cell5.classList.add('sortable');
		cell5.addEventListener('click', () => {
			sortTable(cell4);
		});


		cell6.innerHTML = 'Channel';
		cell6.classList.add('sortable');
		cell6.addEventListener('click', () => {
			sortTable(cell5);
		});

		cell7.innerHTML = 'CurPower';
		cell7.classList.add('sortable');
		cell7.addEventListener('click', () => {
			sortTable(cell6);
		});

		cell8.innerHTML = 'Power';
		cell8.classList.add('sortable');
		cell8.addEventListener('click', () => {
			sortTable(cell7);
		});


		cell9.innerHTML = 'Clients';
		cell9.classList.add('sortable');
		cell9.addEventListener('click', () => {
			sortTable(cell8);
		});

		cell10.innerHTML = 'ChanUtil';
		cell10.classList.add('sortable');
		cell10.addEventListener('click', () => {
			sortTable(cell9);
		});
		cell11.innerHTML = 'Option';

		table.classList.add('nodes');

		update();
	};
})();
