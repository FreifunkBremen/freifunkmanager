'use strict';

angular.module('ffhb')
	.controller('MapCtrl',function($state,$stateParams,$scope,store,config,leafletData){
		var layerControl,geoLayer,nodeLayer,client24Layer,client5Layer;
		leafletData.getMap('globalmap').then(function(map) {
			layerControl = L.control.layers().addTo(map);
			map.setView([config.map.view.lat, config.map.view.lng],16);
		});
		store.getGeojson.then(function(data){
			leafletData.getMap('globalmap').then(function(map) {
				geoLayer = L.geoJson(data,config.map.geojson);
				layerControl.addOverlay(geoLayer,'Gelände');
				geoLayer.addTo(map);
			});
		});
		function render(prom){
			prom.then(function(data){
				leafletData.getMap('globalmap').then(function(map) {
					if(nodeLayer!==undefined){
						layerControl.removeLayer(nodeLayer);
						nodeLayer.clearLayers();
					}
					if(client24Layer!==undefined){
						layerControl.removeLayer(client24Layer);
						client24Layer.clearLayers();
					}
					if(client5Layer!==undefined){
						layerControl.removeLayer(client5Layer);
						client5Layer.clearLayers();
					}
					nodeLayer = L.markerClusterGroup({maxClusterRadius:20});
					client24Layer = L.heatLayer([],{max: config.map.heatMax.wifi24,radius:50,blur:25});
					client5Layer = L.heatLayer([],{max: config.map.heatMax.wifi5,radius:50,blur:25});
					Object.keys(data.merged).map(function(nodeid){
						var node = data.merged[nodeid];
						if(node.nodeinfo.location !== undefined && node.nodeinfo.location.latitude !== undefined && node.nodeinfo.location.longitude !== undefined){
							var className = 'node';
							if(node.flags && !node.flags.online){
								className += ' offline';
							}
							var wifi24='-',wifi5='-',ch24='-',ch5='-',tx24='-',tx5='-';
							if(node.statistics && node.statistics.clients){
								wifi24 = node.statistics.clients.wifi24;

								if(wifi24 < config.map.icon.warn.wifi24 && wifi24 > 0){
									className += ' client24';
								} else if(wifi24 < config.map.icon.crit.wifi24 && wifi24 >= config.map.icon.warn.wifi24){
									className += ' client24-warn';
								} else if(wifi24 >= config.map.icon.crit.wifi24){
									className += ' client24-crit';
								}

								wifi5 = node.statistics.clients.wifi5;
								if(config.map.icon.warn.wifi5 < 20 && wifi5 > 0){
									className += ' client5';
								} else if(wifi5 < config.map.icon.crit.wifi5 && wifi5 >= config.map.icon.warn.wifi5){
									className += ' client5-warn';
								} else if(wifi5 >= config.map.icon.crit.wifi5){
									className += ' client5-crit';
								}
							}
							var nodemarker = L.marker([node.nodeinfo.location.latitude, node.nodeinfo.location.longitude],{icon: L.divIcon({className: className})});
							client24Layer.addLatLng([node.nodeinfo.location.latitude, node.nodeinfo.location.longitude, wifi24]);
							client5Layer.addLatLng([node.nodeinfo.location.latitude, node.nodeinfo.location.longitude, wifi5]);
							nodemarker.bindLabel(node.nodeinfo.hostname+' <div class=\'nodeicon-label\'>('+nodeid+')'+
								'<table><tr><th></th><th>Cl</th><th>Ch</th><th>Tx</th></tr>'+
								'<tr><td>2.4G</td><td>'+wifi24+'</td><td>'+ch24+'</td><td>'+tx24+'</td></tr>'+
								'<tr><td>5G</td><td>'+wifi5+'</td><td>'+ch5+'</td><td>'+tx5+'</td></tr>'+
								'</table>'+
								'</div>'
							);
							nodemarker.on('dblclick',function(){
								$state.go('app.node', {nodeid: nodeid});
							});
							nodeLayer.addLayer(nodemarker).addTo(map);
						}
					});
					layerControl.addOverlay(nodeLayer,'Nodes');
					layerControl.addOverlay(client24Layer,'2.4 Ghz Clients');
					layerControl.addOverlay(client5Layer,'5 Ghz Clients');
					client24Layer.addTo(map);
					client5Layer.addTo(map);
					nodeLayer.addTo(map);
				});
			});
		}
		render(store.getData);
		$scope.$on('store', function(ev, prom) {
			render(prom);
		});
	});
