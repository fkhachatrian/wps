angular.module('trendsService', [])

	// super simple service
	// each function returns a promise object
	.factory('Trends', ['$http',function($http) {
		return {
			get : function() {
				return $http.get('/api/trends');
			}
		}
	}]);