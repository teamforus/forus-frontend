const sprintf = require('sprintf-js').sprintf;

const FundService = function ($q, $filter, ApiRequest, ModalService) {
    const uriPrefix = '/platform/organizations/';

    return new (function () {
        this.list = function (organization_id, query = {}) {
            if (!organization_id) {
                return this.listPublic(query);
            }

            return ApiRequest.get(uriPrefix + `${organization_id}/funds`, query);
        };

        this.listPublic = function (query = {}) {
            return ApiRequest.get('/platform/funds', query);
        };

        this.store = function (organization_id, data) {
            return ApiRequest.post(`${uriPrefix}${organization_id}/funds`, this.apiFormToResource(data));
        };

        this.update = function (organization_id, id, data) {
            return ApiRequest.patch(`${uriPrefix}${organization_id}/funds/${id}`, this.apiFormToResource(data));
        };

        this.updateCriteria = function (organization_id, id, criteria) {
            return ApiRequest.patch(`${uriPrefix}${organization_id}/funds/${id}/criteria`, { criteria });
        };

        this.backofficeUpdate = function (organization_id, id, data) {
            return ApiRequest.patch(`${uriPrefix}${organization_id}/funds/${id}/backoffice`, data);
        };

        this.backofficeTest = function (organization_id, id) {
            return ApiRequest.post(`${uriPrefix}${organization_id}/funds/${id}/backoffice-test`);
        };

        this.read = function (organization_id, fund_id, query = {}) {
            return ApiRequest.get(`${uriPrefix}${organization_id}/funds/${fund_id}`, query);
        };

        this.readPublic = function (fund_id, query = {}) {
            return ApiRequest.get(`/platform/funds/${fund_id}`, query);
        };

        this.readFinances = function (organization_id, query = {}) {
            return ApiRequest.get(`${uriPrefix}${organization_id}/sponsor/finances`, query);
        };

        this.listProviders = function (organization_id, fund_id, state, query = {}) {
            return ApiRequest.get(`${uriPrefix}${organization_id}/funds/${fund_id}/providers`, { ...query, state });
        };

        this.readProvider = function (organization_id, fund_id, provider_id, query = {}) {
            return ApiRequest.get(`${uriPrefix}${organization_id}/funds/${fund_id}/providers/${provider_id}`, query);
        };

        this.listProviderProducts = function (organization_id, fund_id, provider_id, query = {}) {
            return ApiRequest.get(`${uriPrefix}${organization_id}/funds/${fund_id}/providers/${provider_id}/products`, query);
        };

        this.getProviderProduct = function (organization_id, fund_id, provider_id, product_id, query = {}) {
            return ApiRequest.get(`${uriPrefix}${organization_id}/funds/${fund_id}/providers/${provider_id}/products/${product_id}`, query);
        };

        this.listIdentities = (organization_id, fund_id, data = {}) => {
            return ApiRequest.get(`${uriPrefix}${organization_id}/funds/${fund_id}/identities`, data);
        };

        this.exportIdentities = (organization_id, fund_id, data = {}) => {
            return ApiRequest.get(`${uriPrefix}${organization_id}/funds/${fund_id}/identities/export`, data);
        };

        this.exportIdentityFields = (organization_id, fund_id, data = {}) => {
            return ApiRequest.get(`${uriPrefix}${organization_id}/funds/${fund_id}/identities/export-fields`, data);
        };

        this.sendNotification = (organization_id, fund_id, data = {}) => {
            return ApiRequest.post(`${uriPrefix}${organization_id}/funds/${fund_id}/identities/notification`, data);
        };

        /**
         * Export funds data
         * 
         * @param {number} organization_id 
         * @param {number} fund_id 
         * @param {number} provider_id 
         * @param {object} query 
         * @returns {Promise}
         */
        this.financialOverview = function (organization_id, query = {}) {
            return ApiRequest.get(sprintf(
                uriPrefix + '%s/sponsor/finances-overview',
                organization_id
            ), query);
        };

        /**
         * Export funds data
         * 
         * @param {number} organization_id 
         * @param {number} fund_id 
         * @param {number} provider_id 
         * @param {object} query 
         * @returns {Promise}
         */
        this.financialOverviewExport = function (organization_id, query = {}) {
            return ApiRequest.get(sprintf(
                uriPrefix + '%s/sponsor/finances-overview-export',
                organization_id
            ), query, {}, true, (_cfg) => {
                _cfg.responseType = 'arraybuffer';
                _cfg.cache = false;

                return _cfg;
            });
        };
        this.updateProvider = function (organization_id, fund_id, id, data = {}) {
            return ApiRequest.patch(`${uriPrefix}${organization_id}/funds/${fund_id}/providers/${id}`, data);
        };

        this.states = function () {
            return [{
                name: "Waiting",
                value: 'waiting',
            }, {
                name: "Actief",
                value: 'active',
            }, {
                name: "Gepauzeerd",
                value: 'paused',
            }, {
                name: "Gesloten",
                value: 'closed',
            }];
        };

        this.makeTopUp = function (organization_id, fund_id) {
            return ApiRequest.post(`${uriPrefix}${organization_id}/funds/${fund_id}/top-up`);
        };

        this.apiFormToResource = function (formData) {
            const values = JSON.parse(JSON.stringify(formData));
            const { start_date, end_date } = values;

            return {
                ...values,
                ...(start_date ? { start_date: moment(start_date, 'DD-MM-YYYY').format('YYYY-MM-DD') } : {}),
                ...(end_date ? { end_date: moment(end_date, 'DD-MM-YYYY').format('YYYY-MM-DD') } : {}),
            };
        };

        this.apiResourceToForm = function (apiResource) {
            const { name, state, type, criteria, tags } = apiResource;
            const { faq, faq_title, formula_products } = apiResource;
            const { description, description_html, description_short } = apiResource;
            const { notification_amount, default_validator_employee_id, auto_requests_validation } = apiResource;
            const { request_btn_text, external_link_text, external_link_url, allow_direct_requests } = apiResource;

            const { email_required, contact_info_enabled } = apiResource;
            const { contact_info_required, contact_info_message_custom, contact_info_message_text } = apiResource;

            return {
                ...{ name, state, type, criteria },
                ...{ faq: faq || [], faq_title: faq_title || '', formula_products: formula_products || [] },
                ...{ description, description_html, description_short },
                ...{ notification_amount, default_validator_employee_id, auto_requests_validation },
                ...{ request_btn_text, external_link_text, external_link_url, allow_direct_requests },

                ...{ email_required, contact_info_enabled },
                ...{ contact_info_required, contact_info_message_custom, contact_info_message_text },

                start_date: moment(apiResource.start_date).format('DD-MM-YYYY'),
                end_date: moment(apiResource.end_date).format('DD-MM-YYYY'),
                application_method: this.getApplicationMethodKey(apiResource),
                tag_ids: Array.isArray(tags) ? tags.map((tag) => tag.id) : []
            };
        };

        this.changeState = function (apiResource, state) {
            return this.update(
                apiResource.organization_id,
                apiResource.id,
                { ...this.apiResourceToForm(apiResource), state }
            );
        };

        this.destroy = function (organization_id, fund_id) {
            return ApiRequest.delete(
                uriPrefix + organization_id + '/funds/' + fund_id
            );
        };

        this.archive = function (organization_id, fund_id) {
            return ApiRequest.post(`${uriPrefix}${organization_id}/funds/${fund_id}/archive`);
        };

        this.unarchive = function (organization_id, fund_id) {
            return ApiRequest.post(`${uriPrefix}${organization_id}/funds/${fund_id}/unarchive`);
        };

        this.sampleCSV = (fund) => {
            return Papa.unparse([
                fund.csv_required_keys.filter(key => key.indexOf('_eligible') == -1)
            ]);
        };

        this.criterionValidate = (organization_id, fund_id, criteria) => {
            const path = fund_id ? sprintf(
                uriPrefix + '%s/funds/%s/criteria/validate',
                organization_id,
                fund_id
            ) : sprintf(
                uriPrefix + '%s/funds/criteria/validate',
                organization_id
            );

            return fund_id ? ApiRequest.patch(path, { criteria }) : ApiRequest.post(path, { criteria });
        };

        this.faqValidate = (organization_id, faq) => {
            return ApiRequest.post(`${uriPrefix}${organization_id}/funds/faq/validate`, { faq });
        };

        this.getApplicationMethodKey = (fund) => {
            if (fund.allow_fund_requests) {
                return fund.allow_prevalidations ? 'all' : 'application_form';
            }

            return fund.allow_prevalidations ? 'activation_codes' : 'none';
        };

        this.stopActionConfirmationModal = (onConfirm) => {
            ModalService.open("dangerZone", {
                header: "Subsidie stoppen",
                title: "De publicatie van het aanbod wordt van de website verwijderd",
                description:
                    "Hierna kan er van dit aanbod geen gebruik meer worden gemaakt.\n" +
                    "De gebruikte tegoeden blijven bewaard. " +
                    "Wanneer u de subsidie opnieuw start, worden de gebruikte tegoeden verrekend met het nieuwe ingestelde limiet.",
                cancelButton: "Annuleer",
                confirmButton: "Stop subsidie",
                onConfirm,
            })
        };

        const configFundProviderUpdate = (state, $translate) => {
            return $q((resolve) => {
                ModalService.open("dangerZone", {
                    title: $translate(state + '.title'),
                    description: $translate(state + '.description'),
                    cancelButton: $translate(state + '.buttons.cancel'),
                    confirmButton: $translate(state + '.buttons.confirm'),
                    text_align: 'center',
                    onConfirm: () => resolve({ state }),
                });
            });
        };

        const confirmAcceptBudgetFundProvider = (fundProvider, $translate) => {
            const state = 'accepted';

            const fields = [{
                key: 'allow_budget',
                name: 'Allow budget',
                selected: fundProvider.state === 'pending' || fundProvider.allow_budget,
            }, {
                key: 'allow_products',
                name: 'Allow products',
                selected: fundProvider.state === 'pending' || fundProvider.allow_products,
            }];

            return $q((resolve) => {
                ModalService.open('exportDataSelect', {
                    title: $translate(state + '.title'),
                    description: $translate(state + '.description'),
                    fields: fields,
                    required: false,
                    sections: [{
                        type: "checkbox",
                        key: "fields",
                        fields,
                        fieldsPerRow: 2,
                        selectAll: false,
                        title: $translate(state + '.options')
                    }],
                    success: (data) => resolve({
                        state,
                        allow_budget: data.fields.includes('allow_budget'),
                        allow_products: data.fields.includes('allow_products'),
                    }),
                });
            });
        };

        this.confirmFundProviderStateUpdate = (fundProvider, state) => {
            const $translate = (key) => {
                return $filter('translate')(`modals.danger_zone.sponsor_provider_organization_state.${key}`);
            };

            if (state === 'rejected' || fundProvider.fund.type === "subsidies") {
                return configFundProviderUpdate(state, $translate);
            }

            return confirmAcceptBudgetFundProvider(fundProvider, $translate);
        };
    });
};

module.exports = [
    '$q',
    '$filter',
    'ApiRequest',
    'ModalService',
    FundService
];