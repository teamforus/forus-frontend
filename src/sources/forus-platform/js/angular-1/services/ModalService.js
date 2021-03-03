let ModalService = function(ModalRoute, $timeout) {
    let defaultConfigs = {
        animated: true,
        max_load_time: 300,
    };

    let modals = {
        list: []
    };

    let listeners = {
        open: [],
        close: [],
        loaded: [],
    };

    let modalKeys = Object.keys(ModalRoute.modals());

    this.modalKeyExists = (key) => {
        return modalKeys.indexOf(key) !== -1;
    };

    this.open = (key, scope = {}, configs = {}) => {
        let _configs = {...defaultConfigs, ...configs};

        if (!this.modalKeyExists(key)) {
            throw new Error(`Unknown modal key "${key}".`);
        }

        $timeout(() => {
            let modal = {
                key: key,
                scope: scope,
                animated: _configs.animated,
                loaded: _configs.animated ? false : true,
                events: {
                    onClose: _configs.onClose,
                },
                setLoaded: function() {
                    if (!this.loaded) {
                        this.loaded = true;
                        listeners.loaded.forEach(subscriber => subscriber(modal));
                    }
                },
            };

            if (_configs.animated && _configs.max_load_time) {
                $timeout(() => modal.setLoaded(), _configs.max_load_time);
            }

            modals.list.push(modal);
            listeners.open.forEach(subscriber => subscriber(modal));
        }, 0);
    };

    this.close = (modal) => {
        if (modals.list.indexOf(modal) !== -1) {
            if (modal.animated) {
                modal.loaded = false;
            }

            $timeout(() => {
                listeners.close.forEach(subscriber => subscriber(modal));
                modals.list.splice(modals.list.indexOf(modal), 1);
            }, modal.animated ? 250 : 0);
        }
    };

    this.bindEvent = (event_type, modal) => {
        if (Object.keys(listeners).indexOf(event_type) == -1) {
            throw new Error(`Invalid modal event type "${key}".`);
        }

        listeners[event_type].push(modal);
    };

    this.unbindEvent = (event) => {
        Object.keys(listeners).forEach(event_type => {
            if (listeners[event_type].indexOf(event) != -1) {
                listeners[event_type].splice(listeners[event_type].indexOf(event), 1);
            }
        });
    };

    this.unbindAllEvent = (event_type) => {
        if (Object.keys(listeners).indexOf(event_type) == -1) {
            throw new Error(`Invalid modal event type "${key}".`);
        }

        listeners[event_type].forEach(event => {
            this.unbindEvent(event);
        });
    };

    this.getModals = () => {
        return modals.list;
    };
};

module.exports = ['ModalRoute', '$timeout', function(ModalRoute, $timeout) {
    return new ModalService(ModalRoute, $timeout);
}];