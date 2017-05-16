/* exported guiMap */
/* global config,store,domlib,socket */

const guiMap = {};

(function init () {
	'use strict';

	const view = guiMap,
		WINDOW_HEIGHT_MENU = 50;

	let container = null,
		el = null,

		geoJsonLayer = null,
		nodeLayer = null,
		clientLayer24 = null,
		clientLayer5 = null;
	// , draggingNodeID=null;

	function addNode (node) {
		/* eslint-disable-line https://github.com/Leaflet/Leaflet/issues/4484
			if(node.node_id === draggingNodeID){
				return
			}
		*/

		if (!node.location || !node.location.latitude || !node.location.longitude) {
			return;
		}
		let className = 'node',
			wifi24 = '-',
			wifi5 = '-';
		const startdate = new Date(),
			ch24 = node.wireless.channel24 || '-',
			ch5 = node.wireless.channel5 || '-',
			tx24 = node.wireless.txpower24 || '-',
			tx5 = node.wireless.txpower5 || '-';

		startdate.setMinutes(startdate.getMinutes() - 1);
		if (new Date(node.lastseen) < startdate) {
			className += ' offline';
		}


		if (node.statistics && node.statistics.clients) {
			// eslint-disable-next-line prefer-destructuring
			wifi24 = node.statistics.clients.wifi24;

			if (wifi24 < config.map.icon.warn.wifi24 && wifi24 > 0) {
				className += ' client24';
			} else if (wifi24 < config.map.icon.crit.wifi24 && wifi24 >= config.map.icon.warn.wifi24) {
				className += ' client24-warn';
			} else if (wifi24 >= config.map.icon.crit.wifi24) {
				className += ' client24-crit';
			}
			// eslint-disable-next-line prefer-destructuring
			wifi5 = node.statistics.clients.wifi5;

			if (wifi5 < config.map.icon.warn.wifi5 && wifi5 > 0) {
				className += ' client5';
			} else if (wifi5 < config.map.icon.crit.wifi5 && wifi5 >= config.map.icon.warn.wifi5) {
				className += ' client5-warn';
			} else if (wifi5 >= config.map.icon.crit.wifi5) {
				className += ' client5-crit';
			}
		}

		// eslint-disable-next-line one-var
		const nodemarker = L.marker([node.location.latitude, node.location.longitude], {
			'draggable': true,
			'icon': L.divIcon({'className': className})
		});

		nodemarker.bindTooltip(`${node.hostname} <div class='nodeicon-label'>(${node.node_id})` +
			'<table>' +
				'<tr><th></th><th>Cl</th><th>Ch</th><th>Tx</th></tr>' +
				`<tr><td>2.4G</td><td>${wifi24}</td><td>${ch24}</td><td>${tx24}</td></tr>` +
				`<tr><td>5G</td><td>${wifi5}</td><td>${ch5}</td><td>${tx5}</td></tr>` +
			'</table>' +
		'</div>'
		);

		/*
			Nodemarker.on('dragstart',function(){
			draggingNodeID = node.node_id;
			})
		*/
		nodemarker.on('dragend', () => {
			// DraggingNodeID = undefined;
			const pos = nodemarker.getLatLng();

			node.location = {
				'latitude': pos.lat,
				'longitude': pos.lng
			};
			socket.sendnode(node);
		});
		nodeLayer.addLayer(nodemarker);
	}

	function update () {
		geoJsonLayer.refresh();
		nodeLayer.clearLayers();

		const nodes = store.getNodes();

		for (let i = 0; i < nodes.length; i += 1) {
			addNode(nodes[i]);
		}


		clientLayer24.setData(nodes.map((node) => {
			if (!node.location || !node.location.latitude || !node.location.longitude) {
				return null;
			}

			return [node.location.latitude, node.location.longitude, node.statistics.clients.wifi24 || 0];
		}));

		clientLayer5.setData(nodes.map((node) => {
			if (!node.location || !node.location.latitude || !node.location.longitude) {
				return null;
			}

			return [node.location.latitude, node.location.longitude, node.statistics.clients.wifi5 || 0];
		}));
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
		console.log('generate new view for map');
		el = domlib.newAt(container, 'div');

		el.style.height = `${window.innerHeight - WINDOW_HEIGHT_MENU}px`;

		const map = L.map(el).setView(config.map.view.bound, config.map.view.zoom),
			layerControl = L.control.layers().addTo(map);

		L.tileLayer(config.map.tileLayer, {
			'maxZoom': config.map.maxZoom
		}).addTo(map);


		geoJsonLayer = L.geoJson.ajax(config.map.geojson.url, config.map.geojson);

		nodeLayer = L.layerGroup();
		/* eslint-disable new-cap */
		clientLayer24 = new L.webGLHeatmap(config.map.heatmap.wifi24);
		clientLayer5 = new L.webGLHeatmap(config.map.heatmap.wifi5);
		/* eslint-enable new-cap */
		layerControl.addOverlay(geoJsonLayer, 'geojson');
		layerControl.addOverlay(nodeLayer, 'Nodes');
		layerControl.addOverlay(clientLayer24, 'Clients 2.4 Ghz');
		layerControl.addOverlay(clientLayer5, 'Clients 5 Ghz');
		nodeLayer.addTo(map);

		window.addEventListener('resize', () => {
			el.style.height = `${window.innerHeight - WINDOW_HEIGHT_MENU}px`;
			map.invalidateSize();
		});

		update();
	};
})();
