let ValidationRequestsComponent = function(
    $q,
    $state,
    $timeout,
    ValidatorRequestService,
    appConfigs
) {
    if (!appConfigs.features.validationRequests) {
        return $state.go('csv-validation');
    }

    let $ctrl = this;

    let statePriority = {
        pending: 1,
        approved: 0,
        declined: -1
    };

    $ctrl.shownUsers = {};

    $ctrl.states = [{
        key: null,
        name: 'Alle'
    }, {
        key: 'approved',
        name: 'Geaccepteerd'
    }, {
        key: 'declined',
        name: 'Geweigerd'
    }, {
        key: 'pending',
        name: 'Wachtend'
    }];

    $ctrl.filters = {
        show: false,
        values: {
            group: 1,
        },
        reset: function() {
            $ctrl.filters.values.q = '';
            $ctrl.filters.values.state = $ctrl.states[0].key;
        }
    };

    $ctrl.resetFilters = () => {
        $ctrl.filters.reset();
    };

    $ctrl.hideFilters = () => {
        $timeout(() => $ctrl.filters.show = false);
    };

    let reloadRequests = (query = false) => {
        if (query) {
            $ctrl.filters.values = query;
        }

        ValidatorRequestService.indexGroup($ctrl.filters.values).then(function(res) {
            $ctrl.validatorRequests = res.data;
            init();
        }, console.error);
    };

    let init = () => {
        let data = $ctrl.validatorRequests.data;

        data.forEach(function(row) {
            row.sort(((a, b) => {
                return statePriority[a.state] - statePriority[b.state];
            })).reverse();
        });

        data = data.map(requests => {
            let nth = {
                approved: requests.filter((request) => request.state == 'approved').length,
                declined: requests.filter((request) => request.state == 'declined').length,
                pending: requests.filter((request) => request.state == 'pending').length,
            };

            return {
                requests: requests,
                nth: nth,
                bsn: requests[0].bsn,
                collapsed: nth.pending == 0
            }
        });
        
        data.sort(((a, b) => {
            return a.nth.pending > 0 ? 1 : -1;
        })).reverse();

        $ctrl.validatorRequestsData = data;
    };

    $ctrl.validateRequest = (request, reload = false) => {
        let req = ValidatorRequestService.approve(request.id);

        return reload ? $q((resolve, reject) => {
            req.then(res => reloadRequests() & resolve(res), reject);
        }) : req;
    }

    $ctrl.declineRequest = (request, reload = false) => {
        let req = ValidatorRequestService.decline(request.id);
        
        return reload ? $q((resolve, reject) => {
            req.then(res => reloadRequests() & resolve(res), reject);
        }) : req;
    }

    $ctrl.validateAll = function(request) {
        let requests = request.requests.filter((request) => {
            return request.state == 'pending';
        }).map(request => $ctrl.validateRequest(request));

        Promise.all(requests).then(() => reloadRequests());
    };

    $ctrl.declineAll = function(request) {
        let requests = request.requests.filter((request) => {
            return request.state == 'pending';
        }).map(request => $ctrl.declineRequest(request));

        Promise.all(requests).then(() => reloadRequests());
    };

    $ctrl.$onInit = function() {
        $ctrl.filters.reset();
        init();
    };

    $ctrl.onPageChange = (query) => {
        reloadRequests(query);
    };
};

module.exports = {
    bindings: {
        validatorRequests: '<'
    },
    controller: [
        '$q',
        '$state',
        '$timeout',
        'ValidatorRequestService',
        'appConfigs',
        ValidationRequestsComponent
    ],
    templateUrl: 'assets/tpl/pages/validation-requests.html'
};