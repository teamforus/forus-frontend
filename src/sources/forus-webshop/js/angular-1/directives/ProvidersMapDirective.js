let GoogleMapDirective = function (
    $scope,
    $element,
    $timeout,
    $filter,
    GoogleMapService,
    AuthService,
    appConfigs
) {
    $scope.style = [];
    // locations = [];
    $scope.markers = [];

    let $translate = $filter('translate');

    let trans = (key) => $translate('maps.' + key);

    var initialize = function (obj, offices) {
        offices = offices || [];

        var $elementCanvas = $element.find('.map-canvas');
        var map, marker, infowindow;
        var image = $elementCanvas.attr("data-marker");
        var zoomLevel = 12;
        // var styledMap = new google.maps.StyledMapType($scope.style, {
        //    name: "Styled Map"
        // });
        let styles = [{
            featureType: 'poi.business',
            stylers: [{
                visibility: 'off'
            }]
        },
        {
            featureType: 'transit',
            elementType: 'labels.icon',
            stylers: [{
                visibility: 'off'
            }]
        }];

        let centerLat = offices.length ? offices[0].lat : appConfigs.features.map.lat;
        let centerLon = offices.length ? offices[0].lon : appConfigs.features.map.lon;

        var mapOptions = {
            zoom: zoomLevel,
            gestureHandling: 'greedy',
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

        // map.mapTypes.set('map_style', styledMap);
        // map.setMapTypeId('map_style');

        infowindow = new google.maps.InfoWindow();

        offices.forEach(function (office, index) {
            let marker = new google.maps.Marker({
                position: new google.maps.LatLng(office.lat, office.lon),
                map: map,
                icon: image,
                office: office
            });

            $scope.markers.push(marker);

            google.maps.event.addListener(marker, 'click', (function (marker, office) {
                var description = [
                    trans('labels.address') + ': ' + (office.address || trans('no_data')),
                    trans('labels.organization_type') + ': ' + (office.organization.business_type ?
                        office.organization.business_type.name : trans('no_data'))
                ];

                if (office.organization.website) {
                    description.push([
                        trans('labels.website') + ': ' + '<a target="_blank" href="',
                        office.organization.website,
                        '">',
                        office.organization.website + '</a>'
                    ].join(''));
                }

                if (AuthService.hasCredentials()) {
                    description.push(trans('labels.phone') + ': ' + (
                        office.phone || office.organization.phone || trans('no_data')
                    ));

                    description.push(trans('labels.email') + ': ' + (
                        office.email || office.organization.email || trans('no_data')
                    ));
                }

                description = description.filter(item => item);

                return function () {
                    $timeout(function () {
                        $scope.selectedOffice = office.id;
                    }, 100);

                    infowindow.setContent(
                        '<div class="map-card">\
                                <img class="map-card-img" src="' + (office.photo ? office.photo.sizes.thumbnail : (office.organization.logo ? office.organization.logo.sizes.thumbnail : 'assets/img/placeholders/office-thumbnail.png')) + '" alt=""/>\
                                <div class="map-card-title">' + (office.organization.name || 'Geen data') + '</div>\
                                <div class="map-card-description">' + description.join('<br />') + '</div>\
                                </div>');
                    infowindow.open(map, marker);
                }
            })(marker, office));

            if (index == 0) {
                google.maps.event.trigger(marker, 'click');
            }
        });
    }

    $scope.$watch('selectedOffice', function (selectedOffice) {
        $scope.markers.forEach(marker => {
            if (marker.office.id == selectedOffice) {
                google.maps.event.trigger(marker, 'click')
            }
        });
    });

    $scope.$watch('offices', function (offices) {
        initialize('map-canvas-contact', offices);
    });

    GoogleMapService.getStyle().then(function (style) {
        $scope.style = style.style;
        initialize('map-canvas-contact');
    });
};

module.exports = () => {
    return {
        scope: {
            offices: '=',
            selectedOffice: '=?'
        },
        replace: true,
        transclude: true,
        controller: [
            '$scope',
            '$element',
            '$timeout',
            '$filter',
            'GoogleMapService',
            'AuthService',
            'appConfigs',
            GoogleMapDirective
        ],
        templateUrl: 'assets/tpl/directives/google-map.html',
    };
};
