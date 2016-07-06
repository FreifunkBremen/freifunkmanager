'use strict';

angular.module('ffhb')
	.controller('NodeCtrl',function($stateParams,$scope,store,config){
		$scope.nodeid = $stateParams.nodeid;
		$scope.node = {};
		$scope.center = config.map.view;
		$scope.markers = [];
		store.getGeojson.then(function(data){
			$scope.geojson = data;
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

		$scope.gps = function() {
			console.log('gps');
		};
		$scope.save = function() {
			store.saveNode($stateParams.nodeid);
		};
	});
