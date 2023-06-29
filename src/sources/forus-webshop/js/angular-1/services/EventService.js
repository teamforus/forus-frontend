const ConfigService = function() {
    return new(function() {
        this.subscribe = (eventName, listener) => {
            document.addEventListener(eventName, listener);
        }

        this.unsubscribe = (eventName, listener) => {
            document.removeEventListener(eventName, listener);
        }

        this.publish = (eventName, data) => {
            const event = new CustomEvent(eventName, { detail: data });
            document.dispatchEvent(event);
        }
        
    });
};

module.exports = [ConfigService];