angular.module('WhatPeopleSay.KeywordControllers', [])
    // inject the Record service factory into our controller
    .controller('keywordController', ['$scope', '$rootScope', '$interval', 'Keyword', 'Topics',
        function($scope, $rootScope, $interval, Record, Topics) {

            $rootScope.$on('someEvent', function(event, args) {
                $scope.busy = false;
                $scope.keywords = [];
                $scope.loadTopKeywords(args);
            });

            $scope.busy = false;
            $scope.after = 0;
            $scope.keywords = [];

    
            $scope.loadTopKeywords = function(topic_name) { 
                if (this.busy) return;
                this.busy = true;

		Record.getTopKeywords(encodeURIComponent(topic_name),30)
			.success(function(data) {

                            this.keywords = data.keywords;
                            this.busy = false;
			}.bind(this));
            };
            
            Topics.get()
                .success(function(data) {
                        if(!data.length) {
                            return;
                        }
                        $scope.loadTopKeywords(data[0].name);
                });

             $scope.intervalPromise = $interval(function(){
                 console.log('loading keywords', $rootScope.activeTopicName);
                 $scope.loadTopKeywords($rootScope.activeTopicName);
             }, 100000);
        }
    ]);