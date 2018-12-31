let BrowserService = function() {
    let idleInterval = false;

    return new(function() {
        this.detectInactivity = function(seconds) {
            return new Promise((resolve, reject) => {
                if (idleInterval != false) {
                    reject();
                }
                
                let idleTime;

                let resetIdleTime = function() {
                    idleTime = 0;
                    localStorage.setItem('lastAcivity', moment.now());
                }

                let timerIncrement = function(increment = 0) {
                    if ((idleTime += increment) > seconds) {
                        clearInterval(idleInterval);
                        resetIdleTime();

                        $(document).off('mousemove.activity');
                        $(document).off('keypress.activity');

                        idleInterval = false;
                        localStorage.removeItem('lastAcivity');

                        resolve();
                    }
                }

                idleTime = 0;
                idleInterval = setInterval(() => timerIncrement(1000), 1000);

                if (!isNaN(parseInt(localStorage.getItem('lastAcivity')))) {
                    idleTime = moment.now() - parseInt(
                        localStorage.getItem('lastAcivity')
                    );
                }
                
                $(document).on('mousemove.activity', (e) => resetIdleTime());
                $(document).on('keypress.activity', (e) => resetIdleTime());

                timerIncrement(0);
            });
        };
    });
};

module.exports = [
    BrowserService
];