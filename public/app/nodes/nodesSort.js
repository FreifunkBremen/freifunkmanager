'use strict';

angular.module('ffhb')
	.controller('NodesSortCtrl',function(NgTableParams,$scope,store){
		$scope.tableParams = new NgTableParams({
			sorting: { 'nodeinfo.hostname': 'asc' },
			total: 0,
			count: 100
		}, {
			dataset: [{
				lastseen: new Date(),
				firstseen: new Date(),
				nodeid: 'loading',
				nodeinfo: {
					hostname: 'loading',
					owner: {
						contact: 'loading'
					},
					wireless: {
						channel24: 0,
						channel5: 0,
						txpower24: 0,
						txpower5: 0
					}
				},
				statistics: {
					clients: {
						wifi24: 0,
						wifi5: 0
					}
				}
			},
			{
				lastseen: new Date(),
				firstseen: new Date(),
				nodeid: 'loading',
				nodeinfo: {
					hostname: 'loading',
					owner: {
						contact: 'loading'
					},
					wireless: {
						channel24: 0,
						channel5: 0,
						txpower24: 0,
						txpower5: 0
					}
				},
				statistics: {
					clients: {
						wifi24: 0,
						wifi5: 0
					}
				}
			}]
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
