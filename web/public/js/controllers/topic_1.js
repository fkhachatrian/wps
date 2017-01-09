    
    angular.module('WhatPeopleSay.TopicControllers_1', [])

	// inject the Topic service factory into our controller
	.controller('topicController_1', ['$scope', '$rootScope', '$interval', '$http','Topics', 
            function($scope, $rootScope, $interval, $http, Topics) {
		$scope.formData = {};
		$scope.loading = true;
                $scope.topicName = null;

		// GET =====================================================================
		// when landing on the page, get all topics and show them
		// use the service to get all the topics
		Topics.get()
                    .success(function(data) {
                        
                            if(!data.length) {
                                return;
                            }
                            
                            $rootScope.topics = data;
                            $scope.loading = false;
                            $rootScope.activeTopicName = data[0].name;
                            
                    });


                $scope.loadLocalized = function(topic_name) {
                    $rootScope.activeTopicName = topic_name;
                    $rootScope.$emit('someEvent', [topic_name]);
                };
                
	}]);