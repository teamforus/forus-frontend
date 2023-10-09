const SecuritySessionsComponent = function (
    $state,
    ModalService,
    SessionService,
) {
    const $ctrl = this;

    $ctrl.loadSessions = () => {
        SessionService.list({ per_page: 100 }).then(res => {
            $ctrl.sessions = res.data.data.map(session => {
                let device = session.last_request.device;

                if (!session.last_request.device_available) {
                    session.type_class = "shield-outline";
                } else if (device && device.device.type == 'desktop') {
                    session.type_class = 'monitor';
                } else if (device && device.device.type == 'mobile') {
                    session.type_class = 'cellphone';
                } else if (device && device.device.type == 'tablet') {
                    session.type_class = 'tablet';
                } else {
                    session.type_class = 'help-rhombus';
                }

                return session;
            });
        });

    };

    $ctrl.terminateSession = (session) => {
        ModalService.open('modalNotification', {
            type: 'confirm',
            title: 'Beëindig sessie',
            description: 'De sessie beëindigen kan er voor zorgen dat u uitgelogd raakt, wilt u doorgaan?',
            modalClass: "modal-md",
            confirm: () => SessionService.terminate(session.uid).then(
                () => $ctrl.loadSessions(),
                () => $state.reload()
            ),
        });
    };

    $ctrl.terminateAllSessions = () => {
        ModalService.open('modalNotification', {
            type: 'confirm',
            title: 'Beëindig alle sessies',
            description: 'U wordt nu uitgelogd op alle apparaten, wilt u doorgaan?',
            modalClass: "modal-md",
            confirm: () => SessionService.terminateAll().then(
                () => $ctrl.loadSessions(),
                () => $state.reload()
            ),
        });
    };

    $ctrl.$onInit = () => {
        if (!$ctrl.auth2FAState?.restrictions?.sessions?.restricted) {
            $ctrl.loadSessions()
        }
    };
}

module.exports = {
    bindings: {
        auth2FAState: '<',
    },
    controller: [
        '$state',
        'ModalService',
        'SessionService',
        SecuritySessionsComponent,
    ],
    templateUrl: 'assets/tpl/pages/security/sessions.html',
};