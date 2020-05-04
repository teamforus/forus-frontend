let SignUpOfficeEditDirective = function(
    $scope,
    $element,
    $timeout,
    $filter,
    MediaService,
    OfficeService,
    FormBuilderService
) {
    let $translate = $filter('translate');
    let officeMediaFile = false;
    let $dir = $scope.$dir = {};

    let transformHours = (hours) => {
        if (hours < 0) {
            hours = 0;
        } else if (hours > 23) {
            hours = 23;
        }

        return hours;
    }

    let transformMinutes = (minutes) => {
        if (minutes < 0) {
            minutes = 0;
        } else if (minutes > 59) {
            minutes = 59;
        }

        return minutes;
    }

    let addLeadingZero = (value) => {
        if (value.length == 0) {
            return '';
        }

        return value.length > 1 ? value : '0' + value;
    };

    let transformTime = (time) => {
        let time_arr = time.split(':');

        if (time_arr.length > 1) {
            let hours = addLeadingZero(transformHours(time_arr[0]));
            let minutes = transformMinutes(time_arr[1]);

            return [hours, minutes].join(':');
        } else {
            if (time.length <= 2) {
                return transformHours(time);
            } else {
                return addLeadingZero(transformHours(time.substr(0, 2))) + ':' +
                    transformMinutes(time.substr(2, time.length - 2));
            }
        }
    }

    $scope.scheduleDetails = [];
    $dir.weekDays = Object.values(OfficeService.scheduleWeekDaysExplicit());

    $dir.syncHours = (modifiedFieldIndex, key) => {
        $timeout(() => {
            let schedule = $dir.form.values.schedule;
            let time = schedule[modifiedFieldIndex][key];

            schedule[modifiedFieldIndex][key] = transformTime(time || '');

            $scope.syncTime(modifiedFieldIndex);
        }, 0);
    };

    $dir.setSameHours = (week_days = true) => {
        $timeout(() => {
            $scope.syncTimePreferences();
            $scope.setSameWeekDayHours(week_days);
            $scope.syncWithFirstRecord(week_days);
        }, 0);
    };


    $scope.setSameWeekDayHours = (week_days) => {
        if ((week_days && $dir.form.values.same_hours) ||
            (!week_days && $dir.form.values.weekend_same_hours)
        ) {
            $dir.weekDays.forEach((weekDayKey, index) => {
                if ((week_days && index <= 4) || (!week_days && index >= 5)) {
                    if (typeof $dir.form.values.scheduleDetails == 'undefined') {
                        $dir.form.values.scheduleDetails = {};
                    }

                    if (typeof $dir.form.values.scheduleDetails[index] == 'undefined') {
                        $dir.form.values.scheduleDetails[index] = {};
                    }

                    $dir.form.values.scheduleDetails[index].is_opened = true;
                }
            });
        }
    };

    $scope.syncTwoDatesHours = (date1, date2) => {
        date1.start_time = date2.start_time;
        date1.end_time = date2.end_time;
        date1.break_start_time = date2.break_start_time;
        date1.break_end_time = date2.break_end_time;
    }

    $scope.syncTime = (modifiedFieldIndex) => {
        let time = $dir.form.values.schedule[modifiedFieldIndex],
            week_days = modifiedFieldIndex <= 4;

        $dir.weekDays.forEach((weekDayKey, index) => {
            if (typeof $dir.form.values.scheduleDetails != 'undefined' &&
                typeof $dir.form.values.scheduleDetails[index] != 'undefined' &&
                $dir.form.values.scheduleDetails[index].is_opened &&
                (week_days && index <= 4) || (!week_days && index >= 5)
            ) {
                if ((week_days && !$dir.form.values.same_hours) ||
                    (!week_days && !$dir.form.values.weekend_same_hours)
                ) {
                    return;
                }

                if (typeof $dir.form.values.schedule[index] == 'undefined') {
                    $dir.form.values.schedule[index] = {};
                }

                $scope.syncTwoDatesHours($dir.form.values.schedule[index], time);
            }
        });
    };

    $scope.syncWithFirstRecord = (week_days) => {
        if (((week_days && $dir.form.values.same_hours) ||
                (!week_days && $dir.form.values.weekend_same_hours)) &&
            typeof $dir.form.values.schedule != 'undefined' &&
            typeof $dir.form.values.schedule[week_days ? 0 : 5] != 'undefined'
        ) {
            let time = $dir.form.values.schedule[week_days ? 0 : 5];

            $dir.weekDays.forEach((weekDayKey, index) => {
                if (typeof $dir.form.values.scheduleDetails != 'undefined' &&
                    typeof $dir.form.values.scheduleDetails[index] != 'undefined' &&
                    $dir.form.values.scheduleDetails[index].is_opened &&
                    (week_days && index <= 4) || (!week_days && index >= 5)
                ) {
                    if (typeof $dir.form.values.schedule[index] == 'undefined') {
                        $dir.form.values.schedule[index] = {};
                    }

                    $scope.syncTwoDatesHours($dir.form.values.schedule[index], time);
                }
            });
        }
    };

    $dir.toggleOpened = (index) => {
        $timeout(() => {
            let schedule = $dir.form.values.scheduleDetails;

            if (typeof schedule[index] == 'undefined') {
                schedule[index] = {};
            }

            $dir.form.values.scheduleDetails[index].is_opened != schedule[index].is_opened;

            if (!schedule[index].is_opened ||
                typeof $dir.form.values.schedule == 'undefined' ||
                typeof $dir.form.values.schedule[index] == 'undefined'
            ) {
                return;
            }

            delete $dir.form.values.schedule[index];
        }, 0);
    };

    $scope.syncTimePreferences = () => {
        let schedule_days = $dir.form.values.schedule ? Object.values($dir.form.values.schedule) : []; 
        let schedule_options = $dir.form.values.scheduleDetails ? Object.values($dir.form.values.scheduleDetails) : [];

        let has_days_set = schedule_days.filter(
            (day, index) => $scope.isDateModified(day) && index < 5
        ).length == 0;

        let has_weekend_days_set = schedule_days.filter(
            (day, index) => $scope.isDateModified(day) && index >= 5
        ).length == 0;

        if (!$dir.form.values.same_hours && has_days_set) {
            // uncheck all normal days
            schedule_options = schedule_options.map((scheduleDetail, index) => {
                if (index < 5) {
                    scheduleDetail.is_opened = false;
                }
                return scheduleDetail;
            });
        }

        if (!$dir.form.values.weekend_same_hours && has_weekend_days_set) {
            // uncheck all weekend days
            schedule_options = schedule_options.map((scheduleDetail, index) => {
                if (index >= 5) {
                    scheduleDetail.is_opened = false;
                }

                return scheduleDetail;
            });
        }
    }

    $scope.isDateModified = (date) => {
        return date.start_time || date.end_time || date.break_start_time || date.break_end_time;
    }

    $scope.getHours = (time) => {
        return time.split(':')[0];
    };

    $scope.getMinutes = (time) => {
        let minutes = time.split(':')[1];

        return typeof minutes != 'undefined' ? minutes : '';
    };

    $scope.addLeadingZeroToTime = (time) => {
        if (!time.length) {
            return '';
        }

        return addLeadingZero($scope.getHours(time)) + ':' +
            addLeadingZero($scope.getMinutes(time));
    };

    $scope.transformDayTime = (day) => {
        day.break_start_time = $scope.addLeadingZeroToTime(day.break_start_time);
        day.break_end_time   = $scope.addLeadingZeroToTime(day.break_end_time);
        day.start_time       = $scope.addLeadingZeroToTime(day.start_time);
        day.end_time         = $scope.addLeadingZeroToTime(day.end_time);

        return day;
    };

    $scope.buildForm = (values) => {
        return FormBuilderService.build(values, (form) => {
            let submit = function() {
                let promise;
                let created = false;

                Object.values(form.values.schedule).forEach((day, index) => {
                    form.values.schedule[index] = $scope.transformDayTime(day);
                });

                if (form.values.id) {
                    promise = OfficeService.update(
                        $scope.organization.id,
                        form.values.id,
                        form.values
                    )
                } else {
                    promise = OfficeService.store(
                        $scope.organization.id,
                        form.values
                    )
                    created = true;
                }

                promise.then(() => {
                    if (created) {
                        $scope.created();
                    } else {
                        $scope.updated();
                    }
                }, (res) => {
                    form.errors = res.data.errors;
                    // Temporary fix
                    for (let errorKey in form.errors) {
                        if (errorKey.indexOf('schedule') != -1) {
                            form.errors.schedule = $translate('offices_edit.errors.schedule');
                        }
                    }
                    form.unlock();
                });
            };

            if (officeMediaFile) {
                MediaService.store('office_photo', officeMediaFile).then(res => {
                    form.values.media_uid = res.data.data.uid;
                    officeMediaFile = false;
                    submit();
                });
            } else {
                submit();
            }
        }, true);
    };


    $dir.selectOfficePhoto = (file) => officeMediaFile = file;

    $scope.addMapAutocomplete = () => {
        let autocompleteOptions = {
            componentRestrictions: {
                country: "nl"
            },
        };

        let autocompleteFrom = new google.maps.places.Autocomplete(
            $element.find('#office_address')[0],
            autocompleteOptions
        );

        google.maps.event.addListener(autocompleteFrom, 'place_changed', function() {
            $dir.form.values.address = autocompleteFrom.getPlace().formatted_address;
        });
    }

    $scope.init = () => {
        $dir.form = $scope.buildForm({ 
            phone: $scope.organization.phone 
        });
        $dir.scheduleDetails = [];

        if ($scope.office.schedule) {
            Object.values($scope.office.schedule).forEach((weekDay, index) => {
                $dir.scheduleDetails.push({
                    is_opened: true
                });
            });

            $dir.form.values = angular.copy($scope.office);
        }

        $dir.form.values.scheduleDetails = $dir.scheduleDetails;

        $timeout(() => $scope.addMapAutocomplete(), 0);
    };

    $scope.init();
};

module.exports = () => {
    return {
        scope: {
            office: '=',
            organization: '=',
            cancel: '&',
            created: '&',
            updated: '&',
        },
        restrict: "EA",
        replace: true,
        controller: [
            '$scope',
            '$element',
            '$timeout',
            '$filter',
            'MediaService',
            'OfficeService',
            'FormBuilderService',
            SignUpOfficeEditDirective
        ],
        templateUrl: 'assets/tpl/directives/sign_up/sign_up-office-edit.html'
    };
};