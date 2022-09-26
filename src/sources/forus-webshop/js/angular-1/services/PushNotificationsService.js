let PushNotificationsService = function () {
    let notifications = [];
    let listeners = [];

    let pushNotifications = (notification = {}) => {
        let note = Object.assign({
            type: '',
            title: '',
            message: '',
            icon: 'check',
            isBookmark: false,
            timeout: 4000,
        }, notification);

        notifications.push(note);
        listeners.forEach(listener => listener(note));
    };

    return new (function () {
        this.push = (note) => {
            pushNotifications(note);
        }

        this.success = (title, message, icon = 'check', other = {}) => {
            this.push(Object.assign(other, {
                icon: icon,
                title: title,
                message: message,
                type: 'success',
                group: 'default',
            }));
        };

        this.info = (title, message, icon = 'close', other = {}) => {
            this.push(Object.assign(other, {
                icon: icon,
                title: title,
                message: message,
                type: 'info',
                group: 'default',
            }));
        };

        this.danger = (title, message, icon = 'close', other = {}) => {
            this.push(Object.assign(other, {
                icon: icon,
                title: title,
                message: message,
                type: 'danger',
                group: 'default',
            }));
        };

        this.raw = (options = {}) => {
            this.push({ group: 'default', ...options });
        };

        this.onNotification = function (listener) {
            listeners.push(listener);
        };
    });
};

module.exports = [
    PushNotificationsService
];