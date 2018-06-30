import '../node_modules/leaflet/dist/leaflet.js';
import '../node_modules/leaflet-ajax/dist/leaflet.ajax.min.js';
import '../node_modules/leaflet-webgl-heatmap/src/webgl-heatmap/webgl-heatmap.js';
import '../node_modules/leaflet-webgl-heatmap/src/leaflet-webgl-heatmap.js';

import * as gui from './gui';
import config from './config';

/**
 * Self binding with router
 */
import {ListView} from './view/list';
import {MapView} from './view/map';
import {StatisticsView} from './view/statistics';

import {NodeView} from './view/node';

document.title = config.title;
window.onload = () => {
	const listView = new ListView();
	const mapView = new MapView();
	const statisticsView = new StatisticsView();

	const nodeView = new NodeView();

	gui.router.on({
		'/list': () => gui.setView(listView),
		'/map': () => gui.setView(mapView),
		'/statistics': () => gui.setView(statisticsView),
		'/n/:nodeID': {
			'as': 'node',
			// eslint-disable-next-line func-name-matching
			'uses': (params) => {
				nodeView.setNodeID(params.nodeID.toLowerCase());
				gui.setView(nodeView);
			}
		}
	}).on(() => {
		gui.router.navigate('/list');
	});

		gui.render();

}
