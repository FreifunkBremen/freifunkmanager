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
		var originalData = {};
		function find(nodeid){
			var node = originalData.filter(function(row){
				return row.nodeid === nodeid;
			});
			return node[0];
		}
		$scope.cancel = function(row, rowForm) {
			console.log('cancel',row);
			row.isEditing = false;
			rowForm.$setPristine();
			angular.copy(find(row.nodeid),row);
		};
		$scope.save = function(row, rowForm) {
			console.log('save',row);
			row.isEditing = false;
			rowForm.$setPristine();
			angular.copy(row,find(row.nodeid));
			store.saveNode(row.nodeid);
		};

		function render(prom){
			prom.then(function(data){
				originalData = Object.keys(data.merged).map(function(nodeid){
					data.merged[nodeid].nodeid = nodeid;
					return data.merged[nodeid];
				});
				$scope.tableParams.settings({dataset: angular.copy(originalData),total: data.nodesCount});
			});
		}
		render(store.getData);
		$scope.$on('store', function(ev, prom) {
			render(prom);
		});
	});
