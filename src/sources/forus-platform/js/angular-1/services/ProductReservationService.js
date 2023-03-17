const ProductReservationService = function (
    $filter,
    ApiRequest,
    ModalService
) {
    const uriPrefix = '/platform/organizations';
    const $currencyFormat = $filter('currency_format');

    return new (function () {
        this.list = function(organization_id, data) {
            return ApiRequest.get(`${uriPrefix}/${organization_id}/product-reservations`, data);
        }

        this.store = function(organization_id, data = {}) {
            return ApiRequest.post(`${uriPrefix}/${organization_id}/product-reservations`, { ...data });
        }

        this.storeBatch = function(organization_id, data = {}) {
            return ApiRequest.post(`${uriPrefix}/${organization_id}/product-reservations/batch`, { ...data });
        }

        this.read = function(organization_id, id) {
            return ApiRequest.get(`${uriPrefix}/${organization_id}/product-reservations/${id}`);
        }

        this.accept = function(organization_id, id, data = {}) {
            return ApiRequest.post(`${uriPrefix}/${organization_id}/product-reservations/${id}/accept`, data);
        }

        this.reject = function(organization_id, id, data = {}) {
            return ApiRequest.post(`${uriPrefix}/${organization_id}/product-reservations/${id}/reject`, data);
        }

        this.destroy = function(organization_id, id) {
            return ApiRequest._delete(`${uriPrefix}/${organization_id}/product-reservations/${id}`);
        }

        this.exportFields = function(organization_id) {
            return ApiRequest.get(`${uriPrefix}/${organization_id}/product-reservations/export-fields`);
        };

        this.export = (organization_id, data = {}) => {
            const callback = (_cfg) => {
                _cfg.responseType = 'arraybuffer';
                _cfg.cache = false;

                return _cfg;
            };

            return ApiRequest.get(`${uriPrefix}/${organization_id}/product-reservations/export`, data, {}, true, callback);
        };

        this.sampleCsvProductReservations = (product_id = '') => {
            const headers = ['number', 'product_id'];
            const values = ['000000000000', product_id];

            return Papa.unparse([headers, values]);
        };

        this.confirmApproval = (reservation, onConfirm) => {
            const transactionCancelExpireDate = moment().add(13, 'days').format('DD MMM, YYYY');

            ModalService.open("dangerZone", {
                description_title: "Weet u zeker dat u de reservering wilt accepteren?",
                description_text: [
                    "U staat op het punt om een reservering te accepteren voor het aanbod ",
                    reservation.product.name + " voor " + $currencyFormat(reservation.amount) + "\n",
                    `U kunt de transactie annuleren tot en met ${transactionCancelExpireDate}, daarna volgt de uitbetaling.`,
                ].join("\n"),
                text_align: 'center',
                cancelButton: "Annuleren",
                confirmButton: "Bevestigen",
                onConfirm,
            });
        };

        this.confirmRejection = (onConfirm) => {
            ModalService.open("dangerZone", {
                title: "Weet u zeker dat u de betaling wilt annuleren?",
                description_text: "Wanneer u de betaling annuleert wordt u niet meer uitbetaald.",
                cancelButton: "Annuleren",
                confirmButton: "Bevestigen",
                onConfirm,
            });
        };
    });
};

module.exports = [
    '$filter',
    'ApiRequest',
    'ModalService',
    ProductReservationService
];