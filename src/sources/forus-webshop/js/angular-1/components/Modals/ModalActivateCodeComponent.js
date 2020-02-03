let ModalAuthComponent = function(
    $q,
    $state,
    ModalService,
    FormBuilderService,
    PrevalidationService,
    FundService,
    AuthService,
    VoucherService,
    RecordTypeService,
    RecordService
) {
    let $ctrl = this;

    if (AuthService.hasCredentials()) {
        VoucherService.list({
            per_page: 9999
        }).then(res => {
            $ctrl.vouchers = res.data.data;
        });
    } else {
        $ctrl.vouchers = [];
    }

    $ctrl.getApplicableFunds = () => {
        let deferred = $q.defer();
        let recordsByKey = {};
        let recordsByTypesKey = {};

        RecordService.list().then(res => {
            let records = res.data;

            RecordTypeService.list().then(res => {
                let recordTypes = res.data;

                if (Array.isArray(records)) {
                    records.forEach(function(record) {
                        if (!recordsByKey[record.key]) {
                            recordsByKey[record.key] = [];
                        }

                        recordsByKey[record.key].push(record);
                    });
                }

                recordTypes.forEach(function(recordType) {
                    recordsByTypesKey[recordType.key] = recordType;
                });

                FundService.list().then(res => {
                    let funds = res.data.data.filter(fund => {
                        let validators = fund.validators.map(function(validator) {
                            return validator.identity_address;
                        });

                        return fund.criteria.filter(criterion => {
                            return FundService.checkEligibility(
                                recordsByKey[criterion.record_type_key] || [],
                                criterion,
                                validators,
                                fund.organization_id
                            );
                        }).length == fund.criteria.length;
                    });

                    deferred.resolve(funds);
                })
            });
        });

        return deferred.promise;
    }

    $ctrl.redeemCode = (form, code) => {
        form.lock();

        PrevalidationService.redeem(code).then((res) => {
            $ctrl.close();

            $ctrl.getApplicableFunds().then((funds) => {
                let promises = [];
                let alreadyAppliedFunds = $ctrl.vouchers.map(voucher => voucher.fund_id);

                funds.filter(
                    fund => alreadyAppliedFunds.indexOf(fund.id) === -1
                ).forEach(fund => {
                    promises.push(FundService.apply(fund.id).then(res => {}, console.error));
                });

                $q.all(promises).then(() => {
                    $state.go('vouchers');
                });
            });
        }, (res) => {
            if (res.status == 404) {
                form.errors.code = [
                    res.data.meta.message
                ];
            } else if (res.status == 429) {
                ModalService.open('modalNotification', {
                    type: 'info',
                    title: res.data.meta.title,
                    description: res.data.meta.message.split("\n"),
                });

                $ctrl.close();
            } else if (res.data.meta) {
                ModalService.open('modalNotification', {
                    type: 'info',
                    title: res.data.meta.title,
                    description: res.data.meta.message.split("\n"),
                });

                $ctrl.close();
            }

            form.unlock();

        });
    };

    $ctrl.$onInit = () => {
        $ctrl.activateCodeForm = FormBuilderService.build({
            code: "",
        }, function(form) {
            if (!form.values.code) {
                form.errors.code = true;
                return;
            }

            let code = form.values.code;

            if (typeof code == 'string') {
                code = code.replace(/o|O/g, "0");
                code = code.substring(0, 4) + '-' + code.substring(4);
            }

            $ctrl.redeemCode(form, code);
        });
    };
};

module.exports = {
    bindings: {
        close: '=',
        modal: '='
    },
    controller: [
        '$q',
        '$state',
        'ModalService',
        'FormBuilderService',
        'PrevalidationService',
        'FundService',
        'AuthService',
        'VoucherService',
        'RecordTypeService',
        'RecordService',
        ModalAuthComponent
    ],
    templateUrl: () => {
        return 'assets/tpl/modals/modal-activate-code.html';
    }
};