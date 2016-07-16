'use strict';
angular.module('ffhb')
	.config(['$stateProvider',function ($stateProvider) {
		$stateProvider
			.state('app', {
				templateUrl: 'app/main.html',
				controller: 'MainCtrl'
			})
			.state('app.nodes', {
				url:'/nodes',
				templateUrl: 'app/nodes/nodes.html',
				controller: 'NodesCtrl'
			})
			.state('app.nodes.sort', {
				url:'/sort',
				templateUrl: 'app/nodes/nodesSort.html',
				controller: 'NodesSortCtrl'
			})
			.state('app.nodes.group', {
				url:'/group',
				templateUrl: 'app/nodes/nodesGroup.html',
				controller: 'NodesGroupCtrl'
			})
			.state('app.node', {
				url:'/n/:nodeid',
				templateUrl: 'app/node.html',
				controller: 'NodeCtrl'
			})
			.state('app.mapedit',{
				url:'/mapedit',
				templateUrl: 'app/map/index.html',
				controller: 'MapEditCtrl'
			})
			.state('app.map',{
				url:'/map',
				templateUrl: 'app/map/index.html',
				controller: 'MapCtrl'
			});
	}]);
