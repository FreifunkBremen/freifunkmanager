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
				sort: (a, b) => a.lastseen - b.lastseen,
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
				sort: (a, b) => (a._wireless ? a._wireless.channel24 : 0) - (b._wireless ? b._wireless.channel24 : 0),
				reverse: false
			},
			{
				name:'Channel',
				sort: (a, b) => a.wireless.channel24 - b.wireless.channel24,
				reverse: false
			},
			{
				name:'CurPW',
				sort: (a, b) => (a._wireless ? a._wireless.txpower24 : 0) - (b._wireless ? b._wireless.txpower24 : 0),
				reverse: false
			},
			{
				name:'Power',
				sort: (a, b) => a.wireless.txpower24 - b.wireless.txpower24,
				reverse: false
			},
			{
				name:'Clients',
				sort: (a, b) => a.statistics.clients.wifi24 - b.statistics.clients.wifi24,
				reverse: false
			},
			{
				name:'ChanUtil',
				sort: (a, b) => (a.statistics.wireless ? a.statistics.wireless.filter((d) => d.frequency < 5000)[0].ChanUtil : 0) - (b.statistics.wireless ? b.statistics.wireless.filter((d) => d.frequency < 5000)[0].ChanUtil : 0),
				reverse: false
			},
			{ name:'Options' }
		], 1, this.renderRow);

		this.maxDisplayedNodes = localStorage.getItem("maxDisplayedNodes");
		if (this.maxDisplayedNodes == null) {
			this.maxDisplayedNodes = 20;
		}

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
					'class':(new Date(node.lastseen) < startdate)?'offline':(!node._wireless)?'unseen':''
				}, FromNowAgo(node.lastseen)),
				V.h('td', {}, node.node_id),
				V.h('td', {}, V.h('input',{
					'value': node.hostname,
					'onfocusout':(e)=>{
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
					V.h('span', {}, node._wireless ? node._wireless.channel24 || '-':'-'),
					V.h('span', {}, node._wireless ? node._wireless.channel5 || '-':'-')
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
					V.h('span', {}, node._wireless ? node._wireless.txpower24 || '-':'-'),
					V.h('span', {}, node._wireless ? node._wireless.txpower5 || '-':'-')
				]),
				V.h('td', {}, [
					V.h('span', {},  V.h('input',{
						'type': 'number',
						'min': 0,
						'max': 23,
						'value': node.wireless.txpower24,
						'onfocusout':(e) => {
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
						'value': node.wireless.txpower5,
						'onfocusout':(e) => {
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
					V.h('span', {}, node.statistics.clients.wifi24),
					V.h('span', {}, node.statistics.clients.wifi5)
				]),
				V.h('td', {}, [
					V.h('span', {}, node.statistics.wireless ? node.statistics.wireless.filter((d) => d.frequency < 5000)[0].ChanUtil : '-'),
					V.h('span', {}, node.statistics.wireless ? node.statistics.wireless.filter((d) => d.frequency > 5000)[0].ChanUtil : '-'),
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

		var numDisplayedNodes = nodes.length;
		if (this.maxDisplayedNodes != -1) {
			numDisplayedNodes = Math.min(this.maxDisplayedNodes, numDisplayedNodes);
		}

		var data = [];
		for (let i = 0; i < numDisplayedNodes; i += 1) {
			data.push(nodes[i]);
		}
		this.table.setData(data)

		this.footerNote.innerHTML = numDisplayedNodes + " of " + nodes.length + " nodes. Show: ";
	}
}
