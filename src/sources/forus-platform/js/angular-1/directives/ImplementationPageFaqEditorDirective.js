const uniq = require('lodash/uniq');

const ImplementationPageFaqEditorDirective = function(
    $q,
    $filter,
    $scope,
    ModalService,
    ImplementationPageService
) {
    const $dir = $scope.$dir = {};
    const $translate = $filter('translate');
    const $translateFaqEditor = (key) => $translate('components.fund_faq_editor.' + key);
    const $translateDangerZone = (key) => $translate('modals.danger_zone.remove_faq.' + key);

    $dir.collapsed = false;

    $dir.askConfirmation = (onConfirm) => {
        ModalService.open("dangerZone", {
            title: $translateDangerZone('title'),
            description: $translateDangerZone('description'),
            cancelButton: $translateDangerZone('buttons.cancel'),
            confirmButton: $translateDangerZone('buttons.confirm'),
            text_align: "center",
            onConfirm,
        });
    };

    $dir.addQuestion = () => {
        $dir.faq.push({
            title: '',
            description: '',
            collapsed: true,
            description_media_uid: [],
        });
    };

    $dir.removeQuestion = (questionIndex) => {
        $dir.askConfirmation(() => $dir.faq.splice(questionIndex, 1));
    };

    $dir.expendById = (index) => {
        const list = Array.isArray(index) ? index : [index];

        for (let i = 0; i < list.length; i++) {
            $dir.faq[list[i]].collapsed = true;
        }
    }

    $dir.validate = () => {
        return $q((resolve, reject) => {
            ImplementationPageService.validateFaq($scope.organization.id, $dir.implementation.id, $dir.faq).then(
                (res) => resolve(res.data),
                (res) => {
                    const { data, status } = res;
                    const { errors, message, } = data;

                    if (errors && typeof errors == 'object') {
                        $dir.errors = errors;

                        $dir.expendById(uniq(Object.keys($dir.errors).map((error) => {
                            return error.split('.')[1] || null;
                        })).filter((rowIndex) => !isNaN(parseInt(rowIndex))));
                    }

                    reject(status == 422 ? $translateFaqEditor('fix_validation_errors') : message);
                },
            );
        });
    };

    $dir.init = function() {
        $dir.faq = $scope.faq;
        $dir.implementation = $scope.implementation;
        $dir.organization = $scope.organization;

        $scope.registerParent({ childRef: $dir });
    };

    $dir.init();
};

module.exports = () => {
    return {
        scope: {
            faq: '=',
            implementation: '=',
            organization: '=',
            registerParent: '&',
        },
        restrict: "EA",
        replace: true,
        controller: [
            '$q',
            '$filter',
            '$scope',
            'ModalService',
            'ImplementationPageService',
            ImplementationPageFaqEditorDirective
        ],
        templateUrl: 'assets/tpl/directives/implementation-page-faq-editor.html'
    };
};