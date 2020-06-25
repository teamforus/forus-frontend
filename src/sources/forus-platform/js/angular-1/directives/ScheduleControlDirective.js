let ScheduleControlDirective = function(
    $scope,
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

    $dir.syncHours = (index, key) => {
        let schedule = $dir.scheduleDetails;
        let time = schedule[index][key];

        schedule[index][key] = transformTime(time || '');

        $scope.syncTime(index);
        $scope.syncModel();
        $scope.buildTimeOptions();
    };

    $dir.setSameHours = (week_days = true) => {
        $timeout(() => {
            $scope.syncWithFirstRecord(week_days);
        }, 10);
    };

    $scope.syncTime = (index) => {
        let time = $dir.scheduleDetails[index],
            week_days = index <= 4;

        Object.keys($dir.weekDays).forEach((index) => {
            if (typeof $dir.scheduleDetails != 'undefined' &&
                typeof $dir.scheduleDetails[index] != 'undefined' &&
                (week_days && index <= 4) || (!week_days && index >= 5)
            ) {
                if ((week_days && !$dir.same_hours) ||
                    (!week_days && !$dir.weekend_same_hours)
                ) {
                    return;
                }

                if (typeof $dir.scheduleDetails[index] == 'undefined') {
                    $dir.scheduleDetails[index] = {};
                }

                $scope.syncTwoDatesHours($dir.scheduleDetails[index], time);
            }
        });
    };

    $scope.syncTwoDatesHours = (date1, date2) => {
        date1.start_time = date2.start_time;
        date1.end_time = date2.end_time;
        date1.break_start_time = date2.break_start_time;
        date1.break_end_time = date2.break_end_time;
    };

    $scope.syncWithFirstRecord = (week_days) => {
        let activeWeekDays = $dir.scheduleDetails.slice(0, 5).filter(scheduleDetail => !scheduleDetail.is_closed);
        let activeWeekEndDays = $dir.scheduleDetails.slice(5, 7).filter(scheduleDetail => !scheduleDetail.is_closed);
        let days = (week_days ? activeWeekDays : activeWeekEndDays);

        if (days.length === 0) {
            return;
        }

        if ((week_days && $dir.same_hours) || (!week_days && $dir.weekend_same_hours)) {
            days.forEach(day => {
                $scope.syncTwoDatesHours(day, days[0]);
            });

            $scope.syncModel();
        }
    };

    $dir.toggleOpened = () => {
        $timeout(() => {
            $scope.syncModel();
        }, 10);
    };

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
        day.break_end_time = $scope.addLeadingZeroToTime(day.break_end_time);
        day.start_time = $scope.addLeadingZeroToTime(day.start_time);
        day.end_time = $scope.addLeadingZeroToTime(day.end_time);

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

    $scope.syncModel = () => {
        $dir.schedule = $dir.scheduleDetails.map((scheduleDetail) => {
            return (!scheduleDetail || scheduleDetail.is_closed) ? null : scheduleDetail;
        }).map((scheduleDetail) => {
            return scheduleDetail && $scope.hasAnyTimeValue(scheduleDetail) ? scheduleDetail : null;
        });

        $scope.ngModel = $dir.schedule;
    };

    $scope.isSameSchedule = (day1, day2) => {
        return day1.start_time == day2.start_time &&
            day1.end_time == day2.end_time &&
            day1.break_start_time == day2.break_start_time &&
            day1.break_end_time == day2.break_end_time;
    };

    $scope.parseTime = (time) => {
        time = time.split(':');
        return (time[0] * 60) + (time[1] * 1);
    };

    $scope.buildTimeOptions = () => {
        let timeOptions = [];

        $dir.scheduleDetails.forEach((scheduleDetail, index) => {
            timeOptions[index] = {};
            timeOptions[index].time = $scope.buildTimeOptionsPair(
                scheduleDetail.start_time,
                scheduleDetail.end_time
            );

            let breakPair = $scope.buildTimeOptionsPair(
                scheduleDetail.break_start_time,
                scheduleDetail.break_end_time
            );

            if (typeof scheduleDetail.start_time == 'string' && scheduleDetail.start_time.indexOf(':') !== -1) {
                breakPair.from = breakPair.from.filter(time => {
                    return time.key == '' || (
                        $scope.parseTime(time.key) > $scope.parseTime(scheduleDetail.start_time));
                });

                breakPair.to = breakPair.to.filter(time => {
                    return time.key == '' || (
                        $scope.parseTime(time.key) > $scope.parseTime(scheduleDetail.start_time));
                });
            }


            if (typeof scheduleDetail.end_time == 'string' && scheduleDetail.end_time.indexOf(':') !== -1) {
                breakPair.from = breakPair.from.filter(time => {
                    return time.key == '' || (
                        $scope.parseTime(time.key) < $scope.parseTime(scheduleDetail.end_time));
                });
                
                breakPair.to = breakPair.to.filter(time => {
                    return time.key == '' || (
                        $scope.parseTime(time.key) < $scope.parseTime(scheduleDetail.end_time));
                });
            }

            timeOptions[index].break = breakPair;
        });

        $dir.timeOptions = timeOptions;
    };

    $scope.buildTimeOptionsPair = (from, to) => {
        if (typeof from == 'string' && from.indexOf(':') !== -1) {
            from = $scope.parseTime(from);
        } else {
            from = false;
        };

        if (typeof to == 'string' && to.indexOf(':') !== -1) {
            to = $scope.parseTime(to);
        } else {
            to = false;
        };

        let timeOptions = [];
        let minutes = ['00', '15', '30', '45'];

        [...Array(24).keys()].forEach(hour => {
            let hourValue = (hour) > 9 ? (hour).toString() : '0' + (hour);

            minutes.forEach(minute => {
                timeOptions.push({
                    key: hourValue + ':' + minute,
                    value: hourValue + ':' + minute,
                });
            });
        });

        let pair = {
            from: [{
                key: '',
                value: 'Van'
            }, ...timeOptions],
            to: [{
                key: '',
                value: 'Tot'
            }, ...timeOptions],
        }

        if (from) {
            pair.to = pair.to.filter(time => {
                return (time.key === '' || ($scope.parseTime(time.value) > from));
            });
        }

        if (to) {
            pair.from = pair.from.filter(time => {
                return (time.key === '' || ($scope.parseTime(time.value) < to));
            });
        }

        return pair;
    };

    $scope.init = () => {
        $dir.weekDays = Object.values(OfficeService.scheduleWeekDaysExplicit());
        $dir.schedule = $scope.ngModel;
        $dir.scheduleDetails = [];

        let schedulesWithValue = $dir.schedule.filter($scope.hasAnyTimeValue);

        $dir.scheduleDetails = Object.keys($dir.weekDays).map(function(week_day) {
            return {
                week_day: week_day,
                is_closed: schedulesWithValue.length > 0 ? true : week_day > 4,
                start_time: '',
                end_time: '',
                break_start_time: '',
                break_end_time: '',
            };
        });

        if (schedulesWithValue.length > 0) {
            $dir.scheduleDetails.forEach(scheduleDetail => {
                let value = schedulesWithValue.filter(
                    schedule => schedule.week_day == scheduleDetail.week_day
                )[0] || null;


                if (value) {
                    value.is_closed = !$scope.hasAnyTimeValue(value);
                    scheduleDetail = Object.assign(scheduleDetail, value);
                }
            });
        }

        let activeWeekDays = $dir.scheduleDetails.slice(0, 5).filter(scheduleDetail => !scheduleDetail.is_closed);
        let activeWeekEndDays = $dir.scheduleDetails.slice(5, 6).filter(scheduleDetail => !scheduleDetail.is_closed);

        $dir.same_hours = activeWeekDays.filter(scheduleDetail => {
            return $scope.isSameSchedule(activeWeekDays[0], scheduleDetail);
        }).length === activeWeekDays.length;

        $dir.weekend_same_hours = activeWeekEndDays.filter(scheduleDetail => {
            return $scope.isSameSchedule(activeWeekEndDays[5], scheduleDetail);
        }).length === activeWeekEndDays.length;

        if ($dir.same_hours && activeWeekDays.length > 0) {
            $dir.scheduleDetails.slice(0, 5).forEach(scheduleDetail => {
                $scope.syncTwoDatesHours(scheduleDetail, activeWeekDays[0]);
            });
        }

        if ($dir.same_hours && activeWeekEndDays.length > 0) {
            $dir.scheduleDetails.slice(5, 6).forEach(scheduleDetail => {
                $scope.syncTwoDatesHours(scheduleDetail, activeWeekEndDays[0]);
            });
        }

        $scope.buildTimeOptions();
        $scope.syncModel();
    };

    $scope.$watch('errors', (n, o) => {
        let errors = {};

        if (n != o && typeof n == 'object') {
            [...Array(7).keys()].forEach(week_day => {
                errors[week_day] = Object.keys(n).filter(
                    key => key.startsWith('schedule.' + week_day + '.')
                ).map((key) => {
                    return n[key];
                });
            });
        }


        $dir.errors = errors;
    });

    $scope.init();
};

module.exports = () => {
    return {
        scope: {
            errors: '=',
            ngModel: '=',
            options: '='
        },
        restrict: "EA",
        replace: true,
        controller: [
            '$scope',
            '$timeout',
            'OfficeService',
            ScheduleControlDirective
        ],
        templateUrl: 'assets/tpl/directives/schedule-control.html'
    };
};