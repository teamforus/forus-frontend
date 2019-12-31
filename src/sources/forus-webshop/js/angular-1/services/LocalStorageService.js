let LocalStorageService = function() {
    return new (function() {
        let isPlainObject = (obj) => {
            return (typeof obj == 'object') && !Array.isArray(obj) && !!obj;
        };

        this.setCollectionItem = function(collection_name, key, value) {
            let collection = JSON.parse(localStorage.getItem(collection_name));

            if (!isPlainObject(collection)) {
                collection = {};
            }

            collection[key] = value;

            localStorage.setItem(collection_name, JSON.stringify(collection));
        };

        this.getCollectionItem = function(collection_name, key, _default = null) {
            let collection = JSON.parse(localStorage.getItem(collection_name));
            
            if (!isPlainObject(collection)) {
                collection = {};
            }

            return collection[key] || _default;
        };

        this.resetCollection = function(collection_name) {
            localStorage.setItem(collection_name, JSON.stringify({}));
        };
    });
};

module.exports = [
    LocalStorageService
];