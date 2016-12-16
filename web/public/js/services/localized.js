angular.module('localizedService', [])

	// super simple service
	// each function returns a promise object 
	.factory('Localized', ['$http',function($http) {
		return {
			get : function(topic_name) {
				return $http.get('/api/localized/' + topic_name);
			}
		}
	}]);