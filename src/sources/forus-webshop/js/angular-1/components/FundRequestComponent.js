import { addSeconds, format } from 'date-fns';

const FundRequestComponent = function (
    $sce,
    $state,
    $scope,
    $filter,
    $timeout,
    appConfigs,
    FundService,
    DigIdService,
    FormBuilderService,
    FundRequestService,
    IdentityEmailsService,
    PushNotificationsService,
) {
    const $ctrl = this;
    const $trans = $filter('translate');

    $ctrl.step = 1;
    $ctrl.invalidCriteria = [];
    $ctrl.submitInProgress = false;
    $ctrl.errorReason = false;
    $ctrl.finishError = false;
    $ctrl.bsnIsKnown = true;
    $ctrl.emailSubmitted = false;

    $ctrl.contactInformation = '';
    $ctrl.contactInformationError = null;
    $ctrl.steps = [];

    $ctrl.criterionValuePrefix = {
        net_worth: '€',
        base_salary: '€',
    };

    const $transRecordCheckbox = (criteria_record_key, value) => {
        const trans_key = 'fund_request.sign_up.record_checkbox.' + criteria_record_key;
        const translated = $trans(trans_key, { value });
        const trans_fallback_key = 'fund_request.sign_up.record_checkbox.default';

        return translated === trans_key ? $trans(trans_fallback_key, { value: value }) : translated;
    };

    const criterionToValue = (criterion, auto_validation) => {
        const { id, value, operator, input_value, record_type_key, files_uid } = criterion;

        return auto_validation ? {
            value: operator == '=' ? value : (operator == '>' ? parseInt(value) + 1 : parseInt(value) - 1),
            record_type_key: record_type_key,
            fund_criterion_id: id,
        } : {
            files: files_uid,
            value: input_value,
            record_type_key: record_type_key,
            fund_criterion_id: id,
        };
    };

    const formDataBuild = (criteria) => {
        return {
            contact_information: $ctrl.contactInformation,
            records: criteria.map((criterion) => criterionToValue(criterion, $ctrl.fund.auto_validation)),
        };
    };

    // Submit or Validate record criteria
    const validateCriteria = (criteria) => {
        if ($ctrl.submitInProgress) {
            return;
        } else {
            $ctrl.submitInProgress = true;
        }

        return FundRequestService.storeValidate($ctrl.fund.id, formDataBuild(criteria)).then(() => {
            return false;
        }, (res) => ({
            value: res.data.errors['records.0.value'],
            record: res.data.errors['records.0'],
            record_type_key: res.data.errors['records.0.record_type_key'],
            fund_criterion_id: res.data.errors['records.0.fund_criterion_id'],
        })).finally(() => $ctrl.submitInProgress = false);
    };

    const submitRequest = () => {
        if ($ctrl.submitInProgress) {
            return;
        } else {
            $ctrl.submitInProgress = true;
        }

        FundRequestService.store($ctrl.fund.id, formDataBuild($ctrl.invalidCriteria)).then(() => {
            if ($ctrl.fund.auto_validation) {
                return $ctrl.applyFund($ctrl.fund);
            }

            $ctrl.setStepByName('done');
            $ctrl.errorReason = '';
            $ctrl.finishError = false;
        }, (res) => {
            $ctrl.finishError = true;
            $ctrl.errorReason = res.data.message;
            $ctrl.submitInProgress = false;
            $ctrl.contactInformationError = res.data?.errors?.contact_information;

            if (res.status === 422 && res.data.errors.contact_information) {
                return $ctrl.setStepByName('contact_information');
            }

            $ctrl.setStepByName('done');
        });
    };

    // Initialize authorization form
    const makeEmailForm = () => {
        return FormBuilderService.build({
            email: ``,
        }, (form) => {
            IdentityEmailsService.store(form.values.email, {
                target: `fundRequest-${$ctrl.fund.id}`,
            }).then(() => {
                $ctrl.emailSubmitted = true;
            }, (res) => {
                form.errors = res.status === 429 ? {
                    email: [res.data.message],
                } : res.data.errors;
            }).finally(() => form.unlock());
        }, true);
    };

    // Start digid sign-in
    $ctrl.startDigId = () => {
        DigIdService.startFundRequest($ctrl.fund.id).then(
            (res) => document.location = res.data.redirect_url,
            (res) => {
                if (res.status === 403 && res.data.message) {
                    return PushNotificationsService.danger(res.data.message);
                }

                $state.go('error', { errorCode: res.headers('Error-Code') });
            }
        );
    };

    // Submit criteria record
    $ctrl.validateStepCriteria = (criterion) => {
        return validateCriteria([criterion]).then((errors) => {
            if (errors) {
                return criterion.errors = errors;
            }

            $ctrl.nextStep();
        }, console.error);
    };

    $ctrl.onFileInfo = (invalidCriteria) => {
        invalidCriteria.files_uid = invalidCriteria.files.filter(
            (item) => item.uploaded && item.file_data?.uid,
        ).map(file => file.file_data?.uid);

        invalidCriteria.isUploadingFiles = invalidCriteria.files.filter(
            (item) => item.uploading
        ).length > 0;
    };

    $ctrl.setRecordValue = (invalidCriteria) => $timeout(() => {
        invalidCriteria.input_value = invalidCriteria.is_checked ? invalidCriteria.value : null;
    }, 250);

    $ctrl.convertInvalidCriteria = (invalidCriteria) => {
        const criteria = angular.copy(invalidCriteria);

        for (let i = 0; i < criteria.length; i++) {
            const criterion = criteria[i];
            const control_type = criterion.operator == '=' ? 'ui_control_checkbox' : {
                // checkboxes
                'children': 'ui_control_checkbox',
                'kindpakket_eligible': 'ui_control_checkbox',
                'kindpakket_2018_eligible': 'ui_control_checkbox',
                // dates
                'birth_date': 'ui_control_date',
                // stepper
                'children_nth': 'ui_control_step',
                'waa_kind_0_tm_4_2021_eligible_nth': 'ui_control_step',
                'waa_kind_4_tm_18_2021_eligible_nth': 'ui_control_step',
                'adults_nth': 'ui_control_step',
                // numbers
                'tax_id': 'ui_control_number',
                'bsn': 'ui_control_number',
                // currency
                'net_worth': 'ui_control_currency',
                'base_salary': 'ui_control_currency',
            }[criterion.record_type_key] || 'ui_control_text';

            const control_type_default_value = {
                ui_control_checkbox: null,
                ui_control_date: format(new Date(), 'dd-MM-yyyy'),
                ui_control_step: 0,
                ui_control_number: undefined,
                ui_control_currency: undefined,
            }[control_type];

            criterion.files = [];
            criterion.label = $transRecordCheckbox(criterion.record_type_key, criterion.value);
            criterion.input_value = control_type_default_value;
            criterion.control_type = control_type;
            criterion.description_html = $sce.trustAsHtml(criterion.description_html);
        }

        return criteria;
    };

    $ctrl.buildSteps = () => {
        const hideOverview = ($ctrl.invalidCriteria.length == 1 || $ctrl.fund.auto_validation) && !$ctrl.shouldAddContactInfo;
        const criteriaStepsList = [...(new Array($ctrl.invalidCriteria.length).keys())].map((index) => `criteria_${index}`);

        const criteriaSteps = [
            $ctrl.fund.auto_validation ? 'confirm_criteria' : null,
            ...($ctrl.fund.auto_validation ? [] : criteriaStepsList),
            $ctrl.shouldAddContactInfo ? 'contact_information' : null,
            hideOverview ? null : 'application_overview',
        ].filter((step) => step);

        const steps = [
            $ctrl.emailSetupShow ? 'email_setup' : null,
            !$ctrl.fund.auto_validation ? 'criteria' : null,
            ...criteriaSteps.filter((step) => step),
            'done',
        ].filter((step) => step);

        $ctrl.steps = steps;
        $ctrl.criteriaSteps = criteriaSteps;
    };

    $ctrl.nextStep = () => {
        $ctrl.step = Math.min($ctrl.step + 1, $ctrl.steps.length - 1);
    };

    $ctrl.prevStep = () => {
        $ctrl.step = Math.max($ctrl.step - 1, 0);
    };

    $ctrl.applyFund = (fund) => {
        return FundService.apply(fund.id).then((res) => {
            $state.go('voucher', res.data.data);
            PushNotificationsService.success(`Succes! ${$ctrl.fund.name} tegoed geactiveerd!`);
        }, (res) => PushNotificationsService.danger(res.data.message));
    };

    $ctrl.getFirstActiveFundVoucher = (fund, vouchers) => {
        return vouchers.find((voucher) => !voucher.expired && (voucher.fund_id === fund.id));
    }

    $ctrl.setStepByName = (stepName) => {
        $ctrl.step = $ctrl.steps.indexOf(stepName);
    };

    $ctrl.finish = () => {
        $state.go('funds');
    };

    $ctrl.goToActivationComponent = (error = null) => {
        $state.go('fund-activate', {
            fund_id: $ctrl.fund.id,
            backoffice_error: error
        });
    };

    $ctrl.submitApplicationOverview = () => {
        submitRequest();
    };

    $ctrl.submitConfirmCriteria = () => {
        if ($ctrl.steps.includes('contact_information')) {
            return $ctrl.setStepByName('contact_information');
        }

        submitRequest();
    };

    $ctrl.submitContactInformation = (e) => {
        e?.preventDefault();
        e?.stopPropagation();

        if ($ctrl.steps.includes('application_overview')) {
            return $ctrl.setStepByName('application_overview');
        }

        submitRequest();
    };

    $ctrl.fundRequestIsAvailable = (fund) => {
        return fund.allow_fund_requests && (!$ctrl.digidMandatory || ($ctrl.digidMandatory && $ctrl.bsnIsKnown));
    };

    $ctrl.initBsnWarning = () => {
        const timeOffset = appConfigs.bsn_confirmation_offset || 300;
        const timeBeforeReConfirmation = Math.max(($ctrl.fund.bsn_confirmation_time || 0) - $ctrl.identity.bsn_time, 0);
        const timeBeforeWarning = Math.max((timeBeforeReConfirmation - timeOffset), 0);

        if ($ctrl.fund.bsn_confirmation_time === null) {
            return;
        }

        $timeout(() => {
            $ctrl.bsnWarningShow = true;
            $ctrl.bsnWarningValue = format(addSeconds(new Date(), timeOffset), 'HH:mm');
        }, timeBeforeWarning * 1000);

        $timeout(() => {
            $ctrl.digiExpired = true;
        }, timeBeforeReConfirmation * 1000);
    };

    $ctrl.togglePrivacy = ($event) => {
        if ($event?.key == 'Enter') {
            $ctrl.emailForm.values.privacy = !$ctrl.emailForm.values.privacy;
        }
    }

    $ctrl.$onInit = function () {
        // The user has to sign-in first
        if (!$ctrl.identity) {
            return $state.go('start');
        }

        const from = $state.params?.from;
        const voucher = $ctrl.getFirstActiveFundVoucher($ctrl.fund, $ctrl.vouchers);
        const pendingRequests = $ctrl.fundRequests.data.filter((request) => request.state === 'pending');
        const invalidCriteria = $ctrl.fund.criteria.filter((criterion) => !criterion.is_valid);
        const { email_required, contact_info_enabled, contact_info_required } = $ctrl.fund;

        // Voucher already received, go to the voucher
        if (voucher) {
            return $state.go('voucher', voucher);
        }

        // Hot linking is not allowed
        if (from !== 'fund-activate') {
            return $state.go('fund-activate', { fund_id: $ctrl.fund.id });
        }

        $ctrl.appConfigs = appConfigs;
        $ctrl.bsnIsKnown = $ctrl.identity.bsn;
        $ctrl.digidAvailable = $ctrl.configs.digid;
        $ctrl.digidMandatory = $ctrl.configs.digid_mandatory;

        $ctrl.emailSetupShow = !$ctrl.identity.email;
        $ctrl.emailSetupRequired = email_required;
        $ctrl.shouldAddContactInfo = !$ctrl.identity.email && contact_info_enabled;
        $ctrl.shouldAddContactInfoRequired = $ctrl.shouldAddContactInfo && contact_info_required;
        $ctrl.invalidCriteria = $ctrl.convertInvalidCriteria(invalidCriteria);
        $ctrl.recordTypesByKey = $ctrl.recordTypes.reduce((acc, type) => ({ ...acc, [type.key]: type }), {});
        $ctrl.emailForm = makeEmailForm();

        // The user is not authenticated and have to go back to sign-up page
        if ($ctrl.fund.auto_validation && !$ctrl.bsnIsKnown) {
            return $state.go('start');
        }

        // Fund requests enabled and user has all meet the requirements
        if (!$ctrl.fundRequestIsAvailable($ctrl.fund)) {
            return $ctrl.goToActivationComponent(2);
        }

        // The fund is already taken by identity partner
        if ($ctrl.fund.taken_by_partner || pendingRequests?.length > 0) {
            return $ctrl.goToActivationComponent();
        }

        // All the criteria are meet, request the voucher
        if ($ctrl.invalidCriteria.length == 0) {
            return $ctrl.goToActivationComponent();
        }

        $ctrl.buildSteps();
        $ctrl.initBsnWarning();
        $ctrl.setStepByName($ctrl.steps[0]);

        $ctrl.autoSubmit =
            $ctrl.digidAvailable &&
            $ctrl.fund.auto_validation &&
            $ctrl.invalidCriteria?.length > 0 &&
            ['IIT', 'bus_2020', 'meedoen'].includes($ctrl.fund.key);
    };

    $scope.$watch('$ctrl.step', (step) => {
        if ($ctrl.autoSubmit && $ctrl.steps[step] == 'confirm_criteria' && !$ctrl.autoSubmitted) {
            $ctrl.submitConfirmCriteria();
            $ctrl.autoSubmitted = true;
        }
    });
};

export const bindings = {
    fund: '<',
    configs: '<',
    records: '<',
    identity: '<',
    vouchers: '<',
    recordTypes: '<',
    fundRequests: '<',
};

export const controller = [
    '$sce',
    '$state',
    '$scope',
    '$filter',
    '$timeout',
    'appConfigs',
    'FundService',
    'DigIdService',
    'FormBuilderService',
    'FundRequestService',
    'IdentityEmailsService',
    'PushNotificationsService',
    FundRequestComponent,
];

export const templateUrl = 'assets/tpl/pages/fund-request.html';