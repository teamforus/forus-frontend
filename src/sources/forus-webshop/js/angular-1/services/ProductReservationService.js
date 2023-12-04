const ProductReservationService = function ($filter, ApiRequest) {
    const uriPrefix = '/platform/product-reservations';

    return new (function () {
        this.list = function (data) {
            return ApiRequest.get(uriPrefix, data);
        }

        this.read = function (id) {
            return ApiRequest.get(`${uriPrefix}/${id}`);
        }

        this.validateFields = function (data) {
            return ApiRequest.post(uriPrefix + '/validate-fields', data);
        }

        this.validateAddress = function (data) {
            return ApiRequest.post(uriPrefix + '/validate-address', data);
        }

        this.reserve = function (data) {
            return ApiRequest.post(uriPrefix, data);
        }

        this.cancel = function (id, values = {}) {
            return ApiRequest.post(`${uriPrefix}/${id}/cancel`, values);
        }

        this.checkoutExtra = function (id) {
            return ApiRequest.post(`${uriPrefix}/${id}/extra-payment/checkout`);
        }

        this.composeStateAndExpires = (reservation) => {
            const $transState = (key) => $filter('translate')(`reservation.labels.status.${key}`);
            const stateClasses = { pending: 'warning', accepted: 'success', rejected: 'default', waiting: 'waiting' };

            const data = {
                expiresIn: Math.ceil(reservation.extra_payment_expires_in / 60),
            };

            if (reservation.expired) {
                data.stateText = $transState('expired');
                data.stateClass = 'danger';
                data.stateDusk = 'labelExpired';
            } else if (reservation.canceled) {
                data.stateText = $transState(reservation.state);
                data.stateClass = 'default';
                data.stateDusk = 'labelCanceled';
            } else {
                data.stateText = $transState(reservation.state);
                data.stateClass = stateClasses[reservation.state];
                data.stateDusk = 'label' + $filter('capitalize')(reservation.state);
            }

            return data;
        }
    });
};

module.exports = [
    '$filter',
    'ApiRequest',
    ProductReservationService,
];