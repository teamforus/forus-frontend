let FundsEditComponent = function(
    $state,
    $stateParams,
    $rootScope,
    FundService,
    RecordTypeService,
    FormBuilderService,
    MediaService
) {
    let $ctrl = this;
    let mediaFile = false;

    $ctrl.media;
    $ctrl.recordTypes = [];
    $ctrl.operators = [{
        key: "=",
        name: "=",
    }, {
        key: "<",
        name: "<",
    }, {
        key: ">",
        name: ">",
    }];

    $ctrl.addCriteria = () => {
        $ctrl.form.values.criteria.push({
            record_type_key: $ctrl.recordTypes[0].key,
            operator: "=",
            value: "",
        });
    };

    $ctrl.removeCriteria = (criteria) => {
        let index;

        if ((index = $ctrl.form.values.criteria.indexOf(criteria)) != -1) {
            $ctrl.form.values.criteria.splice(index, 1)
        }
    };

    $ctrl.$onInit = function() {
        let values = $ctrl.fund ? FundService.apiResourceToForm(
            $ctrl.fund
        ) : {
            criteria: [],
            product_categories: [],
            state: $ctrl.fundStates[0].value
        };

        if (!$rootScope.appConfigs.features.organizations.funds.criteria) {
            delete values.criteria;
        }

        $ctrl.form = FormBuilderService.build(values, async (form) => {
            form.lock();

            let promise;

            if (mediaFile) {
                let res = await MediaService.store('fund_logo', mediaFile);

                $ctrl.media = res.data.data;
                $ctrl.form.values.media_uid = $ctrl.media.uid;
            }

            if ($ctrl.fund) {
                promise = FundService.update(
                    $stateParams.organization_id,
                    $stateParams.id,
                    form.values
                )
            } else {
                promise = FundService.store(
                    $stateParams.organization_id,
                    form.values
                )
            }

            promise.then((res) => {
                $state.go('organization-funds', {
                    organization_id: $stateParams.organization_id
                });
            }, (res) => {
                form.errors = res.data.errors;
                form.unlock();
            });
        });

        if ($ctrl.fund && $ctrl.fund.logo) {
            MediaService.read($ctrl.fund.logo.uid).then((res) => {
                $ctrl.media = res.data.data;
            });
        }

        RecordTypeService.list().then(res => {
            $ctrl.recordTypes = res.data;
        });
    };

    $ctrl.selectPhoto = (file) => {
        mediaFile = file;
    };

    $ctrl.cancel = function() {
        $state.go('organization-funds', {
            'organization_id': $stateParams.organization_id
        });
    };
};

module.exports = {
    bindings: {
        fund: '<',
        organization: '<',
        fundStates: '<',
        productCategories: '<'
    },
    controller: [
        '$state',
        '$stateParams',
        '$rootScope',
        'FundService',
        'RecordTypeService',
        'FormBuilderService',
        'MediaService',
        FundsEditComponent
    ],
    templateUrl: 'assets/tpl/pages/funds-edit.html'
};