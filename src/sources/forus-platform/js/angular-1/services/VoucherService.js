const VoucherService = function(ApiRequest) {
    return new (function() {
        this.index = (organization_id, query) => {
            return ApiRequest.get([
                '/platform/organizations/' + organization_id,
                '/sponsor/vouchers'
            ].join(''), query);
        };

        this.readProvider = function(address) {
            return ApiRequest.get('/platform/provider/vouchers/' + address);
        };

        this.readProviderProducts = function(address, query = {}) {
            return ApiRequest.get('/platform/provider/vouchers/' + address + '/products', query);
        };

        this.store = (organization_id, data) => {
            return ApiRequest.post([
                '/platform/organizations/' + organization_id,
                '/sponsor/vouchers'
            ].join(''), data);
        };

        this.storeValidate = (organization_id, data) => {
            return ApiRequest.post([
                '/platform/organizations/' + organization_id,
                '/sponsor/vouchers/validate'
            ].join(''), data);
        };

        this.storeCollection = function(organization_id, fund_id, vouchers) {
            return ApiRequest.post(`/platform/organizations/${organization_id}/sponsor/vouchers/batch`, {
                fund_id: fund_id,
                vouchers: vouchers
            });
        };

        this.storeCollectionValidate = function(organization_id, fund_id, vouchers) {
            return ApiRequest.post(`/platform/organizations/${organization_id}/sponsor/vouchers/batch/validate`, {
                fund_id: fund_id,
                vouchers: vouchers
            });
        };

        this.show = (organization_id, voucher_id) => {
            return ApiRequest.get([
                '/platform/organizations/' + organization_id,
                '/sponsor/vouchers/' + voucher_id
            ].join(''));
        };

        this.update = (organization_id, voucher_id, query) => {
            return ApiRequest.patch(`/platform/organizations/${organization_id}/sponsor/vouchers/${voucher_id}`, query);
        };

        this.sendToEmail = (organization_id, voucher_id, email) => {
            return ApiRequest.post(`/platform/organizations/${organization_id}/sponsor/vouchers/${voucher_id}/send`, { email });
        };

        this.assign = (organization_id, voucher_id, data) => {
            return ApiRequest.patch(`/platform/organizations/${organization_id}/sponsor/vouchers/${voucher_id}/assign`, data);
        };

        this.activate = (organization_id, voucher_id, data) => {
            return ApiRequest.patch(`/platform/organizations/${organization_id}/sponsor/vouchers/${voucher_id}/activate`, data);
        };

        this.deactivate = (organization_id, voucher_id, data = {}) => {
            return ApiRequest.patch(`/platform/organizations/${organization_id}/sponsor/vouchers/${voucher_id}/deactivate`, data);
        };

        this.makeActivationCode = (organization_id, voucher_id, data = {}) => {
            return ApiRequest.patch(`/platform/organizations/${organization_id}/sponsor/vouchers/${voucher_id}/activation-code`, data);
        };

        this.export = function(organization_id, filters = {}) {
            return ApiRequest.get(`/platform/organizations/${organization_id}/sponsor/vouchers/export`, filters);
        };

        this.exportFields = function(organization_id, filters = {}) {
            return ApiRequest.get(`/platform/organizations/${organization_id}/sponsor/vouchers/export-fields`, filters);
        };

        this.makeSponsorTransaction = (organization_id, data = {}) => {
            return ApiRequest.post(`/platform/organizations/${organization_id}/sponsor/transactions`, data);
        };

        this.sampleCSVBudgetVoucher = (expires_at = "2020-02-20") => {
            const headers = ['amount', 'expires_at', 'note', 'email', 'activate', 'activation_code', 'client_uid'];
            const values = [10, expires_at, 'voorbeeld notitie', 'test@example.com', 0, 0, ''];

            return Papa.unparse([headers, values]);
        };

        this.sampleCSVSubsidiesVoucher = (expires_at = "2020-02-20") => {
            const headers = ['expires_at', 'note', 'email', 'activate', 'activation_code', 'client_uid'];
            const values = [expires_at, 'voorbeeld notitie', 'test@example.com', 0, 0, ''];

            return Papa.unparse([headers, values]);
        };

        this.sampleCSVProductVoucher = (product_id = null, expires_at = "2020-02-20") => {
            const headers = ['product_id', 'expires_at', 'note', 'email', 'activate', 'activation_code', 'client_uid'];
            const values = [product_id, expires_at, 'voorbeeld notitie', 'test@example.com', 0, 0, ''];

            return Papa.unparse([headers, values]);
        };

        this.getStates = () => {
            return [{
                value: null,
                name: 'Alle'
            }, {
                value: 'pending',
                name: 'Inactief'
            }, {
                value: 'active',
                name: 'Actief'
            }, {
                value: 'deactivated',
                name: 'Gedeactiveerd'
            }, {
                value: 'expired',
                name: 'Verlopen'
            }];
        };

        this.getTooltips = () => {
            return [{
                key: 'id',
                title: 'ID',
                description: [
                    'Het unieke ID-nummer van het tegoed binnen het Forus Platform. ',
                    'Dit nummer wordt automatisch gegenereed bij het aanmaken van het tegoed.',
                ].join(''),
            }, {
                key: 'nr',
                title: 'NR',
                description: [
                    'Een uniek nummer dat kan worden toegevoegd aan het tegoed tijdens het aanmaken. ',
                    'Kan worden gebruikt om een relatie te leggen met andere systemen.'
                ].join(''),
            }, {
                key: 'method',
                title: 'Methode',
                description: [
                    'Deze informatie wordt gebruikt om het tegoed te associeeren met een specifieke deelnemer. ',
                    'Mogelijkheden: BSN (alleen geautoriseerde organisaties), Activatiecode, E-mailadres of Niet toegewezen.',
                ].join(''),
            }, {
                key: 'created_by',
                title: 'Aangemaakt door',
                description: [
                    'Geeft aan welke soort gebruiker het tegoed heeft aangemaakt. ',
                    'Een tegoed kan worden aangemaakt door een deelnemer zelf of door een medewerker.',
                ].join(''),
            }, {
                key: 'amount',
                title: 'Bedrag',
                description: [
                    'Het totaal toegekende bedrag op dit tegoed. ',
                    'Dit bedrag bestaat uit het bedrag bij de eerste uitgifte plus eventuele extra latere toevoegingen.',
                ].join(''),
            }, {
                key: 'note',
                title: 'Notitie',
                description: 'De notitie die door de medewerker is gemaakt bij het aanmaken van het tegoed.',
            }, {
                key: 'created_date',
                title: 'Aangemaakt op',
                description: 'De tijd en datum waarop het tegoed is aangemaakt.',
            }, {
                key: 'expire_date',
                title: 'Geldig tot en met',
                description: [
                    'De laatste geldige gebruiksdatum. ',
                    'Hierna verloopt het tegoed en kan het niet meer worden gebruikt om transacties te verichten.',
                ].join(''),
            }, {
                key: 'in_use',
                title: 'In gebruik',
                description: [
                    'Geeft aan of het tegoed is gebruikt om een transactie te verichten. ',
                    'De mogelijke waarden zijn: "Nee" of "De datum van laatste transactie". ',
                    'Let op: De waarde wordt automatisch teruggezet naar \'Nee\' als de transactie is geannuleerd binnen de bedenktijd van 14 dagen.',
                ].join(''),
            }, {
                key: 'status',
                title: 'Status',
                description: [
                    'Geeft de huidige toestand van het tegoed aan. ',
                    'De specifieke betekenissen van elke status: ',
                    'Inactief: Het tegoed is aangemaakt maar nog niet toegewezen aan een specifieke deelnemer. ',
                    'Het tegoed heeft nog geen QR-code en kan nog geen transacties initiëren.', 
                    'Actief: Het tegoed is toegewezen aan een deelnemer en heeft een QR-code. ',
                    'Het kan nu worden gebruikt om transacties te initiëren. ',
                    'Gedeactiveerd: Het tegoed is wel toegewezen aan een deelnemer maar is niet meer bruikbaar voor transacties. ',
                    'Verlopen: Het tegoed is niet meer geldig na het bereiken van de einddatum en kan niet meer worden gebruikt voor transacties.',
                ].join(''),
            }];
        }
    });
};

module.exports = [
    'ApiRequest',
    VoucherService
];
