angular.module('topicService', [])

	// super simple service
	// each function returns a promise object 
	.factory('Topics', ['$http',function($http) {
		return {
			get : function() {
				return $http.get('/api/topics');
			},
			create : function(topicData) {
				return $http.post('/api/topics', topicData);
			},
			delete : function(id) {
				return $http.delete('/api/topics/' + id);
			}
		}
	}]);