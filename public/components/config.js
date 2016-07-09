'use strict';
angular.module('config', [])
	.factory('config', function() {
		return {
			api: 'https://mgmt.ffhb.de/api',
			map: {
				view: {lat: 53.0702, lng: 8.815, zoom: 16},
				geojson: {
					pointToLayer: function (feature, latlng){
						feature.properties.radius = 10;
						return L.circleMarker(latlng, feature.properties);
					},
					onEachFeature: function(feature, layer) {
						if(feature.properties.name.length >0){
							layer.bindLabel(feature.properties.name);
						}
					},
					style: function(feature){
						if(feature.geometry.type === 'LineString' || feature.geometry.type === 'Polygon'){
							return {color: feature.properties.stroke,
								opacity:feature.properties['stroke-opacity'],
								fillColor: feature.properties.fill,
								fillOpacity:feature.properties['fill-opacity'],
								stroke: true,
								weight: feature.properties['stroke-width'],
								lineCap: 'round',
								lineJoin: 'round'};
						}
						return {
							color: feature.properties['marker-color'],
							fillColor: feature.properties['marker-color'],
							fillOpacity: 0.2,
							weight: 2,
							stroke: true
						};
					}
				}
			},
			geojson: 'https://meshviewer.breminale.ffhb.de/data/meshviewer.geojson',
			refresh: 60000
		};
	});
