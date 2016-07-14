'use strict';

angular.module('ffhb')
	.controller('MapCtrl',function($state,$stateParams,$scope,store,config,leafletData){
		if($stateParams.nodeid){
			$scope.nodeid = $stateParams.nodeid.toLowerCase();
		}
		var layerControl,nodeLayer,geoLayer;
		leafletData.getMap('globalmap').then(function(map) {
			layerControl = L.control.layers().addTo(map);
			map.setView([config.map.view.lat, config.map.view.lng],16);
		});
		store.getGeojson.then(function(data){
			leafletData.getMap('globalmap').then(function(map) {
				geoLayer = L.geoJson(data,config.map.geojson);
				layerControl.addOverlay(geoLayer,'GEOJSON');
				geoLayer.addTo(map);
			});
		});
		function render(prom){
			prom.then(function(data){
				leafletData.getMap('globalmap').then(function(map) {
					if(nodeLayer!==undefined){
						layerControl.removeLayer(nodeLayer);
					}
					nodeLayer = L.markerClusterGroup({maxClusterRadius:20});
					Object.keys(data.merged).map(function(nodeid){
						var node = data.merged[nodeid];
						if(node.nodeinfo.location !== undefined && node.nodeinfo.location.latitude !== undefined && node.nodeinfo.location.longitude !== undefined){
							var className = 'node';
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
					nodeLayer.addTo(map);
				});
			});
		}
		render(store.getData);
		$scope.$on('store', function(ev, prom) {
			render(prom);
		});
	});
