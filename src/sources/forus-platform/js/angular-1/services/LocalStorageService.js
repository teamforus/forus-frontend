const LocalStorageService = function () {
    return new (function () {
        const isPlainObject = (obj) => {
            return (typeof obj == 'object') && !Array.isArray(obj) && !!obj;
        };

        this.setCollectionItem = (collection_name, key, value) => {
            const collection = {
                ...this.getCollectionAll(collection_name),
                [key]: value,
            };

            localStorage.setItem(collection_name, JSON.stringify(collection));
        };

        this.getCollectionItem = (collection_name, key, _default = null) => {
            try {
                let collection = JSON.parse(localStorage.getItem(collection_name));

                if (!isPlainObject(collection)) {
                    collection = {};
                }

                return collection[key] || _default;
            } catch (e) {
                return _default;
            }
        };

        this.getCollectionAll = (collection_name) => {
            try {
                let collection = JSON.parse(localStorage.getItem(collection_name));

                if (!isPlainObject(collection)) {
                    collection = {};
                }

                return collection;
            } catch (e) {
                return {};
            }
        };

        this.setCollectionAll = (collection_name, values) => {
            if (!isPlainObject(values)) {
                values = {};
            }

            localStorage.setItem(collection_name, JSON.stringify(values));
        };

        this.resetCollection = (collection_name) => {
            localStorage.setItem(collection_name, JSON.stringify({}));
        };
    });
};

module.exports = [
    LocalStorageService,
];