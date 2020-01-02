let sprintf = require('sprintf-js').sprintf;

let ModalAuthComponent = function(
    $q,
    $state,
    $timeout,
    ModalService,
    FormBuilderService,
    PrevalidationService,
    ConfigService,
    FundService,
    AuthService,
    VoucherService,
    RecordTypeService,
    RecordService,
    LocalStorageService
) {

    if(AuthService.hasCredentials()) {
        VoucherService.list().then(res => {
            $ctrl.vouchers = res.data.data; 
        });
        } else {
            $ctrl.vouchers = [];
        }
    let $ctrl = this;
    let lockTimer = false;

    $ctrl.getApplicableFunds = () => {
        let deferred = $q.defer(),
            recordsByKey = {},
            recordsByTypesKey = {};

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

    $ctrl.getLockTimeSecondsLeft = () => {
        let lockTimeMinutes  = LocalStorageService.getCollectionItem('voucher_redeem', 'lock_time_minutes', null),
            lockStartTime    = LocalStorageService.getCollectionItem('voucher_redeem', 'lock_start_time', moment()),
            lockSecondsLeft  = lockTimeMinutes * 60 - moment().diff(lockStartTime, "seconds");
        
        return lockSecondsLeft > 0 ? lockSecondsLeft : 0;
    };

    $ctrl.isActivateCodeFormLocked = () => {
        return $ctrl.getLockTimeSecondsLeft() >= 0;    
    };

    $ctrl.activateCodeFormLock = () => {
        $ctrl.activateCodeForm.lock();

        lockTimer = $timeout(function() {
            $ctrl.activateCodeForm.unlock();
            $ctrl.activateCodeForm.reset();

            $timeout.cancel(lockTimer);
        }, $ctrl.getLockTimeSecondsLeft() * 1000);
    }

    $ctrl.getFailedAttemptLockTimeMinutes = (failedAttemptNr) => {
        return {
            1: 1,
            2: 2,
            3: 180
        }[failedAttemptNr];
    }

    $ctrl.addErrorLockMsg = () => {
        let failedAttemptNr = LocalStorageService.getCollectionItem(
            'voucher_redeem', 'attempts_nr', 1);
        let lockTimeMinutes = $ctrl.getFailedAttemptLockTimeMinutes(failedAttemptNr);
        let errorMsg = 'U heeft een verkeerde of gebruikte activatiecode ingevuld. Dit is uw %s poging uit drie waarna u voor 180 minuten geblokeerd wordt.' +
            'U bent geblokkeerd voor %s minuten';

        $ctrl.activateCodeForm.errors.code = true;
        let attemptNrStr = {
            1: 'eerste',
            2: 'tweede',
            3: 'derde',
        }[failedAttemptNr];

        $ctrl.activateCodeForm.errors.message = sprintf(errorMsg, attemptNrStr, lockTimeMinutes);
    }

    $ctrl.resetVoucherRedeemStorage = () => {
        LocalStorageService.resetCollection('voucher_redeem');
    }

    $ctrl.setVoucherRedeemStorage = (failedAttemptsNr) => {
        let lockTimeMinutes = $ctrl.getFailedAttemptLockTimeMinutes(failedAttemptsNr);

        LocalStorageService.setCollectionItem('voucher_redeem', 'lock_time_minutes', lockTimeMinutes);
        LocalStorageService.setCollectionItem('voucher_redeem', 'attempts_nr', failedAttemptsNr);
        LocalStorageService.setCollectionItem('voucher_redeem', 'lock_start_time', moment());
    }

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
                code = code.substring(0, 4) + '-' +  code.substring(4);
            }

            form.lock();
            FundService.read_fundid(code).then((res) => {
                let prevalidations = res.data.data;
                
                VoucherService.list().then(result => {
                    let vouchers = result.data.data;
                    let arrayWithIds = vouchers.map(function(x){
                        return x.fund_id
                    }); 

                    $ctrl.present = arrayWithIds.indexOf(prevalidations.fund_id) != -1
                    
                    if (!$ctrl.present){
                        PrevalidationService.redeem(code).then((res) => {
                            $ctrl.resetVoucherRedeemStorage();

                            $ctrl.close();
        
                            ConfigService.get().then((res) => {
                                if (!res.data.funds.list) {
                                    FundService.applyToFundPrevalidationCode(code).then(res => {
                                        $state.go('voucher', res.data.data);
                                    }, () => {
                                        alert('Helaas, er is geen fonds waarvoor u zich kan aanmelden.');
                                    });
                                } else if (res.data.records.list) {
                                    $state.go('records');
                                } else {
                                    $ctrl.getApplicableFunds().then((funds) => {
                                        let promises = [];
                                        
                                        funds.forEach(fund => {
                                            promises.push(FundService.apply(fund.id).then(res => {}, console.error));
                                        });
    
                                        $q.all(promises).then(() => {
                                            $state.go('vouchers');
                                        });
                                    });
                                }
                            });
                        }, (res) => {
                            let failedAttemptsNr = LocalStorageService.getCollectionItem('voucher_redeem', 'attempts_nr', 0);
                            ++failedAttemptsNr;

                            if (res.status == 429) {
                                $ctrl.close();
                                ModalService.open('modalNotification', {
                                    type: 'info',
                                    title: 'Te veel pogingen!',
                                    description: 'U heeft driemaal een verkeerde activatiecode ingevuld. Probeer het over drie uur opnieuw.'
                                });
                            }

                            $ctrl.setVoucherRedeemStorage(failedAttemptsNr);
                            $ctrl.activateCodeFormLock();
                            $ctrl.addErrorLockMsg();
                        });
                    }        
                    else{
                        $ctrl.close();
                        ModalService.open('modalNotification', {
                            type: 'info',
                            icon: 'info',
                            title: 'U heeft een voucher voor deze regeling!',
                            description: 'Gebruik voor iedere individuele aanvraag een apart account. Wilt u een tweede code activeren, gebruik hiervoor een nieuw e-mailadres.'
                        });
                    } 
                });
            })
        });

        if ($ctrl.isActivateCodeFormLocked()) {
            $ctrl.activateCodeFormLock();
            $ctrl.addErrorLockMsg();
        }
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
        '$timeout',
        'ModalService',
        'FormBuilderService',
        'PrevalidationService',
        'ConfigService',
        'FundService',
        'AuthService',
        'VoucherService',
        'RecordTypeService',
        'RecordService',
        'LocalStorageService',
        ModalAuthComponent
    ],
    templateUrl: () => {
        return 'assets/tpl/modals/modal-activate-code.html';
    }
};
