'use strict';

angular.module('ffhb')
	.controller('NodesGroupCtrl',function(NgTableParams,$scope,store){
		$scope.tableParams = new NgTableParams({
			sorting: { hostname: 'asc' },
			group: 'nodeinfo.owner.contact',
			total: 0,
			count: 50
		}, {
			dataset: []
		});
		var originalData = {};
		function resetRow(row, rowForm){
			row.isEditing = false;
			rowForm.$setPristine();
			return _.findWhere(originalData, function(r){
				return r.id === row.id;
			});
		}
		$scope.cancel = function(row, rowForm) {
			console.log('cancel',row,rowForm);
			row.isEditing = false;
			var originalRow = resetRow(row, rowForm);
			angular.extend(row, originalRow);
		};
		$scope.save = function(row, rowForm) {
			console.log('save',row,rowForm);
			row.isEditing = false;
			var originalRow = resetRow(row, rowForm);
			angular.extend(originalRow, row);
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
