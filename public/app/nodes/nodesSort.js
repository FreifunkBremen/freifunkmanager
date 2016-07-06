'use strict';

angular.module('ffhb')
	.controller('NodesSortCtrl',function(NgTableParams,$scope,store){
		$scope.tableParams = new NgTableParams({
			sorting: { hostname: 'asc' },
			total: 0,
			count: 50
		}, {
			dataset: []
		});
		function render(prom){
			prom.then(function(data){
				var result = Object.keys(data.nodes).map(function(nodeid){
					data.merged[nodeid].nodeid = nodeid;
					return data.merged[nodeid];
				});
				$scope.tableParams.settings({dataset: result,total: data.nodesCount});
			});
		}
		render(store.getData);
		$scope.$on('store', function(ev, prom) {
			render(prom);
		});
	});
