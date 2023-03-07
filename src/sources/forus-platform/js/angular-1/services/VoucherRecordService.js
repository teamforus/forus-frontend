const VoucherRecordService = function(ApiRequest) {
    return new (function() {
        this.index = (organization_id, voucher_id, filters = {}) => {
            return ApiRequest.get(`/platform/organizations/${organization_id}/sponsor/vouchers/${voucher_id}/voucher-records`, filters);
        };

        this.store = (organization_id, voucher_id, data) => {
            return ApiRequest.post(`/platform/organizations/${organization_id}/sponsor/vouchers/${voucher_id}/voucher-records`, data);
        };

        this.show = (organization_id, voucher_id, id) => {
            return ApiRequest.get(`/platform/organizations/${organization_id}/sponsor/vouchers/${voucher_id}/voucher-records/${id}`);
        };

        this.update = (organization_id, voucher_id, id, data = {}) => {
            return ApiRequest.patch(`/platform/organizations/${organization_id}/sponsor/vouchers/${voucher_id}/voucher-records/${id}`, data);
        };

        this.destroy = (organization_id, voucher_id, id) => {
            return ApiRequest.delete(`/platform/organizations/${organization_id}/sponsor/vouchers/${voucher_id}/voucher-records/${id}`);
        };
    });
};

module.exports = [
    'ApiRequest',
    VoucherRecordService
];
