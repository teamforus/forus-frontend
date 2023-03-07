const ImplementationCmsPageEditComponent = function (
    $q,
    $state,
    FormBuilderService,
    ImplementationPageService,
    PushNotificationsService
) {
    const $ctrl = this;

    $ctrl.implementationBlocksEditor = null;
    $ctrl.faqEditor = null;

    $ctrl.types = [{
        value: false,
        name: 'Internal page',
    }, {
        value: true,
        name: 'External page',
    }];

    $ctrl.states = [{
        value: 'draft',
        name: 'Draft',
    }, {
        value: 'public',
        name: 'Public',
    }];

    $ctrl.descriptionPositions = [{
        value: 'replace',
        name: 'Overwrite default page content',
    }, {
        value: 'before',
        name: 'Show before default page content',
    }, {
        value: 'after',
        name: 'Show after default page content',
    }];

    $ctrl.registerImplementationBlocksEditor = function (childRef) {
        $ctrl.implementationBlocksEditor = childRef;
    };

    $ctrl.registerFaqEditor = function(childRef) {
        $ctrl.faqEditor = childRef;
    }

    $ctrl.validatePromise = (promise) => {
        return $q((resolve) => promise ? promise.then(() => resolve(true), (e) => {
            PushNotificationsService.danger('Error!', typeof e == 'string' ? e : e.message || '');
            resolve(false);
        }) : resolve(true));
    };

    $ctrl.validateEditors = () => {
        return $q.all([
            $ctrl.page_type_config.faq ? $ctrl.validatePromise($ctrl.faqEditor.validate()) : true,
            $ctrl.page_type_config.blocks ? $ctrl.validatePromise($ctrl.implementationBlocksEditor.validate()) : true,
        ]);
    };

    $ctrl.$onInit = () => {
        const { type } = $state.params;
        const { pages, page_types } = $ctrl.implementation;

        $ctrl.page_type = $ctrl.page?.page_type || type;
        $ctrl.page_type_config = page_types.find((page_type) => page_type.key === $ctrl.page_type);
        $ctrl.allow_external = $ctrl.page_type_config.type === 'extra';

        // Target page already exists
        if (!$ctrl.page && pages.find((page) => page.page_type === $ctrl.page_type)) {
            return $state.go('implementation-cms', $ctrl.implementation);
        }

        const data = $ctrl.page ? {
            ...$ctrl.page,
        } : {
            blocks: [],
            faq: [],
            state: $ctrl.states[0].value,
            external: $ctrl.types[0].value,
            page_type: $ctrl.page_type,
            description_position: $ctrl.descriptionPositions[0]?.value,
        };

        if (!$ctrl.page_type_config.blocks) {
            delete data.blocks;
        }

        $ctrl.form = FormBuilderService.build(data, (form) => {
            const submit = () => {
                const values = { ...form.values };

                const promise = $ctrl.page ? ImplementationPageService.update(
                    $ctrl.implementation.organization_id,
                    $ctrl.implementation.id,
                    $ctrl.page.id,
                    values
                ) : ImplementationPageService.store(
                    $ctrl.implementation.organization_id,
                    $ctrl.implementation.id,
                    values
                );

                promise.then((res) => {
                    PushNotificationsService.success('Opgeslagen!');

                    if (!$ctrl.page) {
                        return $state.go('implementation-cms-page', {
                            organization_id: $ctrl.implementation.organization_id,
                            implementation_id: $ctrl.implementation.id,
                            id: res.data.data.id,
                        });
                    }

                    $ctrl.page = res.data.data;
                    form.errors = {};
                }, (res) => {
                    form.errors = res.data.errors;
                    PushNotificationsService.danger('Error!', res.data.message);
                }).finally(() => form.unlock());
            };

            $ctrl.validateEditors().then((res) => {
                if (res.filter((success) => !success).length === 0) {
                    return submit();
                }

                form.unlock();
            }, () => {});
        }, true);
    };
};

module.exports = {
    bindings: {
        page: '<',
        organization: '<',
        implementation: '<',
    },
    controller: [
        '$q',
        '$state',
        'FormBuilderService',
        'ImplementationPageService',
        'PushNotificationsService',
        ImplementationCmsPageEditComponent,
    ],
    templateUrl: 'assets/tpl/pages/implementation-cms-page-edit.html',
};
