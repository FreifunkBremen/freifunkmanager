import * as domlib from '../domlib';
import * as gui from '../gui';
import * as lib from '../lib';
import * as socket from '../socket';
import * as store from '../store';
import * as V from 'superfine';
import Table from '../table';
import config from '../config';
import View from '../view';
import {FromNowAgo} from '../lib';

export class ListView extends View {

	constructor () {
		super();

		this.debouncer = new lib.Debouncer(1000, "list render");

		this.filter = domlib.newAt(this.el, 'input', {
			'placeholder': 'Search',
			'style': 'width: 100%;border: 0px; border-bottom: 2px inset;',
		});
		this.filter.addEventListener('keyup', () => {
			this.render();
		});

		this.table = new Table(domlib.newAt(this.el, 'div'),{
			class: 'nodes',
		},[
			{
				name:'Lastseen',
				sort: (a, b) => new Date(a.lastseen) - new Date(b.lastseen),
				reverse: false
			},
			{
				name:'NodeID',
				sort: (a, b) => a.node_id.localeCompare(b.node_id),
				reverse: false
			},
			{
				name:'Hostname',
				sort: (a, b) => a.hostname.localeCompare(b.hostname),
				reverse: false
			},
			{ name:'Freq' },
			{
				name:'CurCh',
				sort: (a, b) => (a.wireless_respondd ? a.wireless_respondd.channel24 : 0) - (b.wireless_respondd ? b.wireless_respondd.channel24 : 0),
				reverse: false
			},
			{
				name:'Channel',
				sort: (a, b) => a.wireless.channel24 - b.wireless.channel24,
				reverse: false
			},
			{
				name:'CurPW',
				sort: (a, b) => (a.wireless_respondd ? a.wireless_respondd.txpower24 : 0) - (b.wireless_respondd ? b.wireless_respondd.txpower24 : 0),
				reverse: false
			},
			{
				name:'Power',
				sort: (a, b) => a.wireless.txpower24 - b.wireless.txpower24,
				reverse: false
			},
			{
				name:'Clients',
				sort: (a, b) => a.statistics_respondd.clients.wifi24 - b.statistics_respondd.clients.wifi24,
				reverse: false
			},
			{
				name:'ChanUtil',
				sort: (a, b) => (a.statistics_respondd.wireless ? a.statistics_respondd.wireless.filter((d) => d.frequency < 5000)[0].ChanUtil || 0 : 0) - (b.statistics_respondd.wireless ? b.statistics_respondd.wireless.filter((d) => d.frequency < 5000)[0].ChanUtil || 0 : 0),
				reverse: false
			},
			{ name:'Options' }
		], 1, this.renderRow.bind(this));
	}

	renderRow (node) {
		const startdate = new Date(),
			channel24Options = [],
			channel5Options = [];
		startdate.setMinutes(startdate.getMinutes() - config.node.offline);


		let i = 0;
		for (i = 0; i < store.channelsWifi24.length; i++) {
			channel24Options.push(V.h('option', {
				'value': store.channelsWifi24[i],
				'selected': (store.channelsWifi24[i] === node.wireless.channel24),
			}, store.channelsWifi24[i]));
		}
		for (i = 0; i < store.channelsWifi5.length; i++) {
			channel5Options.push(V.h('option', {
				'value': store.channelsWifi5[i],
				'selected': (store.channelsWifi5[i] === node.wireless.channel5),
			}, store.channelsWifi5[i]));
		}


		return V.h('tr', {},[
				V.h('td', {
					'class':(new Date(node.lastseen) < startdate)?'offline':(!node.wireless_respondd)?'unseen':''
				}, FromNowAgo(node.lastseen)),
				V.h('td', {}, node.node_id),
				V.h('td', {}, V.h('input',{
					'value': this._hostname || node.hostname,
					'oninput':(e) => {
						this._hostname = e.target.value;
					},
					'onfocusout':(e) => {
						delete this._hostname;

						const old = node.hostname;
						node.hostname = e.target.value;
						socket.sendnode(node, (msg)=>{
							if (!msg.body) {
								node.hostname = old;
								e.target.value = old;
							}
						});
					}
				})),
				V.h('td', {}, [
					V.h('span', {},'2.4 GHz'),
					V.h('span', {},'5 GHz')
				]),
				V.h('td', {}, [
					V.h('span', {}, node.wireless_respondd ? node.wireless_respondd.channel24 || '-':'-'),
					V.h('span', {}, node.wireless_respondd ? node.wireless_respondd.channel5 || '-':'-')
				]),
				V.h('td', {}, [
					V.h('span', {},  V.h('select',{
						'onfocusout':(e) => {
							const old = node.wireless.channel24;
							node.wireless.channel24 = parseInt(e.target.value, 10);
							socket.sendnode(node, (msg)=>{
								if (!msg.body) {
									node.wireless.channel24 = old;
									e.target.value = old;
								}
							});
						}
					}, channel24Options)),
					V.h('span', {},  V.h('select',{
						'onfocusout':(e) => {
							const old = node.wireless.channel5;
							node.wireless.channel5 = parseInt(e.target.value, 10);
							socket.sendnode(node, (msg)=>{
								if (!msg.body) {
									node.wireless.channel5 = old;
									e.target.value = old;
								}
							});
						}
					}, channel5Options))
				]),
				V.h('td', {}, [
					V.h('span', {}, node.wireless_respondd ? node.wireless_respondd.txpower24 || '-':'-'),
					V.h('span', {}, node.wireless_respondd ? node.wireless_respondd.txpower5 || '-':'-')
				]),
				V.h('td', {}, [
					V.h('span', {},  V.h('input',{
						'type': 'number',
						'min': 0,
						'max': 23,
						'value': this._txpower24 || node.wireless.txpower24,
						'oninput':(e) => {
							this._txpower24 = e.target.value;
						},
						'onfocusout':(e) => {
							delete this._txpower24;

							const old = node.wireless.txpower24;
							node.wireless.txpower24 = parseInt(e.target.value, 10);
							socket.sendnode(node, (msg)=>{
								if (!msg.body) {
									node.wireless.txpower24 = old;
									e.target.value = old;
								}
							});
						}
					})),
					V.h('span', {},  V.h('input',{
						'type': 'number',
						'min': 0,
						'max': 23,
						'value': this._txpower5 || node.wireless.txpower5,
						'oninput':(e) => {
							this._txpower5 = e.target.value;
						},
						'onfocusout':(e) => {
							delete this._txpower5;

							const old = node.wireless.txpower5;
							node.wireless.txpower5 = parseInt(e.target.value, 10);
							socket.sendnode(node, (msg)=>{
								if (!msg.body) {
									node.wireless.txpower5 = old;
									e.target.value = old;
								}
							});
						}
					}))
				]),
				V.h('td', {}, [
					V.h('span', {}, node.statistics_respondd.clients.wifi24),
					V.h('span', {}, node.statistics_respondd.clients.wifi5)
				]),
				V.h('td', {}, [
					V.h('span', {}, node.statistics_respondd.wireless ? (node.statistics_respondd.wireless.filter((d) => d.frequency < 5000)[0] || {ChanUtil: '-'}).ChanUtil   : '-'),
					V.h('span', {}, node.statistics_respondd.wireless ? (node.statistics_respondd.wireless.filter((d) => d.frequency > 5000)[0] || {ChanUtil: '-'}).ChanUtil  : '-'),
				]),
				V.h('td', {}, [
					V.h('a',{
						'class':'btn',
						'href':gui.router.generate('node', {'nodeID': node.node_id})
					}, 'Edit')
				]),
		]);
	}

	render () {
		this.debouncer.run(() => { this.renderView(); });
	}

	renderView () {
		let nodes = store.getNodes();

		if (this.filter && this.filter.value !== '') {
			// eslint-disable-next-line id-length
			nodes = nodes.filter((d) => {
				return d.node_id.toLowerCase().indexOf(this.filter.value.toLowerCase()) > -1 ||
				d.hostname.toLowerCase().indexOf(this.filter.value.toLowerCase()) > -1 ||
				d.owner.toLowerCase().indexOf(this.filter.value.toLowerCase()) > -1
			});
		}

		this.table.setData(nodes);
	}
}
