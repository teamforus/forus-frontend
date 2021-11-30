let SecuritySessionsComponent = function(
    $state,
    ModalService,
    SessionService,
) {
    let $ctrl = this;

    $ctrl.loaded = true;

    $ctrl.loadSessions = () => {
        SessionService.list({
            per_page: 100
        }).then(res => {
            $ctrl.sessions = res.data.data.map(session => {
                let device = session.last_request.device;

                if (!session.last_request.device_available) {
                    session.type_class = "shield-outline";
                } else if (device && device.device.type == 'desktop') {
                    if (device.device.manufacturer == 'Apple') {
                        session.type_class = 'desktop-mac';
                    } else {
                        session.type_class = 'monitor';
                    }
                } else if (device && device.device.type == 'mobile') {
                    if (device.device.manufacturer == 'Apple') {
                        session.type_class = 'cellphone-iphone';
                    } else {
                        session.type_class = 'cellphone-android';
                    }
                } else if (device && device.device.type == 'tablet') {
                    if (device.device.manufacturer == 'Apple') {
                        session.type_class = 'tablet-ipad';
                    } else {
                        session.type_class = 'tablet-android';
                    }
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
        $ctrl.loadSessions();
    };
}

module.exports = {
    controller: [
        '$state',
        'ModalService',
        'SessionService',
        SecuritySessionsComponent
    ],
    templateUrl: 'assets/tpl/pages/security/sessions.html'
};