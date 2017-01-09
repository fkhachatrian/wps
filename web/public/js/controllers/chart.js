google.charts.load('current', {'packages':['line', 'corechart']});

google.charts.setOnLoadCallback(function() {
  angular.bootstrap(document.body, ['WhatPeopleSay']);
});

angular.module('WhatPeopleSay.ChartControllers', [])
    // inject the Chart service factory into our ontroller
    .controller('chartController', ['$scope', '$interval', 'Chart',
        function($scope, $interval, Chart) {
            
        getChartData();
        
        function getChartData() {
            Chart.get()
                .success(function(topicInterestStats) {
                    if(!topicInterestStats.series.length || !topicInterestStats.data.length) {
                        return;
                    }
                    
                    console.log(topicInterestStats);
                    var options = {
                        legend: {position: 'none'},
                        series: []
                    };

                    if(!topicInterestStats || !topicInterestStats.series || !topicInterestStats.data) {
                        return;
                    }

                    var topicSeries = topicInterestStats.series;
                    var topicData = topicInterestStats.data;

                    var data = new google.visualization.DataTable();

                    data.addColumn('date', '');

                    for(var i = 0; i < topicSeries.length; i ++ ) {
                        data.addColumn('number', topicSeries[i].name);

                        options.series.push({color: topicSeries[i].color});
                    }

                    for(var i = 0; i < topicData.length; i ++) {
                        var stats = topicData[i].stats;

                        var row = topicSeries.map(function(topic){
                            var matchingTopicStats = stats.filter(function (stopicStats) { return stopicStats.topic.name === topic.name });

                            if(matchingTopicStats.length) {
                                return matchingTopicStats[0].total;
                            } else {
                                return 0;
                            }
                        });

                        row.unshift(new Date(topicData[i].date));

                        console.log(row);
                        data.addRow(row);
                    }


                    var chart = new google.charts.Line(document.getElementById('time-chart'));

                    chart.draw(data, options);
                });
        }
            

            
		$scope.intervalPromise = $interval(function(){
                    console.log("chart data");
			  getChartData();
		}, 20000);
        }
    ]);