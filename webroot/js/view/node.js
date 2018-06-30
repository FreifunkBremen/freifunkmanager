
import * as domlib from '../domlib';
import * as gui from '../gui';
import * as socket from '../socket';
import * as store from '../store';
import config from '../config';
import View from '../view';
import {singelton as notify} from '../element/notify';
import {FromNowAgo} from '../lib';
//import '../../node_modules/leaflet/dist/leaflet.js';
//import '../../node_modules/leaflet-ajax/dist/leaflet.ajax.min.js';
//import '../../node_modules/moment/min/moment.min.js';

export class NodeView extends View {

	constructor () {
		super();

		const title = domlib.newAt(this.el, 'h1'),
			lastseen = domlib.newAt(this.el, 'p'),
			hostname = domlib.newAt(this.el, 'p'),
			owner = domlib.newAt(this.el, 'p'),
			mapEl = domlib.newAt(this.el, 'div');

		this.titleName = domlib.newAt(title, 'span');
		title.appendChild(document.createTextNode('  -  '));
		this.titleID = domlib.newAt(title, 'i');


		domlib.newAt(lastseen, 'span').innerHTML = 'Lastseen: ';
		this.ago = domlib.newAt(lastseen, 'span');

		domlib.newAt(hostname, 'span').innerHTML = 'Hostname: ';
		this.hostnameInput = domlib.newAt(hostname, 'input');
		this.hostnameInput.setAttribute('placeholder', 'Hostname');
		this.hostnameInput.addEventListener('focusin', () => {
			this.editing = true;
		});
		this.hostnameInput.addEventListener('focusout', () => {
			this.editing = false;

			const node = store.getNode(this.currentNodeID),
				old = node.hostname;

			node.hostname = this.hostnameInput.value;

			socket.sendnode(node, (msg)=>{
				if (!msg.body) {
					node.hostname = old;
				}
			});
		});

		domlib.newAt(owner, 'span').innerHTML = 'Owner: ';
		this.ownerInput = domlib.newAt(owner, 'input');
		this.ownerInput.setAttribute('placeholder', 'Owner');
		this.ownerInput.addEventListener('focusin', () => {
			this.editing = true;
		});
		this.ownerInput.addEventListener('focusout', () => {
			this.editing = false;

			const node = store.getNode(this.currentNodeID),
				old = node.owner;

			node.owner = this.ownerInput.value;

			socket.sendnode(node, (msg)=>{
				if (!msg.body) {
					node.owner = old;
				}
			});
		});


		mapEl.style.height = '300px';

		this.map = L.map(mapEl).setView(config.map.view.bound, config.map.view.zoom);

		L.tileLayer(config.map.tileLayer, {
			'maxZoom': config.map.maxZoom
		}).addTo(this.map);

		this.geoJsonLayer = L.geoJson.ajax(config.map.geojson.url,
			config.map.geojson);
		this.geoJsonLayer.addTo(this.map);

		this.marker = L.marker(config.map.view.bound, {'draggable': true,
			'opacity': 0.5}).addTo(this.map);

		this.marker.on('dragstart', () => {
			this.editing = true;
		});

		this.marker.on('dragend', () => {
			this.editing = false;
			const pos = this.marker.getLatLng();

			this.updatePosition(pos.lat, pos.lng);
		});


		this.btnGPS = domlib.newAt(this.el, 'span');
		this.btnGPS.classList.add('btn');
		this.btnGPS.innerHTML = 'Start follow position';
		this.btnGPS.addEventListener('click', () => {
			if (this.editLocationGPS) {
				if (this.btnGPS.innerHTML === 'Stop following') {
					updatePosition();
				}
				this.btnGPS.innerHTML = 'Start follow position';
				navigator.geolocation.clearWatch(this.editLocationGPS);
				this.editLocationGPS = false;

				return;
			}
			this.btnGPS.innerHTML = 'Following position';
			if (navigator.geolocation) {
				this.editLocationGPS = navigator.geolocation.watchPosition((position) => {
					this.btnGPS.innerHTML = 'Stop following';
					this.this.storePosition = position.coords;
					const latlng = [position.coords.latitude, position.coords.longitude];

					this.marker.setLatLng(latlng);
					this.map.setView(latlng);
				}, (error) => {
					switch (error.code) {
					case error.TIMEOUT:
						notify.send('error', 'Find Location timeout');
						break;
					default:
						console.error('a navigator geolocation error: ', error);
					}
				},
					{
						'enableHighAccuracy': true,
						'maximumAge': 30000,
						'timeout': 27000
					});
			} else {
				notify.send('error', 'Browser did not support Location');
			}
		});
	}

	updatePosition (lat, lng) {
		const node = store.getNode(this.currentNodeID),
			newLat = lat || this.storePosition.latitude || false,
			newlng = lng || this.storePosition.longitude || false;

		if (!newLat || !newlng) {
			return;
		}

		node.location = {
			'latitude': newLat,
			'longitude': newlng
		};
		socket.sendnode(node);
	}

	render () {
		this.geoJsonLayer.refresh();
		this.titleID.innerHTML = this.currentNodeID;
		const node = store.getNode(this.currentNodeID),
			startdate = new Date();

		if (!node) {
			console.log(`node not found: ${this.currentNodeID}`);

			return;
		}

		startdate.setMinutes(startdate.getMinutes() - config.node.offline);
		if (new Date(node.lastseen) < startdate) {
			this.ago.classList.add('offline');
			this.ago.classList.remove('online');
		} else {
			this.ago.classList.remove('offline');
			this.ago.classList.add('online');
		}
		this.ago.innerHTML = `${FromNowAgo(node.lastseen)} (${node.lastseen})`;
		if (this.editLocationGPS || this.editing || !node.location || !node.location.latitude || !node.location.longitude) {
			return;
		}
		this.titleName.innerHTML = node.hostname;
		this.hostnameInput.value = node.hostname;
		this.ownerInput.value = node.owner;

		// eslint-disable-next-line one-var
		const latlng = [node.location.latitude, node.location.longitude];

		this.map.setView(latlng);
		this.marker.setLatLng(latlng);
		this.marker.setOpacity(1);
		this.map.invalidateSize();
	}

	setNodeID (nodeID) {
		this.currentNodeID = nodeID;
	}

}
