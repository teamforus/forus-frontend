const sprintf = require('sprintf-js').sprintf;

let FundCriteriaEditorItemDirective = function(
    $q,
    $scope,
    $filter,
    FundService,
    ModalService
) {
    let $dir = $scope.$dir = {};
    let $translate = $filter('translate');
    let $currency_format = $filter('currency_format');
    let $translateDangerZone = (key) => $translate(
        'modals.danger_zone.remove_external_validators.' + key
    );

    let currency_types = [
        'net_worth', 'base_salary',
    ];

    $dir.operators = [{
        key: "=",
        name: "gelijk aan",
    }, {
        key: "<",
        name: "is kleiner dan",
    }, {
        key: ">",
        name: "is groter dan",
    }];

    $dir.operatorKeys = {};

    $dir.operators.forEach((operator) => {
        $dir.operatorKeys[operator.key] = operator.name;
    });

    $dir.makeTitle = (criterion) => {
        return criterion.is_new ? 'Nieuw criterium' : sprintf(
            "%s %s %s",
            criterion.record_type_name,
            $dir.operatorKeys[criterion.operator],
            currency_types.indexOf(
                criterion.record_type_key
            ) != -1 ? $currency_format(criterion.value) : criterion.value
        );
    };

    $dir.prepareCriteria = (criterion) => {
        criterion.header = $dir.makeTitle(criterion);

        criterion.validators_models = criterion.external_validators.map(validator => {
            return Object.assign({
                accepted: validator.accepted
            }, $scope.validatorOrganizations.filter(
                validatorModel => validatorModel.id == validator.organization_validator_id
            )[0]);
        });

        let validatorsModels = criterion.validators_models;
        let validatorsHalf = Math.ceil(validatorsModels.length / 2);

        criterion.use_external_validators = validatorsModels.length > 0;
        criterion.validators_list = [
            validatorsModels.slice(0, validatorsHalf),
            validatorsModels.slice(validatorsHalf, validatorsModels.length),
        ];

        criterion.new_validator = 0;
        criterion.validators_available = [{
            id: 0,
            validator_organization: {
                name: "Selecteer"
            },
        }].concat($scope.validatorOrganizations.filter(
            validatorOrganization => criterion.external_validators.map(external_validator => {
                return external_validator.organization_validator_id;
            }).indexOf(validatorOrganization.id) == -1
        ));
    };

    $dir.editDescription = (criterion) => {
        ModalService.open('fundCriteriaDescriptionEdit', {
            criterion: criterion,
            title: criterion.title,
            description: criterion.description,
            description_html: criterion.description_html,
            validateCriteria: $dir.validateCriteria,
            success: (data) => {
                criterion.description = data.description;
                criterion.description_html = data.description_html;
                criterion.title = data.title;
            }
        });
    };

    $dir.saveCriterion = (_criterion) => {
        return $q((resolve) => {
            let criterion = JSON.parse(JSON.stringify(_criterion));

            if (!criterion.is_editing) {
                return resolve(true);
            }

            criterion.is_editing = false;

            delete criterion.header;
            delete criterion.new_validator;
            delete criterion.validators_list;
            delete criterion.validators_models;
            delete criterion.validators_available;
            delete criterion.use_external_validators;
            delete criterion.show_external_validators_form;

            if (criterion.record_type_key) {
                let recordType = $dir.recordTypes.filter(
                    recordType => recordType.key == criterion.record_type_key
                )[0];

                if (recordType) {
                    criterion.record_type_name = recordType ? recordType.name : '';
                }
            }

            let validatorsField = criterion.external_validators.map(
                validator => validator.organization_validator_id
            );

            $dir.errors = {};

            $dir.validateCriteria(criterion).then(() => {
                criterion.is_new = false;
                criterion.validators = validatorsField;

                $scope.criterion = Object.assign($scope.criterion, criterion);

                $scope.onSave($scope.criterion);
                $dir.init();
                resolve(true);
            }, res => {
                $dir.errors = res.data.errors;
                resolve(false);
            });
        });
    };

    $dir.validateCriteria = (criterion) => {
        return FundService.criterionValidate($scope.organization.id, $scope.fund ? $scope.fund.id : null, [
            Object.assign(JSON.parse(JSON.stringify(criterion)), {
                validators: criterion.external_validators.map(
                    validator => validator.organization_validator_id
                )
            })
        ]);
    }

    $dir.cancelCriterion = (criterion) => {
        if ($scope.criterion.is_new) {
            $dir.removeCriterion();
        } else {
            $dir.criterionEditCancel(criterion);
        }
    };

    $dir.removeCriterion = () => {
        $scope.unregisterEditor({ childRef: $dir });
        $scope.onDelete($scope.criterion);
    };

    $dir.criterionEdit = (criterion) => {
        criterion.is_editing = true;
        $scope.criterion.is_editing = true;
        $scope.onEdit($scope.criterion);
    };

    $dir.criterionEditCancel = (criterion) => {
        criterion.is_editing = false;
        $scope.criterion.is_editing = false;
        $scope.onEditCancel($scope.criterion);
        $dir.init();
    };

    $dir.addExternalValidator = (criterion) => {
        criterion.show_external_validators_form = true;
    };

    $dir.cancelAddExternalValidator = (criterion) => {
        criterion.show_external_validators_form = false;
        criterion.new_validator = 0;
    };

    $dir.pushExternalValidator = (criterion) => {
        let organization_validator = criterion.validators_available.filter(
            validator => validator.id == criterion.new_validator
        )[0];

        criterion.external_validators.push({
            organization_validator_id: organization_validator.id,
            organization_id: organization_validator.validator_organization_id,
            accepted: false
        });

        criterion.external_validators.sort((a, b) => {
            if (a.organization_validator_id != b.organization_validator_id) {
                return a.organization_validator_id > b.organization_validator_id ? 1 : -1;
            } else {
                return 0;
            }
        });

        $dir.cancelAddExternalValidator(criterion);
        $dir.prepareCriteria(criterion);
    };


    $dir.removeExternalValidator = (criterion, validator_id) => {
        let validator = criterion.external_validators.filter(
            validator => validator.organization_validator_id == validator_id
        )[0];

        let validatorIndex = criterion.external_validators.indexOf(validator);
        let deleteValidator = () => {
            criterion.external_validators.splice(validatorIndex, 1);
            $dir.prepareCriteria($dir.criterion);
            criterion.use_external_validators = true;
        };

        if (validatorIndex != -1) {
            if (validator.accepted) {
                ModalService.open("dangerZone", {
                    title: $translateDangerZone('title'),
                    description: $translateDangerZone('description'),
                    cancelButton: $translateDangerZone('buttons.cancel'),
                    confirmButton: $translateDangerZone('buttons.confirm'),
                    onConfirm: () => deleteValidator()
                });
            } else {
                deleteValidator();
            }
        }
    };

    $scope.registerEditor({ childRef: $dir });

    $dir.init = function() {
        $dir.isEditable = $scope.isEditable;
        $dir.recordTypes = $scope.recordTypes;
        $dir.criterion = JSON.parse(JSON.stringify($scope.criterion));
        $dir.criterionBackup = JSON.parse(JSON.stringify($scope.criterion));

        $dir.prepareCriteria($dir.criterion);
    };

    $dir.init();
};

module.exports = () => {
    return {
        scope: {
            onEdit: '&',
            onEditCancel: '&',
            onSave: '&',
            onDelete: '&',
            showSaveButton: '=',
            fund: '=',
            organization: '=',
            isEditable: '=',
            criterion: '=',
            recordTypes: '=',
            onRemoveCriterion: '&',
            validatorOrganizations: '=',
            registerEditor: '&',
            unregisterEditor: '&',
        },
        restrict: "EA",
        replace: true,
        controller: [
            '$q',
            '$scope',
            '$filter',
            'FundService',
            'ModalService',
            FundCriteriaEditorItemDirective
        ],
        templateUrl: 'assets/tpl/directives/fund-criteria-editor-item.html'
    };
};