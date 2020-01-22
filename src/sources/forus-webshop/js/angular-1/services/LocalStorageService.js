let LocalStorageService = function() {
    return new (function() {
        let isPlainObject = (obj) => {
            return (typeof obj == 'object') && !Array.isArray(obj) && !!obj;
        };

        this.setCollectionItem = (collection_name, key, value) => {
            let collection = JSON.parse(localStorage.getItem(collection_name));

            if (!isPlainObject(collection)) {
                collection = {};
            }

            collection[key] = value;

            localStorage.setItem(collection_name, JSON.stringify(collection));
        };

        this.getCollectionItem = (collection_name, key, _default = null) => {
            let collection = JSON.parse(localStorage.getItem(collection_name));
            
            if (!isPlainObject(collection)) {
                collection = {};
            }

            return collection[key] || _default;
        };

        this.getCollectionAll = (collection_name) => {
            let collection = JSON.parse(localStorage.getItem(collection_name));
            
            if (!isPlainObject(collection)) {
                collection = {};
            }

            return collection;
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
    LocalStorageService
];