import * as gui from '../gui';
import * as socket from '../socket';
import * as store from '../store';
import config from '../config';
import View from '../view';
import {WINDOW_HEIGHT_MENU}  from '../element/menu';
//import '../../node_modules/leaflet/dist/leaflet.js';
//import '../../node_modules/leaflet-webgl-heatmap/dist/leaflet-webgl-heatmap.min.js';
//import '../../node_modules/leaflet-ajax/dist/leaflet.ajax.min.js';


export class MapView extends View {

	constructor () {
		super();


		this.el.style.height = `${window.innerHeight - WINDOW_HEIGHT_MENU}px`;
		this.map = L.map(this.el).setView(config.map.view.bound, config.map.view.zoom);

		const layerControl = L.control.layers().addTo(this.map);

		L.tileLayer(config.map.tileLayer, {
			'maxZoom': config.map.maxZoom
		}).addTo(this.map);


		this.geoJsonLayer = L.geoJson.ajax(config.map.geojson.url, config.map.geojson);
		this.geoJsonLayer.name = "geojson";

		this.nodeLayer = L.layerGroup();
		this.nodeLayer.name = "nodes";
		/* eslint-disable new-cap */
		this.clientLayer24 = L.webGLHeatmap(config.map.heatmap.wifi24);
		this.clientLayer24.name = "clientLayer24";
		this.clientLayer5 = L.webGLHeatmap(config.map.heatmap.wifi5);
		this.clientLayer5.name = "clientLayer5";
		/* eslint-enable new-cap */
		layerControl.addOverlay(this.geoJsonLayer, 'geojson');
		layerControl.addOverlay(this.nodeLayer, 'Nodes');
		layerControl.addOverlay(this.clientLayer24, 'Clients 2.4 Ghz');
		layerControl.addOverlay(this.clientLayer5, 'Clients 5 Ghz');

		var enabledLayersStr = localStorage.getItem("mapLayers");
		if (enabledLayersStr == null) {
			// fall back to default list of enabled layers:
			enabledLayersStr = [this.nodeLayer.name].join();
		}

		const enabledLayers = enabledLayersStr.split(",");
		for (var i = 0; i < enabledLayers.length; i++) {
			const layerName = enabledLayers[i];
			for (var j = 0; j < layerControl._layers.length; j++) {
				if (layerControl._layers[j].layer.name == layerName) {
					layerControl._layers[j].layer.addTo(this.map);
					break;
				}
			}
		}

		this.map.on({
			overlayadd: (e) => {
				this.saveMapSelection();
			},
			overlayremove: (e) => {
				this.saveMapSelection();
			}
		});

		window.addEventListener('resize', () => {
			this.el.style.height = `${window.innerHeight - WINDOW_HEIGHT_MENU}px`;
			this.map.invalidateSize();
		});
	}

	saveMapSelection () {
		var enabledLayers = [];
		this.map.eachLayer((layer) => {
			if (layer.name) {
				enabledLayers.push(layer.name);
			}
		});
		localStorage.setItem("mapLayers", enabledLayers.join());
	}

	addNode (node) {
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

		startdate.setMinutes(startdate.getMinutes() - config.node.offline);
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
			const pos = nodemarker.getLatLng(),
				old = node.location;

			node.location = {
				'latitude': pos.lat,
				'longitude': pos.lng
			};
			socket.sendnode(node, (msg)=>{
				if (!msg.body) {
					node.location = old;
				}
			});
		});
		this.nodeLayer.addLayer(nodemarker);
	}

	render () {
		this.geoJsonLayer.refresh();
		this.nodeLayer.clearLayers();

		const nodes = store.getNodes();

		for (let i = 0; i < nodes.length; i += 1) {
			this.addNode(nodes[i]);
		}

		this.clientLayer24.setData(nodes.filter((node) => {
			return (node.location && node.location.latitude && node.location.longitude);
		}).map((node) => {
			return [node.location.latitude, node.location.longitude, node.statistics.clients.wifi24 || 0];
		}));

		this.clientLayer5.setData(nodes.filter((node) => {
			return (node.location && node.location.latitude && node.location.longitude);
		}).map((node) => {
			return [node.location.latitude, node.location.longitude, node.statistics.clients.wifi5 || 0];
		}));
		this.map.invalidateSize();
	}
}
