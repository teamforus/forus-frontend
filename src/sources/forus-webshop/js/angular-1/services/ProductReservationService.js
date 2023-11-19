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

        this.update = function (id, values = {}) {
            return ApiRequest.patch(`${uriPrefix}/${id}`, values);
        }

        this.payExtra = function (id) {
            return ApiRequest.get(`${uriPrefix}/${id}/extra-payment/create`);
        }

        this.composeStateAndExpires = (reservation) => {
            const $transState = (key) => $filter('translate')(`reservation.labels.status.${key}`);
            const stateClasses = { pending: 'warning', accepted: 'success', rejected: 'default', waiting: 'waiting' };

            let data = {};
            const expiresMinutes = reservation.extra_payment_expire_at
                ? moment().diff(moment(reservation.extra_payment_expire_at, 'YYYY-MM-DD HH:mm:ss'), 'minutes')
                : null;

            data.extraPaymentExpiresAfterMinutes = expiresMinutes !== null && expiresMinutes < 60 ? 60 - expiresMinutes : null;

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