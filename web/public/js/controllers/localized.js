angular.module('WhatPeopleSay.LocalizedControllers', [])
    // inject the Chart service factory into our controller
    .controller('localizedController', ['$scope', '$rootScope', '$interval', 'Localized', 'NgMap', 'Topics',
        function($scope, $rootScope, $interval, Localized, NgMap, Topics) {
                NgMap.getMap().then(function(map) {
            var options = {
                legend: 'none',
                backgroundColor: {
                        fill:'transparent'
                },
                slices: {
                    0: { color: '#16D620' },
                    1: { color: '#FF9900' },
                    2: { color: '#990099' }
                },
                pieHole: 0.4
            };
            
            var markers = [];
            
            var markerClusterer = new MarkerClusterer(map);
            markerClusterer.setCalculator(clusterDataCalculator);

            function clearmarkers(map) {
              for (var i = 0; i < markers.length; i++) {
                markers[i].setMap(null);
              }
              
              markers = [];
              
              markerClusterer.clearMarkers();

            }

            $scope.loadLocalized = function(topic_name) {
                
                    clearmarkers(null);
                    
                    Localized.get(encodeURIComponent(topic_name))
                        .success(function(localizedStats) {

                            console.log("asdad", localizedStats);

                            if(!localizedStats || !localizedStats.data.length) {
                                var latLng = new google.maps.LatLng( 49.04548, 32.10399 );
                                map.setCenter(latLng);
                                return;
                            }
                            console.log(localizedStats);
                            for(var i = 0; i < localizedStats.data.length; i ++) {
                                var location = localizedStats.data[i].location;
                                var total_positive = localizedStats.data[i].total_positive;
                                var total_negative = localizedStats.data[i].total_negative;
                                var total_neutral = localizedStats.data[i].total_neutral;
                                
                                var latLng = new google.maps.LatLng( location.lat, location.lon );
//                                console.log(location);
//                                
//                                    
//                                var marker = new google.maps.Marker({
//                                    map: map,
//                                    position: latLng,
//                                });
//                                
//                                (function(marker) {
//                                    
//                                    var infowindow = new google.maps.InfoWindow({
//                                      content: location.name
//                                    });
//                                
//                                    google.maps.event.addListener(marker, 'click', function() {
//                                      infowindow.open(map,marker);
//                                    });    
//                                })(marker)

                                
                                var data = google.visualization.arrayToDataTable([
                                    [ 'Sentiment', 'Reactions' ],
                                    [ 'Positive', total_positive ],
                                    [ 'Neutral', total_neutral ],
                                    [ 'Negative', total_negative ]
                                ]);
                                
                                var clusterData = {
                                    pos: total_positive,
                                    neu: total_neutral,
                                    neg: total_negative
                                }
                                
                                var marker = new ChartMarker({
                                    map: map,
                                    position: latLng,
                                    width: '150px',
                                    height: '150px',
                                    chartData: data,
                                    clusterData: clusterData,
                                    chartOptions: options,
                                    events: {
                                        click: function( event ) {

                                        }
                                    }
                                });
                                
                                markers.push(marker);
                            }

                            var bounds = new google.maps.LatLngBounds();
                            for (var k = 0; k < markers.length; k ++) {

                              bounds.extend(markers[k].getPosition());
                            };
                            
                            markerClusterer.addMarkers(markers);
                            
                            map.setCenter(bounds.getCenter());
                            map.fitBounds(bounds);  
//                            

                        });

            };
                
            
            $rootScope.$on('someEvent', function(event, args) {
                $scope.loadLocalized(args);
            });

            Topics.get()
                .success(function(data) {
                            if(!data.length) {
                                return;
                            }
                            
                        $scope.loadLocalized(data[0].name);
                });
                
            $scope.intervalPromise = $interval(function(){
                console.log("localized data", $rootScope.activeTopicName);
                $scope.loadLocalized($rootScope.activeTopicName);
            }, 60000);

           });
        }
    ]);