const uniqueId = require('lodash/uniqueId');

const FundCriteriaEditorItemDirective = function (
    $q,
    $scope,
    $filter,
    FundService,
    ModalService,
) {
    const $dir = $scope.$dir = {};
    const $translate = $filter('translate');
    const $currency_format = $filter('currency_format');

    const $translateDangerZone = (key) => {
        return $translate(`modals.danger_zone.remove_external_validators.${key}`);
    };

    $dir.makeTitle = (criterion) => {
        const type = $dir.recordTypes.find((item) => item.key === criterion?.record_type?.key);

        const currency_types = [
            'net_worth', 'base_salary', 'income_level',
        ];

        const valueName = (type?.type == 'select' || type?.type == 'bool') ?
            type?.options?.find((option) => option.value == criterion.value)?.name :
            criterion.value;

        const operatorKeys = $dir.recordType.operators?.reduce((obj, operator) => {
            return { ...obj, [operator.key]: operator.name };
        }, {}) || null;

        const isCurrency = currency_types.includes(criterion.record_type_key);

        return criterion.is_new ? 'Nieuw criterium' : [
            $dir.recordType?.name,
            criterion?.value ? operatorKeys[criterion?.operator] || '' : null,
            criterion?.value ? (isCurrency ? $currency_format(criterion.value || 0) : valueName) : null,
            criterion?.optional ? ' (optioneel)' : null,
        ].filter((item) => item).join(' ');
    };

    $dir.prepareCriteria = (criterion) => {
        criterion.header = $dir.makeTitle(criterion);

        criterion.validators_models = criterion.external_validators.map(validator => {
            return Object.assign({ accepted: validator.accepted }, $scope.validatorOrganizations.filter(
                validatorModel => validatorModel.id == validator.organization_validator_id
            )[0]);
        });

        const validatorsModels = criterion.validators_models;
        const validatorsHalf = Math.ceil(validatorsModels.length / 2);

        criterion.use_external_validators = validatorsModels.length > 0;
        criterion.validators_list = [
            validatorsModels.slice(0, validatorsHalf),
            validatorsModels.slice(validatorsHalf, validatorsModels.length),
        ];

        criterion.new_validator = 0;

        criterion.validators_available = [{
            id: 0, validator_organization: { name: "Selecteer" },
        }].concat($scope.validatorOrganizations.filter((validatorOrganization) => {
            return !criterion.external_validators
                .map(external => external.organization_validator_id)
                .includes(validatorOrganization.id)
        }));
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
            const criterion = JSON.parse(JSON.stringify(_criterion));

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

            const validatorsField = criterion.external_validators.map(
                validator => validator.organization_validator_id
            );

            $dir.errors = {};

            $dir.validateCriteria(criterion).then(() => {
                criterion.is_new = false;
                criterion.validators = validatorsField;
                criterion.record_type = { ...$dir.recordType };

                $scope.criterion = Object.assign($scope.criterion, criterion);
                $scope.onSave($scope.criterion);

                $dir.init();
                resolve(true);
            }, (res) => {
                $dir.errors = res.data.errors;
                resolve(false);
            });
        });
    };

    $dir.validateCriteria = (criterion) => {
        return FundService.criterionValidate($scope.organization.id, $scope.fund ? $scope.fund.id : null, [
            Object.assign(JSON.parse(JSON.stringify(criterion)), {
                validators: criterion.external_validators.map((validator) => {
                    return validator.organization_validator_id;
                }),
            }),
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
        const organization_validator = criterion.validators_available.find((validator) => {
            return validator.id == criterion.new_validator;
        });

        criterion.external_validators.push({
            accepted: false,
            organization_id: organization_validator.validator_organization_id,
            organization_validator_id: organization_validator.id,
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
        const validator = criterion.external_validators.filter(
            validator => validator.organization_validator_id == validator_id
        )[0];

        const validatorIndex = criterion.external_validators.indexOf(validator);
        const deleteValidator = () => {
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

    $dir.syncCriteria = () => {
        $dir.criterion.record_type_key = $dir.recordType?.key;
        $dir.criterion.value = $dir.values[$dir.recordType?.key];
        $dir.criterion.operator = $dir.operators[$dir.recordType?.key];

        $dir.criterion = {
            ...$dir.criterion,
            min: $dir.validations[$dir.recordType?.key]?.min?.toString() || null,
            max: $dir.validations[$dir.recordType?.key]?.max?.toString() || null,
        };

        $dir.prepareCriteria($dir.criterion);
    };

    $dir.criterionToValidations = (criterion, recordType) => {
        return recordType?.type !== 'date' ? {
            min: criterion.min ? parseInt(criterion.min) : null,
            max: criterion.max ? parseInt(criterion.max) : null,
        } : {
            min: criterion.min,
            max: criterion.max,
        };
    }

    $dir.init = function () {
        const { recordTypes } = $scope;

        $dir.blockId = uniqueId();
        $dir.isEditable = $scope.isEditable;
        $dir.criterion = JSON.parse(JSON.stringify($scope.criterion));
        $dir.criterionBackup = JSON.parse(JSON.stringify($scope.criterion));
        $dir.recordType = recordTypes.find((type) => type.key == $dir.criterion?.record_type?.key) || $dir.recordType || recordTypes[0];
        $dir.recordTypes = recordTypes;

        const { values, operators, validations } = $dir.recordTypes.reduce((list, recordType) => {
            if (!list.operators[recordType.key]) {
                list.operators[recordType.key] = recordType.operators?.length > 0 ? recordType.operators[0]?.key : '';
            }

            if (!list.values[recordType.key]) {
                list.values[recordType.key] = recordType.options?.length > 0 ? recordType.options[0]?.value : null;
            }

            if (!list.validations[recordType.key]) {
                list.validations[recordType.key] = {};
            }

            return list;
        }, {
            values: { [$dir.criterion.record_type_key]: $dir.criterion.value },
            operators: { [$dir.criterion.record_type_key]: $dir.criterion.operator },
            validations: { [$dir.criterion.record_type_key]: $dir.criterionToValidations($dir.criterion, $dir.recordType) },
        });

        $dir.values = values;
        $dir.operators = operators;
        $dir.validations = validations;

        $dir.prepareCriteria($dir.criterion);

        $scope.$watch('$dir.values', $dir.syncCriteria, true);
        $scope.$watch('$dir.operators', $dir.syncCriteria, true);
        $scope.$watch('$dir.recordType', $dir.syncCriteria, true);
        $scope.$watch('$dir.validations', $dir.syncCriteria, true);
        $scope.$watch('$dir.criterion.optional', $dir.syncCriteria, true);
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
            FundCriteriaEditorItemDirective,
        ],
        templateUrl: 'assets/tpl/directives/fund-criteria-editor-item.html',
    };
};