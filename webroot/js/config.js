var config = {
  title: 'FreifunkManager - Breminale',
  backend: 'ws://'+location.host+'/websocket',
  map: {
				view: {bound: [53.07093,  8.79464], zoom: 17},
				maxZoom: 20,
				tileLayer: '//tiles.bremen.freifunk.net/{z}/{x}/{y}.png',
				heatMax: {
					wifi24: 15,
					wifi5: 50
				},
				icon:{
					warn:{wifi24:20,wifi5:20},
					crit:{wifi24:30,wifi5:30}
				},
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
			}
};
