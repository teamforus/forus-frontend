module.exports = {
    templateUrl: './assets/tpl/components/message-form.html',
    bindings: {},
    controller: ['$rootScope', 'MessageService', function($rootScope, MessageService) {
        var ctrl = this;

        ctrl.state = false;
        ctrl.stateValue = false;

        ctrl.form = {
            values: {},
            errors: {},
        };

        ctrl.submit = function() {
            let values = ctrl.form.values;

            ctrl.state = "pending";

            let processingNotification = pushNotifications.push(
                '', 'timer-sand', 'Processing...', 1000
            );

            MessageService.store(values).then((res) => {
                ctrl.state = "response";
                ctrl.stateValue = res.data;
                ctrl.form.errors = {};
                ctrl.form.values = {};

                $rootScope.$emit('message-stored', {
                    res: res,
                    values: values
                });

                let text = "";

                for (var prop in ctrl.stateValue) {
                    let value = ctrl.stateValue[prop];

                    text += ({
                        'db': 'Database',
                        'ipfs': 'IPFS',
                        'blockChain':
                            'Ethereum'
                    }[prop] + ' - ' + {
                        'true': 'Saved',
                        'false': 'Error',
                        'null': 'Not connected'
                    }[value] + "<br>").trim();

                }

                pushNotifications.push('', 'check', text, 2500);
            }, (res) => {
                processingNotification.delete();

                ctrl.state = false;
                ctrl.stateValue = false;
                ctrl.form.errors = res.data.errors;
            });
        }

        console.log(MessageService);
    }]
};