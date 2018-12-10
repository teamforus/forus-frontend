class I18nLibProvider {
    constructor() {
        var i18nValues = {};

        this.setValues = function(values) {
            i18nValues = values;
        };

        this.$get = [
            '$translate',
            'appConfigs', (
                $translate,
                appConfigs
            ) => {
                let activeLang = $translate.use();

                return {
                    values: (values) => Object.assign({},
                        i18nValues[activeLang][appConfigs.client_key], values
                    )
                }
            }
        ];
    }
};

module.exports = function() {
    return new I18nLibProvider();
};