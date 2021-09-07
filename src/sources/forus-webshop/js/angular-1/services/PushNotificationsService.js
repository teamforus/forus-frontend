let PushNotificationsService = function() {
    let notifications = [];
    let listeners = [];

    let pushNotifications = (notification = {}) => {
        let note = Object.assign({
            type: '',
            title: '',
            message: '',
            icon: 'check',
            timeout: 4000,
        }, notification);

        notifications.push(note);
        listeners.forEach(listener => listener(note));
    };

    return new (function() {
        this.push = (note) => {
            pushNotifications(note);
        }
        
        this.success = (title, message, icon = 'check', other = {}) => {
            this.push(Object.assign(other, {
                icon: icon,
                title: title,
                message: message,
                type: 'success',
            }));
        };

        this.info = (title, message, icon = 'close', other = {}) => {
            this.push(Object.assign(other, {
                icon: icon,
                title: title,
                message: message,
                type: 'info',
            }));
        };

        this.danger = (title, message, icon = 'close', other = {}) => {
            this.push(Object.assign(other, {
                icon: icon,
                title: title,
                message: message,
                type: 'danger',
            }));
        };

        this.onNotification = function(listener) {
            listeners.push(listener);
        };
    });
};

module.exports = [
    PushNotificationsService
];