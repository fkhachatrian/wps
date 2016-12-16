angular.module('WhatPeopleSay.TopicControllers', [])

	// inject the Topic service factory into our controller
	.controller('topicController', ['$scope', '$rootScope', '$http','Topics', function($scope, $rootScope, $http, Topics) {
		$scope.formData = {};
		$scope.loading = true;
                $scope.topicName = null;

		// GET =====================================================================
		// when landing on the page, get all topics and show them
		// use the service to get all the topics
		Topics.get()
                    .success(function(data) {
                            $scope.topics = data;
                            $scope.loading = false;
                            $scope.activeTopicName = data[0].name;
                    });


		// CREATE ==================================================================
		// when submitting the add form, send the text to the node API
		$scope.createTopic = function(topic_name) {
                        $scope.topicName = topic_name;

			// validate the formData to make sure that something is there
			// if form is empty, nothing will happen
			if ($scope.topicName != undefined) {
				$scope.loading = true;

				// call the create function from our service (returns a promise object)
				Topics.create({
                                    name: $scope.topicName,
                                })
                                // if successful creation, call our get function to get all the new todos
                                .success(function(data) {
                                        $scope.topics = data;
                                        $scope.loading = false;
                                        $scope.topicName = null; // clear the form so our user is ready to enter another
                                });
			}
		};

		// DELETE ==================================================================
		// delete a todo after checking it
		$scope.deleteTodo = function(id) {
			$scope.loading = true;

			Todos.delete(id)
				// if successful creation, call our get function to get all the new todos
				.success(function(data) {
					$scope.loading = false;
					$scope.todos = data; // assign our new list of todos
				});
		};
                
                $scope.loadLocalized = function(topic_name) {
                    $scope.activeTopicName = topic_name;
                    $rootScope.$emit('someEvent', [topic_name]);
                };
	}]);