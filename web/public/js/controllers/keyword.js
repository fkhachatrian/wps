angular.module('WhatPeopleSay.KeywordControllers', [])
    // inject the Record service factory into our controller
    .controller('keywordController', ['$scope', '$rootScope', 'Keyword',
        function($scope, $rootScope, Record) {

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
            
            $scope.loadTopKeywords("#Donbas");
        }
    ]);