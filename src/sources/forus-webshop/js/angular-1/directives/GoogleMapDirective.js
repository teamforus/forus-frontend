let GoogleMapDirective = function(
    $scope,
    $window,
    $element,
    $timeout,
    $compile,
    GoogleMapService,
    appConfigs
) {
    $scope.style = [];
    $scope.markers = [];
    let map, mapOptions, initMapGestureHandling;

    $scope.initialize = function(obj, mapPointers) {
        mapPointers = mapPointers || [];
        initMapGestureHandling = $scope.mapGestureHandling || undefined;

        let $elementCanvas = $element.find('.map-canvas');
        let infowindow;
        let image = $elementCanvas.attr("data-marker");
        let zoomLevel = 12;
        let mapGestureHandling = $window.innerWidth >= 768
            ? initMapGestureHandling
            : ($scope.mapGestureHandlingMobile || initMapGestureHandling);

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

        mapOptions = Object.assign({
            zoom: zoomLevel,
            disableDefaultUI: false,
            center: new google.maps.LatLng(centerLat, centerLon),
            scrollwheel: true,
            fullscreenControl: true,
            styles: styles,
            mapTypeControlOptions: {
                mapTypeIds: [google.maps.MapTypeId.ROADMAP, 'map_style']
            },
            gestureHandling: mapGestureHandling,
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
                    }, 250);
                }
            })(marker, mapPointer));

            if ($scope.openFirstPointer && mapPointers.length == 1 && index == 0) {
                google.maps.event.trigger(marker, 'click');
            }
        });
    }

    $scope.$watch('mapPointers', function(mapPointers) {
        $scope.initialize('map-canvas-contact', mapPointers);
    });

    $scope.$watch('mapOptions', function() {
        $scope.initialize('map-canvas-contact', $scope.mapPointers);
    });

    GoogleMapService.getStyle().then(function(style) {
        $scope.style = style.style;
        $scope.initialize('map-canvas-contact');
    });

    angular.element($window).bind('resize', function(){
        mapOptions.gestureHandling = $window.innerWidth >= 768
            ? initMapGestureHandling
            : ($scope.mapGestureHandlingMobile || initMapGestureHandling);

        map.setOptions(mapOptions);
    });

    $scope.$on('$destroy', function() {
        angular.element($window).unbind('resize');
    });
};

module.exports = () => {
    return {
        scope: {
            openFirstPointer: '=',
            offices: '=',
            mapPointers: '=',
            mapPointerTemplate: '@',
            mapOptions: '=',
            mapGestureHandling: '=',
            mapGestureHandlingMobile: '=',
        },
        replace: true,
        controller: [
            '$scope',
            '$window',
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