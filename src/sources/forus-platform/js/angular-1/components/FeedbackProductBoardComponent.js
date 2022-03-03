const FeedbackProductBoardComponent = function(
    $rootScope,
    $scope,
    FormBuilderService,
    FeedbackProductBoardService
) {
    let $ctrl = this;

    $ctrl.tags = [{
        key: null,
        name: "Selecteer",
    }, {
        key:  "low",
        name: "Laag",
    }, {
        key:  "medium",
        name: "Gemiddeld",
    }, {
        key:  "high",
        name: "Hoog",
    }];

    $ctrl.selectedTag = null;

    $ctrl.getSelectedTag = () => {
        return $ctrl.tags.filter(tag => tag.key == $ctrl.form.values.tags)[0];
    };

    const buildFeedbackForm = () => {
        $ctrl.form = FormBuilderService.build({
            email: $rootScope.auth_user.email,
            tags: $ctrl.tags[0].key
        }, (form) => {
            FeedbackProductBoardService.store({...form.values, ...{
                tags: form.values.tags ? [form.values.tags] : [],
            }}).then(() => {
                $ctrl.state = 'submit_success';
            }, () => {
                $ctrl.state = 'submit_failure';
            });
        }, true);
    };

    $ctrl.previewAddedData = () => {
        FeedbackProductBoardService.validate({...$ctrl.form.values, ...{
            tags: $ctrl.form.values.tags ? [$ctrl.form.values.tags] : [],
        }}).then(() => {
            $ctrl.form.errors = {};
            $ctrl.selectedTag = $ctrl.getSelectedTag();
            $ctrl.state = 'confirm_form_data';
        }, (res) => {
            $ctrl.form.unlock();
            $ctrl.form.errors = res.data.errors;
        });
    };

    $ctrl.startNewNote = () => {
        buildFeedbackForm();
        $ctrl.state = 'fill_data';
    };

    $ctrl.$onInit = () => {
        $ctrl.state = 'fill_data';

        $scope.$watch(() => $scope.$root.auth_user, (auth_user) => {
            if (auth_user) {
                buildFeedbackForm();
            }
        });
    };
}

module.exports = {
    controller: [
        '$rootScope',
        '$scope',
        'FormBuilderService',
        'FeedbackProductBoardService',
        FeedbackProductBoardComponent,
    ],
    templateUrl: 'assets/tpl/pages/feedback-productboard.html'
};