'use strict';

angular.module('ffhb')
	.controller('MainCtrl',function($scope,$interval,store,$state,AuthenticationService){
		$scope.isOpen = false;
		$scope.$state = $state;
		$scope.refresh = store.refresh;
		$scope.passphrase = '';

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
			AuthenticationService.SetCredentials('client',$scope.passphrase);
		};
	});
