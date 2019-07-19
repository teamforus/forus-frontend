let BarChartDirective = function($scope, $element) {
    var BarChart=null;
    var timeFormat = 'MM/DD/YYYY';
    $scope.$watch('data', function(data) {
        drawChart(data ? data : []);
    });

    let drawChart = (data) => {
        let labels = [];
        let values = [];

        moment.locale('nl');

        data.forEach(value => {
            labels.push(value.key);
            values.push({
                x: value.key,
                y: value.value,
            });
        });
        if(BarChart!=null){
            BarChart.destroy();
        }
        BarChart = new Chart($element, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    data: values,
                    borderColor: '#2987fd',
                    backgroundColor: '#2987fd'
                }]
            },
            options: {
                fill: false,
                legend: {
                    display: false
                },
                time: {
                    parser: timeFormat
                },
                scales: {
                    xAxes: [{
                        time: {
                            unit: 'day',
                            round: 'day',
                            tooltipFormat: 'll',
                            displayFormats: {
                                quarter: 'll',
                            }
                        }
                    }],
                    yAxes: [{
                        ticks: {
                          beginAtZero: true
                        }
                    }]
                },
            }
        });
    };

    drawChart([]);
};

module.exports = () => {
    return {
        scope: {
            data: '=',
        },
        restrict: "EA",
        replace: true,
        controller: [
            '$scope',
            '$element',
            BarChartDirective
        ],
        templateUrl: 'assets/tpl/directives/bar-chart.html'
    };
};
