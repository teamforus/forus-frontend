let PrevalidationService = function(ApiRequest) {
    let uriPrefix = '/platform';

    return new(function() {
        this.submit = function(data, fund_id = null) {
            return ApiRequest.post(uriPrefix + '/prevalidations', {
                data: data,
                fund_id: fund_id
            });
        };

        this.submitCollection = function(data, fund_id = null, overwrite = []) {
            return ApiRequest.post(uriPrefix + '/prevalidations/collection', {
                data: data,
                fund_id: fund_id,
                overwrite: overwrite
            });
        };

        this.submitCollectionCheck = function(data, fund_id = null, overwrite = []) {
            return ApiRequest.post(uriPrefix + '/prevalidations/collection/hash', {
                data: data,
                fund_id: fund_id,
                overwrite: overwrite
            });
        };

        this.list = function(filters) {
            return ApiRequest.get(
                uriPrefix + '/prevalidations',
                this.transformFilters(filters)
            );
        }

        this.export = function(filters) {
            return ApiRequest.get(uriPrefix + '/prevalidations/export', this.transformFilters(
                filters
            ), {}, true, (_cfg) => {
                _cfg.responseType = 'arraybuffer';
                _cfg.cache = false;

                return _cfg;
            });
        };

        this.read = function(code) {
            return ApiRequest.get(uriPrefix + '/prevalidations/' + code);
        };

        this.destroy = function(code) {
            return ApiRequest.delete(uriPrefix + '/prevalidations/' + code);
        };

        this.transformFilters = function(filters) {
            let values = JSON.parse(JSON.stringify(filters));

            if (values.from) {
                values.from = moment(values.from, 'DD-MM-YYYY').format('YYYY-MM-DD');
            }

            if (values.to) {
                values.to = moment(values.to, 'DD-MM-YYYY').format('YYYY-MM-DD');
            }

            return values;
        };
    });
};

module.exports = [
    'ApiRequest',
    PrevalidationService
];