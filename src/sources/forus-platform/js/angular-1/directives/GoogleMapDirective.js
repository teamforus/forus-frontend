let GoogleMapDirective = function(
    $scope,
    $element,
    $timeout,
    $compile,
    GoogleMapService,
    appConfigs
) {
    $scope.style = [];
    
    let markers = [];
    let map = null
    let infowindow = null;

    $scope.initialize = function(mapPointers = []) {
        let zoomLevel = 12;

        let styles = [{
            featureType: 'poi.business',
            stylers: [{
                visibility: 'off'
            }]
        }, {
            featureType: 'transit',
            elementType: 'labels.icon',
            stylers: [{
                visibility: 'off'
            }]
        }];

        let avg = (values) => {
            return values.reduce((avg, value) => value + avg, 0) / values.length;
        }

        let centerLat = mapPointers.length > 0 ? mapPointers[0].lat : appConfigs.features.map.lat;
        let centerLon = mapPointers.length > 0 ? mapPointers[0].lon : appConfigs.features.map.lon;

        if ($scope.mapOptions && $scope.mapOptions.centerType == 'avg' && mapPointers.length > 0) {
            centerLat = avg(mapPointers.map(pointer => {
                return typeof pointer.lat == 'string' ? parseFloat(pointer.lat) : pointer.lat
            }));
            
            centerLon = avg(mapPointers.map(pointer => {
                return typeof pointer.lon == 'string' ? parseFloat(pointer.lon) : pointer.lon
            }));
        }

        markers.forEach(marker => {
            marker.setMap(null);
        });

        var mapOptions = Object.assign({
            zoom: zoomLevel,
            disableDefaultUI: false,
            center: new google.maps.LatLng(centerLat, centerLon),
            scrollwheel: true,
            fullscreenControl: true,
            styles: styles,
            mapTypeControlOptions: {
                mapTypeIds: [google.maps.MapTypeId.ROADMAP, 'map_style']
            },
            gestureHandling: $scope.mapGestureHandling || undefined,
        }, $scope.mapOptions || {})

        if (!map || !infowindow) {
            map = new google.maps.Map($scope.getMapElement(), mapOptions);
            infowindow = new google.maps.InfoWindow();
        } else {
            map.setCenter(new google.maps.LatLng(centerLat, centerLon));
        }

        mapPointers.forEach(function(mapPointer, index) {
            let marker = new google.maps.Marker({
                position: new google.maps.LatLng(mapPointer.lat, mapPointer.lon),
                map: map,
                icon: $scope.mapPointerIcon || null,
                mapPointer: mapPointer
            });

            markers.push(marker);

            if (!$scope.mapPointerTemplate) {
                return;
            }

            google.maps.event.addListener(marker, 'click', (function(marker, mapPointer) {
                return function() {
                    let $newScope = Object.assign($scope.$new(true), {
                        pointer: mapPointer
                    });

                    let htmlTemplate = $compile(`
                        <map-pointer-${$scope.mapPointerTemplate} pointer="pointer">
                    `)($newScope);

                    $timeout(() => {
                        infowindow.setContent(htmlTemplate.html());
                        infowindow.open(map, marker);
                    }, 250);
                }
            })(marker, mapPointer));

            if (mapPointers.length == 1 && index == 0) {
                google.maps.event.trigger(marker, 'click');
            }
        });
    }

    $scope.getMapElement = () => {
        return $element.find('.map-canvas')[0];
    };

    $scope.$watch('mapPointers', function(mapPointers) {
        $scope.initialize(mapPointers);
    });

    $scope.$watch('mapOptions', function() {
        $scope.initialize($scope.mapPointers);
    });

    GoogleMapService.getStyle().then(function(style) {
        $scope.style = style.style;
        $scope.initialize($scope.mapPointers || []);
    });
};

module.exports = () => {
    return {
        scope: {
            mapPointers: '=',
            mapPointerTemplate: '@',
            mapPointerIcon: '@',
            mapOptions: '=',
            mapGestureHandling: '='
        },
        replace: true,
        controller: [
            '$scope',
            '$element',
            '$timeout',
            '$compile',
            'GoogleMapService',
            'appConfigs',
            GoogleMapDirective
        ],
        templateUrl: 'assets/tpl/directives/google-map.html',
    };
};