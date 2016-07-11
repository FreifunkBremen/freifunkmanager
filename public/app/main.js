'use strict';

angular.module('ffhb')
	.controller('MainCtrl',function($rootScope,$scope,$interval,store,$state,AuthenticationService){
		$scope.isOpen = false;
		$scope.$state = $state;
		$scope.refresh = store.refresh;
		if($rootScope.passphrase === undefined){
			$rootScope.passphrase = '';
		}
		var timediff = new Date(1970,1,1);

		function render(prom){
			prom.then(function(data){
				timediff = data.lastupdate;
			});
		}
		render(store.getData);
		$scope.$on('store', function(ev, prom) {
			render(prom);
		});

		$scope.toggleOpen = function(){
			$scope.isOpen = !$scope.isOpen;
		};

		$interval(function() {
			$scope.timeRefresh = parseInt((new Date() - timediff) / 1000);
		},100);


		$scope.passphraseUpdate = function(){
			if($rootScope.passphrase !== undefined && $rootScope.passphrase !== '' && $rootScope.passphrase !== '*****'){
				console.log("set new basicauth");
				AuthenticationService.SetCredentials('client',$rootScope.passphrase);
			}
		};
	});
