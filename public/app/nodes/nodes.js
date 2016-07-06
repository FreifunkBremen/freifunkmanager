'use strict';

angular.module('ffhb')
	.controller('NodesCtrl',function(NgTableParams,$scope){
		$scope.cancel = function(row, rowForm) {
			console.log('cancel',row,rowForm);
			row.isEditing = false;
			//angular.extend(row, originalRow);
		};
		$scope.save = function(row, rowForm) {
			console.log('save',row,rowForm);
			row.isEditing = false;
			//angular.extend(row, originalRow);
		};
	 });
