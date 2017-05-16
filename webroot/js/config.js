/* exported config */

/* eslint no-magic-numbers: "off"*/
/* eslint sort-keys: "off"*/

const config = {
	'title': 'FreifunkManager - Breminale',
	'backend': `ws://${location.host}/websocket`,
	'map': {
		'view': {
			'bound': [53.07093, 8.79464],
			'zoom': 17
		},
		'maxZoom': 20,
		'tileLayer': 'https://tiles.bremen.freifunk.net/{z}/{x}/{y}.png',

    /* Heatmap settings
     size: in meters (default: 30km)
     opacity: in percent/100 (default: 1)
     gradientTexture: url-to-texture-image (default: false)
     alphaRange: change transparency in heatmap (default: 1)
     autoresize: resize heatmap when map size changes (default: false)
     */
		'heatmap': {
			'wifi24': {
				'size': 230,
				'opacity': 0.5,
				'alphaRange': 1
			},
			'wifi5': {
				'size': 230,
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
			'url': 'http://events.ffhb.de/data/ground.geojson',
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
