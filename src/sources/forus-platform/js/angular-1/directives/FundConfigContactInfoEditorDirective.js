const FundConfigContactInfoEditorDirective = ($scope, FundService, FormBuilderService, PushNotificationsService) => {
    const $dir = $scope.$dir;

    $dir.$onInit = () => {
        $dir.form = FormBuilderService.build($dir.fund, (form) => {
            const { email_required, contact_info_enabled } = form.values;
            const { contact_info_required, contact_info_message_custom } = form.values;
            const { contact_info_message_text } = form.values;

            const data = {
                email_required, contact_info_enabled,
                contact_info_required, contact_info_message_custom,
                contact_info_message_text,
            };

            FundService.update($dir.fund.organization_id, $dir.fund.id, data).then((res) => {
                PushNotificationsService.success('Gelukt!', 'Het fonds is aangepast!');
            }, (error) => {
                console.error(error);
            });
        });
    };
};

module.exports = () => {
    return {
        scope: {
            fund: '=',
            inline: '=',
            disabled: '=',
        },
        bindToController: true,
        controllerAs: '$dir',
        restrict: "EA",
        replace: true,
        controller: [
            '$scope',
            'FundService',
            'FormBuilderService',
            'PushNotificationsService',
            FundConfigContactInfoEditorDirective,
        ],
        templateUrl: 'assets/tpl/directives/fund-config-contact-info-editor.html',
    };
};