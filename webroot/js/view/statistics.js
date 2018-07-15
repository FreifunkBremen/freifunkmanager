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
			}
		});
		socket.addEvent('node-current', this.updateChannelTable.bind(this));
		socket.addEvent('channels_wifi24', this.updateChannelTable.bind(this));
		socket.addEvent('channels_wifi5', this.updateChannelTable.bind(this));
	}
	updateChannelTable (){
		while(this.channelTabelle.hasChildNodes()) {
			this.channelTabelle.removeChild(this.channelTabelle.firstElementChild);
		}
		if(!store.channelsWifi24 || !store.channelsWifi5) {
			return
		}
		const storeNodes = store.getNodes(),
		 end = Math.max(store.channelsWifi24.length||0,store.channelsWifi5.length||0);

		let tr = domlib.newAt(this.channelTabelle, 'tr');

		let title = domlib.newAt(tr, 'th');
		title.innerHTML = '2.4 Ghz';
		title.setAttribute('colspan', '2');

		title = domlib.newAt(tr, 'th');
		title.innerHTML = '5 Ghz';
		title.setAttribute('colspan', '2');

		for (let i = 0; i <= end; i++) {
			tr = domlib.newAt(this.channelTabelle, 'tr');
			const wifi24Channel = store.channelsWifi24[i],
			 wifi5Channel = store.channelsWifi5[i];
			if (wifi24Channel) {
				domlib.newAt(tr, 'td').innerHTML = wifi24Channel;
				domlib.newAt(tr, 'td').innerHTML = storeNodes.reduce((c, node) => node.wireless.channel24 === wifi24Channel ? c + 1 : c, 0);
			} else {
				domlib.newAt(tr, 'td');
				domlib.newAt(tr, 'td');
			}
			if (wifi5Channel) {
				domlib.newAt(tr, 'td').innerHTML = wifi5Channel;
				domlib.newAt(tr, 'td').innerHTML = storeNodes.reduce((c, node) => node.wireless.channel5 === wifi5Channel ? c + 1 : c, 0);
			} else {
				domlib.newAt(tr, 'td');
				domlib.newAt(tr, 'td');
			}
		}
	}
}
