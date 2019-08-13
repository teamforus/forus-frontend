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
        values: {},
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

    let reloadRequests = () => {
        ValidatorRequestService.index($ctrl.filters.values).then(function(res) {
            $ctrl.validatorRequests = res.data;
            init();
        }, console.error);
    };

    let init = () => {
        let byBsn = {};
        let bsnCollection = [];

        $ctrl.validatorRequests.data.forEach(request => {
            if (!byBsn[request.bsn]) {
                byBsn[request.bsn] = {
                    requests: []
                };

                bsnCollection.push(request.bsn);
            }

            byBsn[request.bsn].requests.push(request);
        });

        bsnCollection.forEach(function(bsn) {
            byBsn[bsn].requests.sort(((a, b) => {
                return statePriority[a.state] - statePriority[b.state];
            })).reverse();
        });

        for (var prop in byBsn) {
            let byBsnItem = byBsn[prop];
            let requests = byBsnItem.requests;

            byBsnItem.nth = {
                approved: requests.filter((request) => request.state == 'approved').length,
                declined: requests.filter((request) => request.state == 'declined').length,
                pending: requests.filter((request) => request.state == 'pending').length,
            };
        }

        $ctrl.validatorRequestsByBsn = Object.values(byBsn).map(function(byBsnRow) {
            byBsnRow.bsn = byBsnRow.requests[0].bsn;
            byBsnRow.collapsed = byBsnRow.nth.pending == 0;
            return byBsnRow;
        });

        $ctrl.validatorRequestsByBsn.sort(((a, b) => {
            return a.nth.pending > 0 ? 1 : -1;
        })).reverse();
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

    $ctrl.onPageChange = async (query) => {
        reloadRequests();
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