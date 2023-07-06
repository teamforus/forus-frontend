let OfficeService = function(ApiRequest) {
    let uriPrefix = '/platform';

    return new(function() {
        this.list = function(query = {}) {
            return ApiRequest.get(uriPrefix + '/offices', query);
        };

        this.read = function(id) {
            return ApiRequest.get(
                uriPrefix + '/offices/' + id
            );
        };

        this.states = function() {
            return [{
                name: "Active",
                value: 'active',
            }, {
                name: "Paused",
                value: 'paused',
            }, {
                name: "Closed",
                value: 'closed',
            }];
        };

        this.scheduleWeekDays = () => {
            return {
                0: "Ma",
                1: "Di",
                2: "Wo",
                3: "Do",
                4: "Vr",
                5: "Za",
                6: "Zo"
            };
        };

        this.scheduleWeekFullDays = () => {
            return {
                0: "Maandag",
                1: "Dinsdag",
                2: "Woensdag",
                3: "Donderdag",
                4: "Vrijdag",
                5: "Zaterdag",
                6: "Zondag"
            };
        };

        this.scheduleDayTimes = () => {
            let times = {
                'null': 'Select'
            };

            for (var i = 0; i < 24; i++) {
                let hour = (i < 10 ? '0' + i : i);

                times[hour + ':00'] = hour + ':00';
                times[hour + ':30'] = hour + ':30';
            }

            return times;
        };
    });
};

module.exports = [
    'ApiRequest',
    OfficeService
];