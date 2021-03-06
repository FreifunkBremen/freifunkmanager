/* eslint no-magic-numbers: "off"*/
/* eslint sort-keys: "off"*/

export default {
	'title': 'FreifunkManager - Breminale',
	'backend': `ws${location.protocol == 'https:' ? 's' : ''}://${location.host}${location.pathname}ws`,
	'node': {
		'channel24': 6,
		'channel5': 44,
		// Minuten till is shown as offline
		'offline': 5
	},
	'map': {
		'view': {
			'bound': [
				53.07103,
				8.81624
			],
			'zoom': 17
		},
		'maxZoom': 20,
		'tileLayer': 'https://tiles.bremen.freifunk.net/{z}/{x}/{y}.png',
		'heatmap': {
			'wifi24': {
				'size': 10,
				'units': 'm',
				'opacity': 0.5,
				'alphaRange': 1
			},
			'wifi5': {
				'size': 10,
				'units': 'm',
				'opacity': 0.5,
				'alphaRange': 1
			}
		},
		'icon': {
			'warn': {
				'wifi24': 20,
				'wifi5': 20
			},
			'crit': {
				'wifi24': 30,
				'wifi5': 30
			}
		},
		'geojson': {
			'url': 'https://raw.githubusercontent.com/FreifunkBremen/internal-maps/master/breminale.geojson',
			'pointToLayer': function pointToLayer (feature, latlng) {
				'use strict';

				feature.properties.radius = 10;

				return L.circleMarker(latlng, feature.properties);
			},
			'onEachFeature': function onEachFeature (feature, layer) {
				'use strict';

				if (feature.properties.name.length > 0) {
					layer.bindTooltip(feature.properties.name);
				}
			},
			'style': function style (feature) {
				'use strict';

				if (feature.geometry.type === 'LineString' || feature.geometry.type === 'Polygon') {
					return {
						'color': feature.properties.stroke,
						'opacity': feature.properties['stroke-opacity'],
						'fillColor': feature.properties.fill,
						'fillOpacity': feature.properties['fill-opacity'],
						'stroke': true,
						'weight': feature.properties['stroke-width'],
						'lineCap': 'round',
						'lineJoin': 'round'
					};
				}

				return {
					'color': feature.properties['marker-color'],
					'fillColor': feature.properties['marker-color'],
					'fillOpacity': 0.2,
					'weight': 2,
					'stroke': true
				};
			}
		}
	}
};
