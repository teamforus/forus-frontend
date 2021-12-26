let sprintf = require('sprintf-js').sprintf;
const PersonBSNService = function(ApiRequest) {

    return new(function() {
        this.read = (organization_id, bsn) => ApiRequest.get(sprintf(
            '/platform/organizations/%s/person-bsn/%s',
            organization_id,
            bsn
        ));
    });
};

module.exports = [
    'ApiRequest',
    PersonBSNService
];