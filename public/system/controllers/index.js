'use strict';

angular.module('mean.system').controller('IndexController', ['$scope', 'Global', function ($scope, Global) {
    $scope.global = Global;
    
    
    $scope.load = function(){
    	var _this = this;
    	return _this;
    }
}]);