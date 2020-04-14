let OfficeService = function(ApiRequest) {
    let uriPrefix = '/platform/organizations/';

    return new(function() {
        this.list = function(organization_id) {
            return ApiRequest.get(
                uriPrefix + organization_id + '/offices'
            );
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
            return ApiRequest.get(
                uriPrefix + organization_id + '/offices/' + id
            );
        };

        this.destroy = function(organization_id, id) {
            return ApiRequest.delete(
                uriPrefix + organization_id + '/offices/' + id
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
        }

        this.apiFormToResource = function(formData) {
            let values = JSON.parse(JSON.stringify(formData));
            let schedule = values.schedule ? Object.values(values.schedule) : [];

            schedule.forEach((schedule_item, week_day) => {
                schedule[week_day] = {
                    start_time: schedule_item.start_time || 'null',
                    end_time: schedule_item.end_time || 'null',
                    break_start_time: schedule_item.break_start_time || 'null',
                    break_end_time: schedule_item.break_end_time || 'null',
                };
            });

            values.schedule = schedule;

            return values;
        };

        this.apiResourceToForm = function(apiResource) {
            let schedule = {};
            let weekDays = this.scheduleWeekDays();

            apiResource.schedule = apiResource.schedule || [];

            apiResource.schedule.forEach((schedule_item, week_day) => {
                schedule[week_day] = {
                    start_time: schedule_item.start_time,
                    end_time: schedule_item.end_time,
                    break_start_time: schedule_item.break_start_time,
                    break_end_time: schedule_item.break_end_time,
                };
            });

            for (let prop in weekDays) {
                if (!schedule[prop]) {
                    schedule[prop] = {
                        'start_time': 'null',
                        'end_time': 'null',
                        'break_start_time': 'null',
                        'break_end_time': 'null',
                    }
                } else {
                    if (!schedule[prop].start_time) {
                        schedule[prop].start_time = 'null';
                    }

                    if (!schedule[prop].end_time) {
                        schedule[prop].end_time = 'null';
                    }

                    if (!schedule[prop].break_start_time) {
                        schedule[prop].break_start_time = 'null';
                    }

                    if (!schedule[prop].break_end_time) {
                        schedule[prop].break_end_time = 'null';
                    }
                }
            }

            return {
                'address': apiResource.address,
                'phone': apiResource.phone,
                'schedule': schedule,
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