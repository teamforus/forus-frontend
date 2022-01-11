let ModalFundProviderChatSponsorComponent = function(
    $interval,
    $element,
    $timeout,
    appConfigs,
    FormBuilderService,
    FundProviderChatService
) {
    let $ctrl = this;
    let updateInterval = 10000;
    
    let timeout;
    let interval;

    $ctrl.panelType = appConfigs.panel_type;

    $ctrl.loadMessages = (forceScroll, scrollSpeed) => {
        FundProviderChatService.listMessages(
            $ctrl.organization_id,
            $ctrl.fund_id,
            $ctrl.fund_provider_id,
            $ctrl.fund_provider_chat_id, {
                per_page: 100
            }
        ).then(res => {
            $ctrl.messages = res.data.data.reduce((messages, message) => {
                if (!messages.hasOwnProperty(message.date)) {
                    messages[message.date] = [message];
                } else {
                    messages[message.date].push(message);
                }

                return messages;
            }, {});

            timeout = $timeout(() => $ctrl.scrollTheChat(forceScroll, scrollSpeed), 50);
        }, console.error);
    };

    $ctrl.initForm = () => {
        $ctrl.form = FormBuilderService.build({
            message: '',
        }, (form) => {
            FundProviderChatService.storeMessage(
                $ctrl.organization_id,
                $ctrl.fund_id,
                $ctrl.fund_provider_id,
                $ctrl.fund_provider_chat_id,
                form.values
            ).then(() => {
                $ctrl.init();
            }, (res) => {
                form.errors = res.data.errors;
                form.unlock();
            });
        }, true);
    };

    $ctrl.scrollTheChat = (forceScroll, scrollSpeed) => {
        let $root = $element.find('#chat_root');
        let threshold = $root.find(
            '.chat-interval:last-child() .chat-message:last-child()'
        ).innerHeight() + 25;

        let fullHeight = $root.scrollTop() + $root.innerHeight();
        let autoScrollThreshold = $root[0].scrollHeight - threshold;

        if (forceScroll || (fullHeight >= autoScrollThreshold)) {
            $root.animate({
                scrollTop: $root[0].scrollHeight
            }, scrollSpeed);
        }
    };

    $ctrl.init = (scrollSpeed = 200) => {
        $ctrl.loadMessages(true, scrollSpeed);
        $ctrl.initForm();
    };

    $ctrl.$onInit = () => {
        $ctrl.fund_id = $ctrl.modal.scope.fund_id;
        $ctrl.fund_provider_id = $ctrl.modal.scope.fund_provider_id;
        $ctrl.organization_id = $ctrl.modal.scope.organization_id;
        $ctrl.fund_provider_chat_id = $ctrl.modal.scope.fund_provider_chat_id;
        $ctrl.organization_name = $ctrl.modal.scope.product.organization.name;

        interval = $interval(() => $ctrl.loadMessages(false, 200), updateInterval);

        $ctrl.init(0);
    };

    $ctrl.closeModal = () => {
        $ctrl.close();
    };

    $ctrl.$onDestroy = function() {
        $interval.cancel(interval);
        $timeout.cancel(timeout);
    };
};

module.exports = {
    bindings: {
        close: '=',
        modal: '='
    },
    controller: [
        '$interval',
        '$element',
        '$timeout',
        'appConfigs',
        'FormBuilderService',
        'FundProviderChatService',
        ModalFundProviderChatSponsorComponent
    ],
    templateUrl: () => {
        return 'assets/tpl/modals/fund-requests/modal-fund-provider-chat.html';
    }
};