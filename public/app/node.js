'use strict';

angular.module('ffhb')
	.controller('NodeCtrl',function($stateParams,$scope,store,config,leafletData){
		$scope.nodeid = $stateParams.nodeid;
		$scope.loadingGPS = false;
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
				if($scope.node !== undefined && $scope.node.nodeinfo !== undefined){
					$scope.markers.node.lat = $scope.node.nodeinfo.location.latitude;
					$scope.markers.node.lng = $scope.node.nodeinfo.location.longitude;
				}
			});
		}
		render(store.getData);
		$scope.$on('store', function(ev, prom) {
			render(prom);
		});

		$scope.$on('leafletDirectiveMarker.dragend', function(event, args){
			if($scope.node !== undefined && $scope.node.nodeinfo !== undefined){
				$scope.node.nodeinfo.location = {
					'latitude': args.model.lat,
					'longitude': args.model.lng
				};
				store.saveNode($stateParams.nodeid);
			}
		});
		var setToGps = function(position){
			$scope.loadingGPS = false;
			var pos = [position.coords.latitude,position.coords.longitude];
			if($scope.node !== undefined && $scope.node.nodeinfo !== undefined){
				$scope.node.nodeinfo.location = {
					'latitude': position.coords.latitude,
					'longitude': position.coords.longitude
				};
				leafletData.getMap().then(function(map) {
					map.setView(pos);
				});
				store.saveNode($stateParams.nodeid);
				$scope.markers.node.lat = position.coords.latitude;
				$scope.markers.node.lng = position.coords.longitude;
			}
		};
		$scope.gps = function() {
			if (navigator.geolocation) {
				navigator.geolocation.getCurrentPosition(setToGps);
				$scope.loadingGPS = true;
			}else{
				window.alert('No Permission for location');
			}
		};
		$scope.save = function() {
			store.saveNode($stateParams.nodeid);
		};
	});
