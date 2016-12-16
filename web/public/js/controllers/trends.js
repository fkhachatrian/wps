angular.module('WhatPeopleSay.TrendsControllers', [])

	// inject the Trends service factory into our controller
	.controller('trendsController', ['$scope','$http', '$interval', 'Trends', 
	 function($scope, $http, $interval, Trends) {
		$scope.loading = true;
		
		// GET =====================================================================
		// when landing on the page, get all trends and show them
		// use the service to get all the trends
		$scope.refreshTrends = function() {
			$scope.loading = true;
			
			Trends.get()
				.success(function(data) {
					$scope.trends = data;
					$scope.loading = false;
				});
		};

		$scope.intervalPromise = $interval(function(){
			  $scope.refreshTrends();
		}, 60000);

		// initial load of data
		$scope.refreshTrends();
		
	}]);