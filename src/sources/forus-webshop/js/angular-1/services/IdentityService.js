let IdentityService = function(
    appConfigs,
    ApiRequest
) {
    return new(function() {
        this.identity = () => {
            return ApiRequest.get('/identity');
        };

        this.make = (values) => {
            return ApiRequest.post('/identity', values);
        };

        this.validateEmail = (values) => {
            return ApiRequest.post('/identity/validate/email', values);
        };

        this.deleteToken = () => {
            return ApiRequest.delete('/identity/proxy');
        };

        this.makeAuthToken = () => {
            return ApiRequest.post('/identity/proxy/token');
        };

        this.makeAuthPinCode = () => {
            return ApiRequest.post('/identity/proxy/code');
        };

        this.makeAuthEmailToken = (email, target = undefined) => {
            return ApiRequest.post('/identity/proxy/email', {
                source: appConfigs.client_key + '_' + appConfigs.client_type,
                email: email,
                target: target,
            });
        };

        this.checkAccessToken = (access_token) => {
            return ApiRequest.get(
                '/identity/proxy/check-token', null, {
                    'Access-Token': access_token
                }
            );
        };

        this.exchangeShortToken = (exchange_token) => {
            return ApiRequest.get('/identity/proxy/short-token/exchange/' + exchange_token);
        }

        
        this.authorizeAuthToken = (auth_token) => {
            return ApiRequest.post('/identity/proxy/authorize/token', {
                auth_token: auth_token
            });
        };

        this.authorizeAuthCode = (code) => {
            return ApiRequest.post('/identity/proxy/authorize/code', {
                auth_code: code
            });
        };

        this.authorizeAuthEmailToken = (email_token) => {
            return ApiRequest.get('/identity/proxy/email/exchange/' + email_token);
        };

        this.exchangeConfirmationToken = (exchangeToken) => {
            return ApiRequest.get('/identity/proxy/confirmation/exchange/' + exchangeToken);
        };
    });
};

module.exports = [
    'appConfigs',
    'ApiRequest',
    IdentityService
];