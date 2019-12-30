let GoogleMapDirective = function(
    $scope,
    $element,
    $timeout,
    $compile,
    GoogleMapService,
    appConfigs
) {
    $scope.style = [];
    $scope.markers = [];

    $scope.initialize = function(obj, mapPointers) {
        mapPointers = mapPointers || [];

        let $elementCanvas = $element.find('.map-canvas');
        let map, infowindow;
        let image = $elementCanvas.attr("data-marker");
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

        let centerLat = mapPointers.length ? mapPointers[0].lat : appConfigs.features.map.lat;
        let centerLon = mapPointers.length ? mapPointers[0].lon : appConfigs.features.map.lon;

        var mapOptions = Object.assign({
            zoom: zoomLevel,
            disableDefaultUI: false,
            center: new google.maps.LatLng(
                $scope.mapOptions ? $scope.mapOptions.lat || centerLat : centerLat,
                $scope.mapOptions ? $scope.mapOptions.lon || centerLon : centerLon,
            ),
            scrollwheel: true,
            fullscreenControl: true,
            styles: styles,
            mapTypeControlOptions: {
                mapTypeIds: [google.maps.MapTypeId.ROADMAP, 'map_style']
            },
            gestureHandling: $scope.mapGestureHandling || undefined,
        }, $scope.mapOptions || {})

        map = new google.maps.Map(document.getElementById(obj), mapOptions);
        infowindow = new google.maps.InfoWindow();

        mapPointers.forEach(function(mapPointer, index) {
            let marker = new google.maps.Marker({
                position: new google.maps.LatLng(mapPointer.lat, mapPointer.lon),
                map: map,
                icon: image,
                mapPointer: mapPointer
            });

            $scope.markers.push(marker);

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
                    }, 100);
                }
            })(marker, mapPointer));

            if (mapPointers.length == 1 && index == 0) {
                google.maps.event.trigger(marker, 'click');
            }
        });
    }

    $scope.$watch('mapPointers', function(mapPointers) {
        $scope.initialize('map-canvas-contact', mapPointers);
    });

    GoogleMapService.getStyle().then(function(style) {
        $scope.style = style.style;
        $scope.initialize('map-canvas-contact');
    });
};

module.exports = () => {
    return {
        scope: {
            offices: '=',
            mapPointers: '=',
            mapPointerTemplate: '@',
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