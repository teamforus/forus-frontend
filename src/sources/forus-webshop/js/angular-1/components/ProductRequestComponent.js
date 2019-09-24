let ProductRequestComponent = function(
    $state,
    $rootScope,
    $timeout,
    RecordService,
    FundService,
    AuthService,
    ProductService,
    IdentityService,
    FormBuilderService,
    CredentialsService,
    FileService,
    VoucherService,
    ModalService
) {
    let $ctrl = this;
    let timeout;

    $ctrl.step = 1;
    $ctrl.state = '';
    $ctrl.totalSteps = 1;
    $ctrl.recordsByKey = {};
    $ctrl.netCriteria = false;
    $ctrl.invalidCriteria = [];
    $ctrl.specialKey = 'net_worth';
    $ctrl.authToken = false;
    $ctrl.signedIn = false;
    $ctrl.recordsSubmitting = false;
    $ctrl.requestRecords = [
        
    ];

    $ctrl.files = [];

    $ctrl.initAuthForm = () => {
        $ctrl.authForm = FormBuilderService.build({
            email: '',
            pin_code: 1111
        }, function(form) {
            form.lock();

            IdentityService.make(form.values).then(res => {
                $ctrl.applyAccessToken(res.data.access_token);
            }, res => {
                form.unlock();
                form.errors = res.data.errors;

                if (res.data.errors['records.primary_email'] ==
                    'Het e-mail eigenschap is al gekozen.') {
                    $ctrl.requestAuthQrToken();
                }
            });
        });
    };

    $ctrl.submitNetWorth = () => {
        $ctrl.netCriteria.input_value = $ctrl.netCriteria.value -100;
        $ctrl.submitCriteria($ctrl.netCriteria);
    };

    $ctrl.submitCriteria = (criteria) => {
        $ctrl.recordsSubmitting = true;

        RecordService.store({
            type: criteria.record_type_key,
            value: criteria.input_value
        }).then(res => {
            let record = res.data;
            $ctrl.recordsSubmitting = false;

            FileService.storeAll(criteria.files).then(res => {
                let files = res.map(res => res.data.data.uid);

                $ctrl.requestRecords.push({
                    record_id: record.id,
                    files: files,
                });

                $ctrl.nextStep();
            }, res => {
                criteria.errors = res.data.errors;
                
            });
        }, res => {
            $ctrl.recordsSubmitting = false;
            criteria.errors = res.data.errors;
        });
    };

    $ctrl.applyAccessToken = function(access_token) {
        console.log('$ctrl.applyAccessToken', access_token);
        CredentialsService.set(access_token);
        //- $rootScope.$broadcast('auth:update');
        $ctrl.buildTypes();
        $ctrl.nextStep();
    };

    $ctrl.checkAccessTokenStatus = (type, access_token) => {
        IdentityService.checkAccessToken(access_token).then((res) => {
            if (res.data.message == 'active') {
                $ctrl.applyAccessToken(access_token);
            } else if (res.data.message == 'pending') {
                timeout = $timeout(function() {
                    $ctrl.checkAccessTokenStatus(type, access_token);
                }, 2500);
            } else {
                document.location.reload();
            }
        });
    };

    $ctrl.requestAuthQrToken = () => {
        IdentityService.makeAuthToken().then((res) => {
            $ctrl.authToken = res.data.auth_token;

            $ctrl.checkAccessTokenStatus('token', res.data.access_token);
        }, console.log);
    };


    $ctrl.updateEligibility = () => {
        $ctrl.invalidCriteria = FundService.demoCheckProductEligibility(
            $ctrl.recordsByKey,
            $ctrl.product
        ).map(criteria => {
            criteria.files = [];
            return criteria;
        });
        $ctrl.netCriteria = $ctrl.invalidCriteria.filter(criterion => criterion.record_type_key == $ctrl.specialKey)[0] || false;
        $ctrl.invalidCriteria = $ctrl.invalidCriteria.filter(criterion => criterion.record_type_key != $ctrl.specialKey);
        $ctrl.isEligible = ($ctrl.invalidCriteria.length == 0 && !$ctrl.netCriteria);
    };

    $ctrl.buildSteps = () => {
        // Sign up step + criteria list + location confirm
        let totalSteps = $ctrl.signedIn ? 2 : 3;

        // Net criteria
        totalSteps += ($ctrl.netCriteria ? 1 : 0);

        // Other criteria
        totalSteps += $ctrl.invalidCriteria.length;

        $ctrl.totalSteps = [];

        for (let index = 0; index < totalSteps; index++) {
            $ctrl.totalSteps.push(index + 1);
        }
    };

    $ctrl.step2state = (step) => {
        if (step == 1 && !$ctrl.signedIn) {
            return 'auth';
        }

        if ((step == 2 && !$ctrl.signedIn) || (step == 1 && $ctrl.signedIn)) {
            return 'criteria';
        }

        if ((step == 3 && !$ctrl.signedIn) || (step == 2 && $ctrl.signedIn)) {
            return 'location';
        }

        if ($ctrl.netCriteria && ((
            $ctrl.signedIn && step == 3) || (!$ctrl.signedIn && step == 4))) {
            return 'net_worth';
        }

        if (step > $ctrl.totalSteps.length) {
            return 'done';
        }

        let prevSteps = 2 + ($ctrl.signedIn ? 0 : 1) + ($ctrl.netCriteria ? 1 : 0);

        return 'criteria_' + ((step - prevSteps) - 1);
    };

    $ctrl.buildTypes = () => {
        RecordService.list().then(res => {
            $ctrl.records = res.data;
            $ctrl.records.forEach(function(record) {
                if (!$ctrl.recordsByKey[record.key]) {
                    $ctrl.recordsByKey[record.key] = [];
                }

                $ctrl.recordsByKey[record.key].push(record);
            });

            $ctrl.updateEligibility();
            $ctrl.buildSteps();
        });
    };

    $ctrl.nextStep = () => {
        $ctrl.step++;
        $ctrl.updateState();

        if ($ctrl.step == $ctrl.totalSteps.length + 1) {
            $ctrl.submitRequest();
        }
    };

    $ctrl.submitRequest = () => {
        ProductService.request($ctrl.product.id, {
            records: $ctrl.requestRecords,
            fund_id: $ctrl.fund.id
        }).then(res => {
            console.log('done', res);
        }, res => alert(JSON.stringify(res.data)));
    };

    $ctrl.updateState = () => {
        $ctrl.state = $ctrl.step2state($ctrl.step);
    };

    $ctrl.prepareRecordTypes = () => {
        let recordTypes = {};

        $ctrl.recordTypes.forEach((recordType) => {
            recordTypes[recordType.key] = recordType;
        });

        $ctrl.recordTypes = recordTypes;
    };

    $ctrl.$onInit = function() {
        $ctrl.fund = $ctrl.product.funds[$ctrl.product.funds.length - 1];
        $ctrl.signedIn = AuthService.hasCredentials();

        $ctrl.initAuthForm();
        $ctrl.prepareRecordTypes();

        if ($ctrl.signedIn) {
            $ctrl.buildTypes();
        } else {
            $ctrl.updateEligibility();
            $ctrl.buildSteps();
        }

        $ctrl.updateState();

        //- console.log($ctrl.netCriteria, $ctrl.invalidCriteria, $ctrl.signedIn);
    };

    $ctrl.applyForProduct = (voucher) => {

    };
};

module.exports = {
    bindings: {
        records: '<',
        recordTypes: '<',
        product: '<',
    },
    controller: [
        '$state',
        '$rootScope',
        '$timeout',
        'RecordService',
        'FundService',
        'AuthService',
        'ProductService',
        'IdentityService',
        'FormBuilderService',
        'CredentialsService',
        'FileService',
        'VoucherService',
        'ModalService',
        ProductRequestComponent
    ],
    templateUrl: 'assets/tpl/pages/product-request.html'
};