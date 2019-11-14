let PushNotificationsService = function() {
    return new (function() {
        this.push = (type, message, icon = 'check', timeout = 4000) => {
            if (typeof pushNotifications != 'undefined') {
                pushNotifications.push(type, icon, message, timeout);
            } else {
                alert(message);
            }
        }
        
        this.success = (message, icon = 'check') => {
            this.push('success', message, icon);
        };

        this.danger = (message, icon = 'close') => {
            this.push('danger', message, icon);
        };
    });
};

module.exports = [
    PushNotificationsService
];