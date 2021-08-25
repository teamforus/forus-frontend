const OfficeService = function(ApiRequest) {
    const uriPrefix = '/platform/organizations/';

    return new (function() {
        this.list = function(organization_id, query = {}) {
            return ApiRequest.get(uriPrefix + organization_id + '/offices', query);
        };

        this.store = function(organization_id, values) {
            return ApiRequest.post(
                uriPrefix + organization_id + '/offices',
                this.apiFormToResource(values)
            );
        };

        this.update = function(organization_id, id, values) {
            return ApiRequest.patch(
                uriPrefix + organization_id + '/offices/' + id,
                this.apiFormToResource(values)
            );
        };

        this.read = function(organization_id, id) {
            return ApiRequest.get(uriPrefix + organization_id + '/offices/' + id);
        };

        this.destroy = function(organization_id, id) {
            return ApiRequest.delete(uriPrefix + organization_id + '/offices/' + id);
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
        }

        this.apiFormToResource = function(formData) {
            let values = JSON.parse(JSON.stringify(formData));
            let schedule = values.schedule ? Object.values(values.schedule) : [];
            let fields = ['week_day', 'start_time', 'end_time', 'break_start_time', 'break_end_time'];

            schedule = schedule.filter(schedule_item => schedule_item).map(schedule_item => {
                let _schedule_item = {};

                fields.forEach(field => {
                    if (schedule_item[field] !== undefined && schedule_item[field] !== '') {
                        _schedule_item[field] = schedule_item[field];
                    }
                });

                return _schedule_item;
            });

            values.schedule = {};

            schedule.forEach(scheduleItem => {
                values.schedule[scheduleItem.week_day] = scheduleItem;
            });

            return values;
        };

        this.apiResourceToForm = function(apiResource) {
            let schedule = [];
            let weekDays = this.scheduleWeekDays();

            apiResource.schedule = apiResource.schedule || [];
            apiResource.schedule.forEach((schedule_item, week_day) => {
                schedule[week_day] = {
                    week_day: schedule_item.week_day + '',
                    start_time: schedule_item.start_time,
                    end_time: schedule_item.end_time,
                    break_start_time: schedule_item.break_start_time,
                    break_end_time: schedule_item.break_end_time,
                };
            });

            let scheduleByDay = apiResource.schedule.reduce((scheduleData, schedule) => {
                return { ...scheduleData, ...({ [schedule.week_day]: schedule }) };
            }, {});

            for (let prop in weekDays) {
                if (!scheduleByDay[prop]) {
                    scheduleByDay[prop] = {
                        'week_day': parseInt(prop, 10),
                        'start_time': '',
                        'end_time': '',
                        'break_start_time': '',
                        'break_end_time': '',
                    }
                } else {
                    let item = scheduleByDay[prop.toString()];

                    item.start_time = item.start_time ? item.start_time : '';
                    item.end_time = item.end_time ? item.end_time : '';

                    item.break_start_time = item.break_start_time ? item.break_start_time : '';
                    item.break_end_time = item.break_end_time ? item.break_end_time : '';
                }
            }

            return {
                address: apiResource.address,
                phone: apiResource.phone,
                schedule: Object.values(scheduleByDay),
            };
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

        this.scheduleWeekDaysExplicit = () => {
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
                'null': 'Tijd'
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