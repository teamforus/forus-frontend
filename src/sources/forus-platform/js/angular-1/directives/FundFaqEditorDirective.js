let FundFaqEditorDirective = function(
    $q,
    $filter,
    $scope,
    $timeout,
    ModalService,
    FundService
) {
    let $dir = $scope.$dir = {};
    let $translate = $filter('translate');
    let $translateDangerZone = (key) => $translate(
        'modals.danger_zone.remove_faq.' + key
    );

    $dir.is_editing = false;

    $dir.askConfirmation = (onConfirm) => {
        ModalService.open("dangerZone", {
            title: $translateDangerZone('title'),
            description: $translateDangerZone('description'),
            cancelButton: $translateDangerZone('buttons.cancel'),
            confirmButton: $translateDangerZone('buttons.confirm'),
            onConfirm: onConfirm
        });
    };

    $dir.addQuestion = () => {
        $dir.faq.push({
            is_new: true,
            is_editing: true,
            title: '',
            description: '',
            title_hint: 'Nieuwe vraag',
        });
    };

    $dir.removeQuestion = (questionIndex) => {
        $dir.askConfirmation(() => {
            $dir.faq.splice(questionIndex, 1);
        });
    };

    $dir.questionEdit = (question) => {
        question.is_editing = true;
    };

    $dir.questionEditCancel = (question) => {
        question.is_editing = false;
    };

    $dir.faqValidate = () => {
        return $q(resolve => {
            FundService.faqValidate($scope.organization.id, $dir.faq).then((res) => {
                resolve(res.data);
            }, res => { 
                $dir.errors = res.data.errors;
            });
        });
    };

    $dir.getErrorField = function(fieldName, questionIndex) {
        if (!$dir.errors) {
            return;
        }

        return $dir.errors['faq.' + questionIndex + '.' + fieldName];
    }

    $dir.init = function() {
        $dir.fund = $scope.fund;
        $dir.faq  = $scope.faq;

        $dir.faq.map(question => { 
            question.title_hint = question.title;
            return question;  
        });

        $dir.organization = $scope.organization;

        $timeout(() => {
            $scope.registerParent({ childRef: $dir });
        }, 250);
    };

    $dir.init();
};

module.exports = () => {
    return {
        scope: {
            fund: '=',
            faq: '=',
            organization: '=',
            registerParent: '&',
        },
        restrict: "EA",
        replace: true,
        controller: [
            '$q',
            '$filter',
            '$scope',
            '$timeout',
            'ModalService',
            'FundService',
            FundFaqEditorDirective
        ],
        templateUrl: 'assets/tpl/directives/fund-faq-editor.html'
    };
};