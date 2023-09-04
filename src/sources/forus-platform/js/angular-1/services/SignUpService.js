const SignUpService = function(OrganizationService) {
    class ProgressStorage {
        constructor(namespace, storage = localStorage) {
            this.namespace = namespace;
            this.storage = storage ? storage : this.storage;
        }

        set(key, value) {
            this.storage.setItem(this.makeKey(key), value);
        }

        has(key) {
            return this.storage.hasOwnProperty(this.makeKey(key));
        }

        delete(key) {
            this.storage.removeItem(this.makeKey(key));
        }

        get(key, _default = null) {
            return this.has(key) ? this.storage.getItem(this.makeKey(key)) : _default;
        }

        clear() {
            for (const key in this.storage) {
                if (!this.storage.hasOwnProperty(key)) {
                    continue;
                }

                if (key.startsWith(this.namespace + '.')) {
                    this.storage.removeItem(key);
                }
            }
        }

        makeKey(key) {
            return this.namespace + '.' + key;
        }

        keys(key) {
            return this.namespace + '.' + key;
        }
    }

    return new(function() {
        this.makeProgressStorage = function(namespace) {
            return new ProgressStorage(namespace)
        };

        this.organizations = (query = {}) => {
            return OrganizationService.list(query);
        };

        this.organizationStore = (values) => {
            return OrganizationService.store(values);
        };
    });
};

module.exports = [
    'OrganizationService',
    SignUpService
];