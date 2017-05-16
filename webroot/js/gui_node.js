/* exported guiNode */
/* globals store, socket, domlib, config,notify */

const guiNode = {};

(function init () {
	'use strict';

	const view = guiNode;

	let container = null,
		el = null,

		titleName = null,
		titleID = null,
		ago = null,

		marker = null,
		map = null,
		geoJsonLayer = null,
		btnGPS = null,

		editLocationGPS = null,
		storePosition = null,
		currentNodeID = null,
		editing = false;

	function updatePosition (lat, lng) {
		const node = store.getNode(currentNodeID),
			newLat = lat || storePosition.latitude || false,
			newlng = lng || storePosition.longitude || false;

		if (!newLat || !newlng) {
			return;
		}

		node.location = {
			'latitude': newLat,
			'longitude': newlng
		};
		socket.sendnode(node);
	}

	function update () {
		geoJsonLayer.refresh();
		titleID.innerHTML = currentNodeID;
		const node = store.getNode(currentNodeID),
			startdate = new Date();

		if (!node) {
			console.log(`node not found: ${currentNodeID}`);

			return;
		}

		startdate.setMinutes(startdate.getMinutes() - 1);
		if (new Date(node.lastseen) < startdate) {
			ago.classList.add('offline');
			ago.classList.remove('online');
		} else {
			ago.classList.remove('offline');
			ago.classList.add('online');
		}
		ago.innerHTML = `${moment(node.lastseen).fromNow()} (${node.lastseen})`;
		if (editLocationGPS || editing || !node.location || !node.location.latitude || !node.location.longitude) {
			return;
		}
		titleName.innerHTML = node.hostname;
		// eslint-disable-next-line one-var
		const latlng = [node.location.latitude, node.location.longitude];

		map.setView(latlng);
		marker.setLatLng(latlng);
		marker.setOpacity(1);
	}

	view.setNodeID = function setNodeID (nodeID) {
		currentNodeID = nodeID;
	};

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
		console.log('generate new view for node');
		el = domlib.newAt(container, 'div');

		const title = domlib.newAt(el, 'h1'),
			lastseen = domlib.newAt(el, 'p'),
			mapEl = domlib.newAt(el, 'div');

		titleName = domlib.newAt(title, 'span');
		title.appendChild(document.createTextNode('  -  '));
		titleID = domlib.newAt(title, 'i');


		domlib.newAt(lastseen, 'span').innerHTML = 'Lastseen: ';
		ago = domlib.newAt(lastseen, 'span');


		mapEl.style.height = '300px';
		map = L.map(mapEl).setView(config.map.view.bound, config.map.view.zoom);

		L.tileLayer(config.map.tileLayer, {
			'maxZoom': config.map.maxZoom
		}).addTo(map);

		geoJsonLayer = L.geoJson.ajax(config.map.geojson.url,
			config.map.geojson);
		geoJsonLayer.addTo(map);

		marker = L.marker(config.map.view.bound, {'draggable': true,
			'opacity': 0.5}).addTo(map);

		marker.on('dragstart', () => {
			editing = true;
		});

		marker.on('dragend', () => {
			editing = false;
			const pos = marker.getLatLng();

			updatePosition(pos.lat, pos.lng);
		});


		btnGPS = domlib.newAt(el, 'span');
		btnGPS.classList.add('btn');
		btnGPS.innerHTML = 'Start follow position';
		btnGPS.addEventListener('click', () => {
			if (editLocationGPS) {
				if (btnGPS.innerHTML === 'Stop following') {
					updatePosition();
				}
				btnGPS.innerHTML = 'Start follow position';
				navigator.geolocation.clearWatch(editLocationGPS);
				editLocationGPS = false;

				return;
			}
			btnGPS.innerHTML = 'Following position';
			if (navigator.geolocation) {
				editLocationGPS = navigator.geolocation.watchPosition((position) => {
					btnGPS.innerHTML = 'Stop following';
					storePosition = position.coords;
					const latlng = [position.coords.latitude, position.coords.longitude];

					marker.setLatLng(latlng);
					map.setView(latlng);
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
		update();
	};
})();
