angular.module('chartService', [])

	// super simple service
	// each function returns a promise object 
	.factory('Chart', ['$http',function($http) {
		return {
			get : function() {
				return $http.get('/api/chart');
			}
		}
	}]);