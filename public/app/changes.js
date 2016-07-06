'use strict';

angular.module('ffhb')
	.controller('ChangesCtrl',function(NgTableParams,$scope,store){
		$scope.tableParams = new NgTableParams({
			sorting: { hostname: 'asc' },
			total: 0,
			count: 50
		}, {
			dataset: []
		});
		function render(prom){
			prom.then(function(data){
				var result = Object.keys(data.aliases).map(function(nodeid){
					data.aliases[nodeid].nodeid = nodeid;
					return data.aliases[nodeid];
				});
				$scope.tableParams.settings({dataset: result,total: data.aliasesCount});
			});
		}
		render(store.getData);
		$scope.$on('store', function(ev, prom) {
			render(prom);
		});
	});
