const SecuritySessionsComponent = function (
    $state,
    SessionService,
) {
    const $ctrl = this;

    $ctrl.loaded = true;

    $ctrl.loadSessions = () => {
        SessionService.list({ per_page: 100 }).then(res => {
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
        SessionService.terminate(session.uid).then(res => {
            $ctrl.loadSessions();
        }, () => {
            $state.reload();
        });
    };

    $ctrl.terminateAllSessions = () => {
        SessionService.terminateAll().then(() => {
            $ctrl.loadSessions();
        }, () => {
            $state.reload();
        });
    };

    $ctrl.$onInit = () => {
        $ctrl.loadSessions();
    };
}

module.exports = {
    controller: [
        '$state',
        'SessionService',
        SecuritySessionsComponent
    ],
    templateUrl: 'assets/tpl/pages/security/sessions.html'
};