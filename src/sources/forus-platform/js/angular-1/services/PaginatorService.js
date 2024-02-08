module.exports = [
    'LocalStorageService',
    function (
        LocalStorageService,
    ) {
        return new (function () {
            const collectionKey = 'pagination';
            const perPageOptions = [{
                key: 10,
                name: 10,
            }, {
                key: 25,
                name: 25,
            }, {
                key: 50,
                name: 50,
            }, {
                key: 100,
                name: 100,
            }];

            const validPerPage = (perPage) => {
                return perPage && perPageOptions.find((option) => option.key == perPage);
            };

            this.getPerPageOptions = () => {
                return perPageOptions;
            }

            const getPerPageValue = (storageKey) => {
                return LocalStorageService.getCollectionItem(collectionKey, `per_page_${storageKey}`);
            }

            const setPerPageValue = (storageKey, perPage) => {
                LocalStorageService.setCollectionItem(collectionKey, `per_page_${storageKey}`, perPage);
            }

            this.getPerPage = (storageKey, defaultPerPage = 10) => {
                return validPerPage(getPerPageValue(storageKey)) ? getPerPageValue(storageKey) : defaultPerPage;
            };

            this.setPerPage = (storageKey, perPage) => {
                if (validPerPage(perPage)) {
                    setPerPageValue(storageKey, perPage);
                }
            };

            this.syncPageFilters = (filters, storageKey) => {
                let value = this.getPerPage(storageKey);

                return { 
                    ...filters,
                    values: { ...filters.values, per_page: value },
                    defaultValues: { ...filters.defaultValues, per_page: value },
                };
            };
        });
    }
];