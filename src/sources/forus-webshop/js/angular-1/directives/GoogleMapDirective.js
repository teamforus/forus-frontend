let GoogleMapDirective = function(
    $scope,
    $element,
    $timeout,
    $compile,
    GoogleMapService,
    appConfigs
) {
    $scope.style = [];
    // locations = [];
    $scope.markers = [];

    $scope.initialize = function(obj, mapPointers) {
        mapPointers = mapPointers || [];

        let $elementCanvas = $element.find('.map-canvas');
        let map, marker, infowindow;
        let image = $elementCanvas.attr("data-marker");
        let zoomLevel = 12;
        let styledMap = new google.maps.StyledMapType($scope.style, {
            name: "Styled Map"
        });

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

        var mapOptions = {
            zoom: zoomLevel,
            disableDefaultUI: false,
            center: new google.maps.LatLng(
                centerLat,
                centerLon
            ),
            scrollwheel: true,
            fullscreenControl: false,
            styles: styles,
            mapTypeControlOptions: {
                mapTypeIds: [google.maps.MapTypeId.ROADMAP, 'map_style']
            }
        }

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
            mapPointerTemplate: '@'
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