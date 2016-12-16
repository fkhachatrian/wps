angular.module('recordService', [])

	// super simple service
	// each function returns a promise object 
	.factory('Record', ['$http',function($http) {
		return {
			get : function(topic_name, skip) {
				return $http.get('/api/records/' + topic_name + '/' + skip);
			}
		}
	}]);