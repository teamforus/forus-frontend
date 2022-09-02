const ProductBoardComponent = function(
    $scope,
    appConfigs,
    FormBuilderService,
    ProductBoardService,
    PushNotificationsService,
) {
    const $ctrl = this;

    $ctrl.urgencyOptions = [{
        value: null,
        name: "Selecteer",
    }, {
        value:  "low",
        name: "Laag",
    }, {
        value:  "medium",
        name: "Gemiddeld",
    }, {
        value:  "high",
        name: "Hoog",
    }];

    $ctrl.urgencyOptionsByKey = $ctrl.urgencyOptions.reduce((obj, option) => {
        return {...obj, [option.value]: option.name};
    }, {});

    $ctrl.previewAddedData = () => {
        $ctrl.state = 'confirmation';
    };

    $ctrl.initForm = () => {
        $ctrl.state = 'form';

        $ctrl.form = FormBuilderService.build({
            use_customer_email: false,
            customer_email: $ctrl.auth_user?.email || '',
            urgency: null,
        }, (form) => {
            ProductBoardService.store({...form.values, ...{
                customer_email: form.values.use_customer_email ? form.values.customer_email : null,
            }}).then(() => {
                $ctrl.state = 'success';
            }, (res) => {
                if (res.status == 429) {
                    PushNotificationsService.danger(res.data.meta.title, res.data.meta.message);
                }

                if (res.status != 422) {
                    return $ctrl.state = 'error';
                }

                $ctrl.state = 'form';
                form.errors = res.data.errors;
            });
        }, true);
    };
    
    $ctrl.onUserUpdated = (auth_user) => {
        $ctrl.auth_user = auth_user;

        if ($ctrl.auth_user) {
            $ctrl.initForm();
        }
    };

    $ctrl.$onInit = () => {
        $ctrl.appConfigs = appConfigs;

        $scope.$watch(() => $scope.$root.auth_user, (auth_user) => {
            $ctrl.onUserUpdated(auth_user);
        });
    };
}

module.exports = {
    controller: [
        '$scope',
        'appConfigs',
        'FormBuilderService',
        'ProductBoardService',
        'PushNotificationsService',
        ProductBoardComponent,
    ],
    templateUrl: 'assets/tpl/pages/productboard.html',
};