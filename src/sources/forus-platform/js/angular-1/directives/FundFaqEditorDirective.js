let FundFaqEditorDirective = function(
    $q,
    $scope,
) {
    let $dir = $scope.$dir = {};

    $dir.items = [];
    $dir.is_editing = false;

    $dir.addQuestion = () => {
        $scope.faq.push({
            is_new: true,
            is_editing: true,
            title: '',
            description: '',
            title_hint: 'New question',
        });
    };

    $dir.removeQuestion = (question) => {
        $scope.faq = $scope.faq.filter(_question => _question.id != question.id);
    };

    $dir.questionEdit = (question) => {
        question.is_editing = true;
    };

    $dir.questionEditCancel = (question) => {
        question.is_editing = false;
    };

    $dir.init = function() {
        $dir.fund = $scope.fund;
        $dir.faq = $scope.faq;

        $scope.faq.forEach(question => { 
            question.title_hint = question.title;
            return question;  
        });

        $dir.organization = $scope.organization;
    };

    $dir.init();
};

module.exports = () => {
    return {
        scope: {
            fund: '=',
            faq: '=',
            saveButton: '=',
            organization: '=',
            onSaveFaq: '&',
        },
        restrict: "EA",
        replace: true,
        controller: [
            '$q',
            '$scope',
            FundFaqEditorDirective
        ],
        templateUrl: 'assets/tpl/directives/fund-faq-editor.html'
    };
};