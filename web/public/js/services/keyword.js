angular.module('keywordService', [])

	// super simple service
	// each function returns a promise object 
	.factory('Keyword', ['$http',function($http) {
		return {
			getTopKeywords : function(topic_name, limit) {
				return $http.get('/api/top-keywords/' + topic_name + '/' + limit);
			}
		}
	}]);