'use strict';

angular.module('ffhb')
	.controller('NodesSortCtrl',function(NgTableParams,$scope,store){
		$scope.sum = {
			all: 0,
			online: 0,
			client24: 0,
			client5: 0
		};
		$scope.tableParams = new NgTableParams({
			sorting: { 'hostname': 'asc' },
			total: 0,
			count: 100
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
				$scope.sum = {
					all: data.nodesCount,
					online: 0,
					client24: 0,
					client5: 0
				};
				originalData = Object.keys(data.merged).map(function(nodeid){
					var merg = data.merged[nodeid];
					merg.nodeid = nodeid;
					if(merg.flags.online){
						$scope.sum.online++;
					}
					if(merg.statistics !== undefined && merg.statistics.clients !== undefined){
						$scope.sum.client24 += merg.statistics.clients.wifi24;
						$scope.sum.client5 += merg.statistics.clients.wifi5;
					}
					return merg;
				});
				$scope.tableParams.settings({dataset: angular.copy(originalData),total: data.nodesCount});
			});
		}
		render(store.getData);
		$scope.$on('store', function(ev, prom) {
			render(prom);
		});
	});
