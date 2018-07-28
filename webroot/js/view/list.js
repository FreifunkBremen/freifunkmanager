import * as domlib from '../domlib';
import * as gui from '../gui';
import * as lib from '../lib';
import * as socket from '../socket';
import * as store from '../store';
import config from '../config';
import View from '../view';
import {FromNowAgo} from '../lib';

export class ListView extends View {

	constructor () {
		super();
		this.debouncer = new lib.Debouncer(1000, "list render");
		this.maxDisplayedNodes = localStorage.getItem("maxDisplayedNodes");
		if (this.maxDisplayedNodes == null) {
			this.maxDisplayedNodes = 20;
		}
		const table = domlib.newAt(this.el, 'table'),
			thead = domlib.newAt(table, 'thead');

		this.tbody = domlib.newAt(table, 'tbody');

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
			this.sortTable(cell1);
		});

		cell2.classList.add('sortable');
		this.nodeidFilter = domlib.newAt(cell2, 'input');
		this.nodeidFilter.setAttribute('placeholder', 'NodeID');
		this.nodeidFilter.setAttribute('size', '9');
		this.nodeidFilter.addEventListener('keyup', () => {
			this.render();
		});
		cell2.addEventListener('dblclick', () => {
			this.sortTable(cell2);
		});
		this.nodeidFilter.addEventListener('focusin', () => {
			this.editing = true;
		});
		this.nodeidFilter.addEventListener('focusout', () => {
			this.editing = false;
			this.render();
		});


		cell3.classList.add('sortable');
		cell3.classList.add('hostname');
		this.hostnameFilter = domlib.newAt(cell3, 'input');
		this.hostnameFilter.setAttribute('placeholder', 'Hostname');
		this.hostnameFilter.addEventListener('keyup', () => {
			this.render();
		});
		cell3.addEventListener('dblclick', () => {
			this.sortTable(cell3);
		});
		this.hostnameFilter.addEventListener('focusin', () => {
			this.editing = true;
		});
		this.hostnameFilter.addEventListener('focusout', () => {
			this.editing = false;
			this.render();
		});

		cell4.innerHTML = 'Freq';


		cell5.innerHTML = 'CurChannel';
		cell5.classList.add('sortable');
		cell5.addEventListener('click', () => {
			this.sortTable(cell5);
		});


		cell6.innerHTML = 'Channel';
		cell6.classList.add('sortable');
		cell6.addEventListener('click', () => {
			this.sortTable(cell6);
		});

		cell7.innerHTML = 'CurPower';
		cell7.classList.add('sortable');
		cell7.addEventListener('click', () => {
			this.sortTable(cell7);
		});

		cell8.innerHTML = 'Power';
		cell8.classList.add('sortable');
		cell8.addEventListener('click', () => {
			this.sortTable(cell8);
		});


		cell9.innerHTML = 'Clients';
		cell9.classList.add('sortable');
		cell9.addEventListener('click', () => {
			this.sortTable(cell9);
		});

		cell10.innerHTML = 'ChanUtil';
		cell10.classList.add('sortable');
		cell10.addEventListener('click', () => {
			this.sortTable(cell10);
		});
		cell11.innerHTML = 'Option';

		table.classList.add('nodes');

		this.footerNote = domlib.newAt(this.el, 'span');

		var footerLinkContents = [["5", 5], ["10", 10], ["20", 20], ["50", 50], ["All", -1]];
		for (var i = 0; i < footerLinkContents.length; i++) {
			var link = domlib.newAt(this.el, 'a', null, footerLinkContents[i][0]);
			link.classList.add('btn');
			const newValue = footerLinkContents[i][1];
			link.addEventListener('click', () => {
				this.maxDisplayedNodes = newValue;
				localStorage.setItem("maxDisplayedNodes", this.maxDisplayedNodes);
				this.render();
			});
		}
	}

	// eslint-disable-next-line id-length
	sort (sortIndex, sortReverse) {
		function sortNumber (aNum, bNum) {
			return aNum - bNum;
		}
		return (a, b) => {
			if (!sortIndex) {
				return a.node_id.localeCompare(b.node_id);
			}
			if (sortIndex.classList.contains("hostname")) {
				return a.hostname.localeCompare(b.hostname);
			}
			switch (sortIndex.innerText) {
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
				if(a.statistics.wireless === null) return 1;
				if(b.statistics.wireless === null) return -1;
				// eslint-disable-next-line id-length
				let aMax = a.statistics.wireless.map((d) => d.ChanUtil).sort(sortNumber),
					// eslint-disable-next-line id-length
					bMax = b.statistics.wireless.map((d) => d.ChanUtil).sort(sortNumber);

				if (!sortReverse) {
					aMax = aMax.reverse();
					bMax = bMax.reverse();
				}

				return bMax[0] - aMax[0];
			default:
				return a.node_id.localeCompare(b.node_id);
			}
		}
	}

	renderRow (node) {
		const startdate = new Date(),
			tr = document.createElement('tr'),
			lastseen = domlib.newAt(tr, 'td'),
			nodeID = domlib.newAt(tr, 'td'),
			hostname = domlib.newAt(tr, 'td'),
			hostnameInput = domlib.newAt(hostname, 'input'),
			freq = domlib.newAt(tr, 'td'),
			curchannel = domlib.newAt(tr, 'td'),
			channel = domlib.newAt(tr, 'td'),
			channel24Input = domlib.newAt(domlib.newAt(channel, 'span'), 'select'),
			channel5Input = domlib.newAt(domlib.newAt(channel, 'span'), 'select'),
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
			// eslint-disable-next-line no-underscore-dangle
		} else if (!node._wireless) {
			tr.classList.add('unseen');
		}


		lastseen.textContent = FromNowAgo(node.lastseen);

		nodeID.textContent = node.node_id;

		hostnameInput.value = node.hostname;
		hostnameInput.readOnly = true;
		hostnameInput.setAttribute('placeholder', 'Hostname');
		hostnameInput.addEventListener('dblclick', () => {
			this.editing = true;
			hostnameInput.readOnly = false;
		});
		hostnameInput.addEventListener('focusout', () => {
			if (hostnameInput.readOnly) {
				return;
			}
			this.editing = false;
			hostnameInput.readOnly = true;
			const old = node.hostname;
			node.hostname = hostnameInput.value;
			socket.sendnode(node, (msg)=>{
				if (!msg.body) {
					node.hostname = old;
					hostnameInput.value = old;
				}
			});
		});

		domlib.newAt(freq, 'span').textContent = '2.4 Ghz';
		domlib.newAt(freq, 'span').textContent = '5 Ghz';

		/* eslint-disable no-underscore-dangle */
		if (node._wireless) {
			domlib.newAt(curchannel, 'span').textContent = node._wireless.channel24 || '-';
			domlib.newAt(curchannel, 'span').textContent = node._wireless.channel5 || '-';
		}
		let i = 0;
		for (i = 0; i < store.channelsWifi24.length; i++) {
			const opt = domlib.newAt(channel24Input,'option',{
				'value': store.channelsWifi24[i],
			},store.channelsWifi24[i]);

			if(store.channelsWifi24[i] === node.wireless.channel24) {
				opt.selected = true;
			}
		}
		channel24Input.addEventListener('focusin', () => {
			this.editing = true;
		});
		channel24Input.addEventListener('focusout', () => {
			this.editing = false;
			const old = node.wireless.channel24;
			node.wireless.channel24 = parseInt(channel24Input.value, 10);
			socket.sendnode(node, (msg)=>{
				if (!msg.body) {
					node.wireless.channel24 = old;
					channel24Input.value = old;
				}
			});
		});

		for (i = 0; i < store.channelsWifi5.length; i++) {
			const opt = domlib.newAt(channel5Input,'option',{
				'value': store.channelsWifi5[i],
			},store.channelsWifi5[i]);

			if(store.channelsWifi5[i] === node.wireless.channel5) {
				opt.selected = true;
			}
		}
		channel5Input.addEventListener('focusin', () => {
			this.editing = true;
		});
		channel5Input.addEventListener('focusout', () => {
			this.editing = false;
			const old = node.wireless.channel5;
			node.wireless.channel5 = parseInt(channel5Input.value, 10);
			socket.sendnode(node, (msg)=>{
				if (!msg.body) {
					node.wireless.channel5 = old;
					channel5Input.value = old;
				}
			});
		});

		/* eslint-disable no-underscore-dangle */
		if (node._wireless) {
			domlib.newAt(curpower, 'span').textContent = node._wireless.txpower24 || '-';
			domlib.newAt(curpower, 'span').textContent = node._wireless.txpower5 || '-';
		}
		/* eslint-enable no-underscore-dangle */

		power24Input.value = node.wireless.txpower24 || '';
		power24Input.type = 'number';
		power24Input.min = 1;
		power24Input.max = 23;
		power24Input.setAttribute('placeholder', '-');
		power24Input.addEventListener('focusout', () => {
			this.editing = false;
			const old = node.wireless.txpower24;
			node.wireless.txpower24 = parseInt(power24Input.value, 10);
			socket.sendnode(node, (msg)=>{
				if (!msg.body) {
					node.wireless.txpower24 = old;
					power24Input.value = old;
				}
			});
		});

		power5Input.value = node.wireless.txpower5 || '';
		power5Input.type = 'number';
		power5Input.min = 1;
		power5Input.max = 23;
		power5Input.setAttribute('placeholder', '-');
		power5Input.addEventListener('focusout', () => {
			this.editing = false;
			const old = node.wireless.txpower5;
			node.wireless.txpower5 = parseInt(power5Input.value, 10);
			socket.sendnode(node, (msg)=>{
				if (!msg.body) {
					node.wireless.txpower5 = old;
					power5Input.value = old;
				}
			});
		});

		domlib.newAt(client, 'span').textContent = node.statistics.clients.wifi24;
		domlib.newAt(client, 'span').textContent = node.statistics.clients.wifi5;

		/* eslint-disable id-length, no-magic-numbers,one-var */
		const chanUtil24 = node.statistics.wireless
				? node.statistics.wireless.filter((d) => d.frequency < 5000)[0] || {}
				: {},
			chanUtil5 = node.statistics.wireless
				? node.statistics.wireless.filter((d) => d.frequency > 5000)[0] || {}
				: {};
		/* eslint-enable id-length, no-magic-numbers,one-var */

		domlib.newAt(chanUtil, 'span').textContent = chanUtil24.ChanUtil || '-';
		domlib.newAt(chanUtil, 'span').textContent = chanUtil5.ChanUtil || '-';

		edit.classList.add('btn');
		edit.textContent = 'Edit';
		edit.addEventListener('click', () => {
			gui.router.navigate(gui.router.generate('node', {'nodeID': node.node_id}));
		});

		return tr;
	}



	sortTable (head) {
		if (this.sortIndex) {
			this.sortIndex.classList.remove('sort-up', 'sort-down');
		}
		this.sortReverse = head === this.sortIndex
			? !this.sortReverse
			: false;
		this.sortIndex = head;

		this.sortIndex.classList.add(this.sortReverse
			? 'sort-up'
			: 'sort-down');

		this.render();
	}

	render () {
		this.debouncer.run(() => { this.renderView(); });
	}

	renderView () {
		if (this.editing && this.tbody) {
			return;
		}
		while(this.tbody.hasChildNodes()) {
			this.tbody.removeChild(this.tbody.firstElementChild);
		}
		let nodes = store.getNodes();

		if (this.hostnameFilter && this.hostnameFilter.value !== '') {
			// eslint-disable-next-line id-length
			nodes = nodes.filter((d) => d.hostname.toLowerCase().indexOf(this.hostnameFilter.value.toLowerCase()) > -1);
		}
		if (this.nodeidFilter && this.nodeidFilter.value !== '') {
			// eslint-disable-next-line id-length
			nodes = nodes.filter((d) => d.node_id.indexOf(this.nodeidFilter.value.toLowerCase()) > -1);
		}

		nodes = nodes.sort(this.sort(this.sortIndex, this.sortReverse));

		if (this.sortReverse) {
			nodes = nodes.reverse();
		}

		var numDisplayedNodes = nodes.length;
		if (this.maxDisplayedNodes != -1) {
			numDisplayedNodes = Math.min(this.maxDisplayedNodes, numDisplayedNodes);
		}

		var fragment = document.createDocumentFragment();
		for (let i = 0; i < numDisplayedNodes; i += 1) {
			const row = this.renderRow(nodes[i]);
			fragment.appendChild(row);
		}
		this.tbody.appendChild(fragment);

		this.footerNote.innerHTML = numDisplayedNodes + " of " + nodes.length + " nodes. Show: ";
	}
}
