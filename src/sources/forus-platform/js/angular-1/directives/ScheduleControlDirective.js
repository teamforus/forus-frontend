let ScheduleControlDirective = function(
    $scope, 
    $element,
    $timeout,
    OfficeService
) {
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
            let schedule = $dir.schedule;
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
        if ((week_days && $dir.same_hours) ||
            (!week_days && $dir.weekend_same_hours)
        ) {
            $dir.weekDays.forEach((weekDayKey, index) => {
                if ((week_days && index <= 4) || (!week_days && index >= 5)) {
                    if (typeof $dir.scheduleDetails == 'undefined') {
                        $dir.scheduleDetails = {};
                    }

                    if (typeof $dir.scheduleDetails[index] == 'undefined') {
                        $dir.scheduleDetails[index] = {};
                    }

                    $dir.scheduleDetails[index].is_opened = true;
                }
            });
        }
    };

    $scope.syncTwoDatesHours = (date1, date2) => {
        date1.start_time = date2.start_time;
        date1.end_time = date2.end_time;
        date1.break_start_time = date2.break_start_time;
        date1.break_end_time = date2.break_end_time;
    };

    $scope.syncTime = (modifiedFieldIndex) => {
        let time = $dir.schedule[modifiedFieldIndex],
            week_days = modifiedFieldIndex <= 4;

        $dir.weekDays.forEach((weekDayKey, index) => {
            if (typeof $dir.scheduleDetails != 'undefined' &&
                typeof $dir.scheduleDetails[index] != 'undefined' &&
                $dir.scheduleDetails[index].is_opened &&
                (week_days && index <= 4) || (!week_days && index >= 5)
            ) {
                if ((week_days && !$dir.same_hours) ||
                    (!week_days && !$dir.weekend_same_hours)
                ) {
                    return;
                }

                if (typeof $dir.schedule[index] == 'undefined') {
                    $dir.schedule[index] = {};
                }

                $scope.syncTwoDatesHours($dir.schedule[index], time);
            }
        });
    };

    $scope.syncWithFirstRecord = (week_days) => {
        if (((week_days && $dir.same_hours) ||
                (!week_days && $dir.weekend_same_hours)) &&
            typeof $dir.schedule != 'undefined' &&
            typeof $dir.schedule[week_days ? 0 : 5] != 'undefined'
        ) {
            let time = $dir.schedule[week_days ? 0 : 5];

            $dir.weekDays.forEach((weekDayKey, index) => {
                if (typeof $dir.scheduleDetails != 'undefined' &&
                    typeof $dir.scheduleDetails[index] != 'undefined' &&
                    $dir.scheduleDetails[index].is_opened &&
                    (week_days && index <= 4) || (!week_days && index >= 5)
                ) {
                    if (typeof $dir.schedule[index] == 'undefined') {
                        $dir.schedule[index] = {};
                    }

                    $scope.syncTwoDatesHours($dir.schedule[index], time);
                }
            });
        }
    };

    $dir.toggleOpened = (index) => {
        $timeout(() => {
            let schedule = $dir.scheduleDetails;

            if (typeof schedule[index] == 'undefined') {
                schedule[index] = {};
            }

            $dir.scheduleDetails[index].is_opened != schedule[index].is_opened;

            if (!schedule[index].is_opened ||
                typeof $dir.schedule == 'undefined' ||
                typeof $dir.schedule[index] == 'undefined'
            ) {
                return;
            }

            delete $dir.schedule[index];
        }, 0);
    };

    $scope.syncTimePreferences = () => {
        let schedule_days = $dir.schedule ? 
            Object.values($dir.schedule) : []; 
        let schedule_options = $dir.scheduleDetails ? 
            Object.values($dir.scheduleDetails) : [];

        let has_days_set = schedule_days.filter(
            (day, index) => $scope.isDateModified(day) && index < 5
        ).length == 0;

        let has_weekend_days_set = schedule_days.filter(
            (day, index) => $scope.isDateModified(day) && index >= 5
        ).length == 0;

        if (!$dir.same_hours && has_days_set) {
            // uncheck all normal days
            schedule_options = schedule_options.map((scheduleDetail, index) => {
                if (index < 5) {
                    scheduleDetail.is_opened = false;
                }
                return scheduleDetail;
            });
        }

        if (!$dir.weekend_same_hours && has_weekend_days_set) {
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
        if (!time || !time.length) {
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

    $scope.isTimeDefined = (value) => {
        return value && value != 'null' && value != 'false';
    };

    $scope.hasAnyTimeValue = (date) => {
        return $scope.isTimeDefined(date.start_time) || 
            $scope.isTimeDefined(date.end_time) ||
            $scope.isTimeDefined(date.break_start_time) ||
            $scope.isTimeDefined(date.break_end_time);
    };

    $scope.init = () => {
        $dir.schedule = $scope.ngModel;
        $dir.scheduleDetails = [];

        Object.values($dir.schedule).forEach((weekDay, index) => {
            $dir.scheduleDetails.push({
                is_opened: $scope.hasAnyTimeValue(weekDay)
            });
        });
    };

    $scope.init();
};

module.exports = () => {
    return {
        scope: {
            ngModel: '=',
            options: '='
        },
        restrict: "EA",
        replace: true,
        controller: [
            '$scope', 
            '$element',
            '$timeout',
            'OfficeService',
            ScheduleControlDirective
        ],
        templateUrl: 'assets/tpl/directives/schedule-control.html' 
    };
};