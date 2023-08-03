const uniq = require('lodash/uniq');

const FaqEditorDirective = function(
    $q,
    $scope,
    $filter,
    FaqService,
    ModalService,
) {
    const $dir = $scope.$dir = {};
    const $translate = $filter('translate');
    const $translateFaqEditor = (key) => $translate('components.faq_editor.' + key);
    const $translateDangerZone = (key) => $translate('modals.danger_zone.remove_faq.' + key);

    $dir.collapsed = false;
    
    $dir.sortable = {
        sort: true,
        animation: 150,
        handle: '.question-drag',
    };

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

    $dir.expandById = (index) => {
        const list = Array.isArray(index) ? index : [index];

        for (let i = 0; i < list.length; i++) {
            $dir.faq[list[i]].collapsed = true;
        }
    }

    $dir.validate = () => {
        return $q((resolve, reject) => {
            FaqService.faqValidate($scope.organization.id, $dir.faq).then(
                (res) => resolve(res.data),
                (res) => {
                    const { data, status } = res;
                    const { errors, message, } = data;

                    if (errors && typeof errors == 'object') {
                        $dir.errors = errors;

                        $dir.expandById(uniq(Object.keys($dir.errors).map((error) => {
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
        $dir.organization = $scope.organization;

        $scope.registerParent({ childRef: $dir });
    };

    $dir.init();
};

module.exports = () => {
    return {
        scope: {
            faq: '=',
            organization: '=',
            registerParent: '&',
        },
        restrict: "EA",
        replace: true,
        controller: [
            '$q',
            '$scope',
            '$filter',
            'FaqService',
            'ModalService',
            FaqEditorDirective
        ],
        templateUrl: 'assets/tpl/directives/faq-editor.html',
    };
};