'use strict';
angular.module('ffhb')
	.factory('store', function($state, $q, $http, $rootScope,config,$interval,storage,webNotification) {
		function notifyNew(nodeid){
			webNotification.showNotification('New Node',{
				body: '"'+nodeid+'"',
				icon: '/favicon.ico',
				onClick: function() {
					$state.go('app.node', {nodeid: nodeid});
				}
			},function(){});
		}
		function notifyOffline(nodeid){
			webNotification.showNotification('Offline Node',{
				body: '"'+nodeid+'"',
				icon: '/favicon.ico',
				onClick: function() {
					$state.go('app.node', {nodeid: nodeid});
				}
			},function(){});
		}

		var myservice = {};
		myservice._initialized = false;
		myservice._data = storage.get('data') ||{
				nodes: {},nodesCount:0,
				merged: {},
				aliases: {},aliasesCount:0
			};
		var geojsonDeferred = $q.defer();
		$http.get(config.geojson).success(function(geojson) {
			geojsonDeferred.resolve(geojson);
		});
		myservice.getGeojson = geojsonDeferred.promise;

		myservice.refresh = function(notify) {
			var dataDeferred = $q.defer();
			$http.get(config.api+'/nodes').success(function(nodes) {
				$http.get(config.api+'/aliases').success(function(aliases) {
					if(notify){
						Object.keys(nodes).map(function(key){
							if(myservice._data.nodes === undefined || myservice._data.nodes[key] === undefined){
								notifyNew(key);
							}
							if(myservice._data.nodes !== undefined && myservice._data.nodes[key] !== undefined && myservice._data.nodes[key].flags.offline){
								notifyOffline(key);
							}
							myservice._data.nodes[key] = nodes[key];
						});
					}else {
						myservice._data.nodes = nodes;
					}
					angular.copy(nodes, myservice._data.merged);
					Object.keys(aliases).map(function(key){
						var node = myservice._data.merged[key],
							alias = aliases[key];
						node.nodeinfo.hostname = alias.hostname;
						if(!node.nodeinfo.owner){
							node.nodeinfo.owner = {};
						}
						node.nodeinfo.owner.contact = alias.owner;
						if(!node.nodeinfo.wireless){
							node.nodeinfo.wireless = {};
						}
						if(alias.wireless){
							if(alias.wireless.channel24){
								node.nodeinfo.wireless.channel24 = alias.wireless.channel24;
							}
							if(alias.wireless.channel5){
								node.nodeinfo.wireless.channel5 = alias.wireless.channel5;
							}
							if(alias.wireless.txpower24){
								node.nodeinfo.wireless.txpower24 = alias.wireless.txpower24;
							}
							if(alias.wireless.txpower5){
								node.nodeinfo.wireless.txpower5 = alias.wireless.txpower5;
							}
						}
						if(!node.nodeinfo.location){
							node.nodeinfo.location = {};
						}
						if(alias.location){
							if(alias.location.latitude){
								node.nodeinfo.location.latitude = alias.location.latitude;
							}
							if(alias.location.longitude){
								node.nodeinfo.location.longitude = alias.location.longitude;
							}
						}
					});
					myservice._data.nodesCount = Object.keys(nodes).length || 0;
					myservice._data.aliases = aliases;
					myservice._data.aliasesCount = Object.keys(aliases).length || 0;
					myservice._data.lastupdate = new Date();
					dataDeferred.resolve(myservice._data);
					if (myservice._initialized) {
						$rootScope.$broadcast('store', dataDeferred.promise);
					}
					storage.set('data',myservice._data);
					myservice._initialized = true;
				});
			});
			myservice.getData = dataDeferred.promise;
			return dataDeferred.promise;
		};
		myservice.refresh(false);

		myservice.saveNode = function(nodeid){
			var result = $q.defer();
			if(myservice._data.merged && myservice._data.merged[nodeid]){
				var node = myservice._data.merged[nodeid],
					obj = {
						'hostname':node.nodeinfo.hostname,
						'owner':node.nodeinfo.owner.contact||'',
						'location': {},
						'wireless': {}
					};
					if(node.nodeinfo.location){
						obj.location = {
							'latitude': node.nodeinfo.location.latitude||0,
							'longitude': node.nodeinfo.location.longitude||0
						};
					}
					if(node.nodeinfo.wireless){
						obj.wireless = {
							'channel24': parseInt(node.nodeinfo.wireless.channel24)||0,
							'channel5': parseInt(node.nodeinfo.wireless.channel5)||0,
							'txpower24': parseInt(node.nodeinfo.wireless.txpower24)||0,
							'txpower5': parseInt(node.nodeinfo.wireless.txpower5)||0
						};
					}
				$http.post(config.api+'/aliases/alias/'+nodeid,obj).then(function(){
					result.resolve(true);
					myservice.refresh(true);
				},function(){
					$rootScope.globals.passphrase = '';
				});
			}else{
				result.resolve(false);
			}
			return result.promise;
		};


		if(config.refresh){
			$interval(function () {
				myservice.refresh(true);
			}, config.refresh);
		}

		return myservice;
	});
