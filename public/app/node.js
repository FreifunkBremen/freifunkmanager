'use strict';

angular.module('ffhb')
	.controller('NodeCtrl',function($stateParams,$scope,store,config,leafletData){
		$scope.nodeid = $stateParams.nodeid;
		$scope.node = {};
		angular.extend($scope, {
			center: config.map.view,
			markers: {node:{
				lat: config.map.view.lat,
				lng: config.map.view.lng,
				focus: true,
				title: 'Marker',
				draggable: true,
				label: {
					message: 'Node:'+$stateParams.nodeid,
					options: {
						noHide: true
					}
				}
			}},
			events:{}
		});
		store.getGeojson.then(function(data){
			leafletData.getMap().then(function(map) {
				L.geoJson(data,config.map.geojson).addTo(map);
			});
		});
		function render(prom){
			prom.then(function(data){
				$scope.node = data.merged[$stateParams.nodeid];
			});
		}
		render(store.getData);
		$scope.$on('store', function(ev, prom) {
			render(prom);
		});

		$scope.$on('leafletDirectiveMarker.dragend', function(event, args){
			if($scope.node !== undefined && $scope.node.nodeinfo !== undefined && $scope.node.nodeinfo.location !== undefined){
				$scope.node.nodeinfo.location.latitude = args.model.lat;
				$scope.node.nodeinfo.location.latitude = args.model.lng;
				store.saveNode($stateParams.nodeid);
			}
		});
		var setToGps = function(position){
			var pos = [position.coords.latitude,position.coords.longitude];
			console.log('gps',pos);
			if($scope.node !== undefined && $scope.node.nodeinfo !== undefined && $scope.node.nodeinfo.location !== undefined){
				$scope.node.nodeinfo.location.latitude = position.coords.latitude;
				$scope.node.nodeinfo.location.longitude = position.coords.longitude;
				leafletData.getMap().then(function(map) {
					map.setView(pos);
				});
				store.saveNode($stateParams.nodeid);
			}
		};
		$scope.gps = function() {
			if (navigator.geolocation) {
				navigator.geolocation.getCurrentPosition(setToGps);
			}else{
				window.alert('No Permission for location');
			}
		};
		$scope.save = function() {
			store.saveNode($stateParams.nodeid);
		};
	});
