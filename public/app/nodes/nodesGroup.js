'use strict';

angular.module('ffhb')
	.controller('NodesGroupCtrl',function(NgTableParams,$scope,store){
		$scope.tableParams = new NgTableParams({
			sorting: { 'nodeinfo.hostname': 'asc' },
			group: 'nodeinfo.owner.contact',
			total: 0,
			count: 100
		}, {
			dataset: [{}]
		});
		var originalData = {};
		$scope.cancel = function(row, rowForm) {
			console.log('cancel',row,rowForm);
			row.isEditing = false;
			rowForm.$setPristine();
			originalData[row.nodeid] = angular.copy(row);
		};
		$scope.save = function(row, rowForm) {
			console.log('save',row,rowForm);
			row.isEditing = false;
			rowForm.$setPristine();
			row = angular.copy(originalData[row.nodeid]);
			store.saveNode(row.nodeid);
		};

		function render(prom){
			prom.then(function(data){
				var result = Object.keys(data.merged).map(function(nodeid){
					data.merged[nodeid].nodeid = nodeid;
					return data.merged[nodeid];
				});
				originalData = result;
				$scope.tableParams.settings({dataset: angular.copy(result),total: data.nodesCount});
			});
		}
		render(store.getData);
		$scope.$on('store', function(ev, prom) {
			render(prom);
		});
	});
