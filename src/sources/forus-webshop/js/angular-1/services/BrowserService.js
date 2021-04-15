let BrowserService = function() {
    let idleInterval = false;

    return new (function() {
        let idleTime;
        let keyEvent;
        let mouseEvent;
        let activityTimeout;

        const resetIdleTime = function() {
            idleTime = 0;
            activityTimeout = 0;
            localStorage.setItem('lastActivity', moment.now());
        };

        const updateActivityTimeout = () => {
            const lastActivityTimeout = activityTimeout;
            activityTimeout = moment.now();
            return lastActivityTimeout > 0 ? moment.now() - lastActivityTimeout : 0;
        }

        this.detectInactivity = function(seconds) {
            this.unsetInactivity();

            return new Promise((resolve, reject) => {
                if (idleInterval != false) {
                    return reject("Listener alreadty registered.");
                }

                this.addEventListeners();

                idleInterval = setInterval(() => {
                    if (!isNaN(parseInt(localStorage.getItem('lastActivity')))) {
                        idleTime = moment.now() - parseInt(localStorage.getItem('lastActivity'));
                    }

                    if ((idleTime += updateActivityTimeout()) > seconds) {
                        this.unsetInactivity();
                        resolve();
                    }
                }, 1000);
            });
        };

        this.addEventListeners = () => {
            keyEvent = document.addEventListener('keypress', resetIdleTime, { passive: true });
            mouseEvent = document.addEventListener('mousemove', resetIdleTime, { passive: true });
        };

        this.removeEventListeners = () => {
            document.removeEventListener('keypress', resetIdleTime, { passive: false });
            document.removeEventListener('mousemove', resetIdleTime, { passive: false });
        };

        this.unsetInactivity = function() {
            clearInterval(idleInterval);
            resetIdleTime();
            this.removeEventListeners();

            idleTime = 0;
            idleInterval = false;
            localStorage.removeItem('lastActivity');
            localStorage.removeItem('lastActivityTick');
        };
    });
};

module.exports = [
    BrowserService
];