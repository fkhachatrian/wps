angular.module('WhatPeopleSay.RecordControllers', [])
    // inject the Record service factory into our controller
    .controller('recordController', ['$scope', '$rootScope', 'Record',
        function($scope, $rootScope, Record) {

            $rootScope.$on('someEvent', function(event, args) {
                $scope.records = [];
                $scope.busy = false;
                $scope.after = 0;
                $scope.loadRecords(args);
            });

            $scope.records = [];
            $scope.busy = false;
            $scope.after = 0;
    console.log('>>>>>>>>>>>>>>>')
            $scope.loadRecords = function(topic_name) { 
                if (this.busy) return;
                this.busy = true;
                
		Record.get(encodeURIComponent(topic_name), this.after)
			.success(function(data) {
                                for (var i = 0; i < data.records.length; i++) {
                                    this.records.push(data.records[i]);
                                }
				
                                this.after += 20;
                                
                                this.busy = false;

                                this.topic = data.topic;
			}.bind(this));
            };
            
            $scope.loadRecords("#Donbas");
        }
    ]);