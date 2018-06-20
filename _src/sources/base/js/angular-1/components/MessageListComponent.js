module.exports = {
    templateUrl: './assets/tpl/components/message-list.html', 
    bindings: {},
    controller: ['$rootScope', 'MessageService', function($rootScope, MessageService) {
        var ctrl = this;

        ctrl.messages = {};

        $rootScope.$on('message-stored', () => {
            ctrl.updateMessages();
        });

        ctrl.updateMessages = () => {
            MessageService.list().then((res) => {
                ctrl.messages = res.data;

                pushNotifications.push(
                    'success', 'check', 'Messages updated', 1000
                );
            }, console.error);
        };

        ctrl.updateMessages();
    }]
};