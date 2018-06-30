import * as domlib from '../domlib';
import * as gui from '../gui';
import * as socket from '../socket';
import * as store from '../store';
import View from '../view';

export class StatisticsView extends View {

	constructor () {
		super();
		domlib.newAt(this.el, 'h1').innerHTML = 'Statistics';

		const table = domlib.newAt(this.el, 'table');

		table.classList.add('stats');

		let tr = domlib.newAt(table, 'tr'),
			title = domlib.newAt(tr, 'th');

		title.innerHTML = 'Nodes';
		title.setAttribute('colspan', '2');
		this.nodes = domlib.newAt(tr, 'td');

		tr = domlib.newAt(table, 'tr');
		title = domlib.newAt(tr, 'th');
		title.innerHTML = 'Clients';
		title.setAttribute('colspan', '2');
		this.clients = domlib.newAt(tr, 'td');

		tr = domlib.newAt(table, 'tr');
		tr.classList.add('line');
		domlib.newAt(tr, 'th').innerHTML = 'Wifi';
		domlib.newAt(tr, 'th').innerHTML = '2.4 Ghz';
		domlib.newAt(tr, 'th').innerHTML = '5 Ghz';

		tr = domlib.newAt(table, 'tr');
		this.clientsWifi = domlib.newAt(tr, 'td');
		this.clientsWifi24 = domlib.newAt(tr, 'td');
		this.clientsWifi5 = domlib.newAt(tr, 'td');

		// Channels table
		domlib.newAt(this.el, 'h1').innerHTML = 'Channels';
		this.channelTabelle = domlib.newAt(this.el, 'table');
		this.channelTabelle.classList.add('stats');

		socket.setEvent('stats', (msg) => {
			if (msg.body) {
				this.nodes.innerHTML = msg.body.Nodes;
				this.clients.innerHTML = msg.body.Clients;
				this.clientsWifi.innerHTML = msg.body.ClientsWifi;
				this.clientsWifi24.innerHTML = msg.body.ClientsWifi24;
				this.clientsWifi5.innerHTML = msg.body.ClientsWifi5;

				while(this.channelTabelle.hasChildNodes()) {
					this.channelTabelle.removeChild(this.channelTabelle.firstElementChild);
				}

				let tr = domlib.newAt(this.channelTabelle, 'tr');

				let title = domlib.newAt(tr, 'th');
				title.innerHTML = '2.4 Ghz';
				title.setAttribute('colspan', '2');

				title = domlib.newAt(tr, 'th');
				title.innerHTML = '5 Ghz';
				title.setAttribute('colspan', '2');
				const storeNodes = store.getNodes();
				for (let ch = 1; ch <= 33; ch++) {
					tr = domlib.newAt(this.channelTabelle, 'tr');
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
		});
	}
}
