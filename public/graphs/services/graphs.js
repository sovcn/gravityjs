'use strict';

//Articles service used for articles REST endpoint
angular.module('mean.graphs').factory('Graphs', ['$resource', function($resource) {
    return $resource('graphs/:graphId', {
	        graphId: '@_id'
	    }, {
	        update: {
	            method: 'PUT'
	        },
	        byUser: {
	        	url: '/graphs/user',
	        	method: 'GET',
	        	isArray: true
	        }
    });
}]);