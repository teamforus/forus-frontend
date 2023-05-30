const ReimbursementService = function (ApiRequest) {
    return new (function () {
        this.index = (organization_id, query) => {
            return ApiRequest.get(`/platform/organizations/${organization_id}/reimbursements`, query);
        };

        this.show = (organization_id, id) => {
            return ApiRequest.get(`/platform/organizations/${organization_id}/reimbursements/${id}`);
        };

        this.assign = (organization_id, id, data = {}) => {
            return ApiRequest.post(`/platform/organizations/${organization_id}/reimbursements/${id}/assign`, data);
        };

        this.resign = (organization_id, id, data = {}) => {
            return ApiRequest.post(`/platform/organizations/${organization_id}/reimbursements/${id}/resign`, data);
        };

        this.approve = (organization_id, id, data = {}) => {
            return ApiRequest.post(`/platform/organizations/${organization_id}/reimbursements/${id}/approve`, data);
        };

        this.decline = (organization_id, id, data = {}) => {
            return ApiRequest.post(`/platform/organizations/${organization_id}/reimbursements/${id}/decline`, data);
        };

        this.notes = (organization_id, id, query) => {
            return ApiRequest.get(`/platform/organizations/${organization_id}/reimbursements/${id}/notes`, query);
        };

        this.noteDestroy = (organization_id, id, note_id) => {
            return ApiRequest.delete(`/platform/organizations/${organization_id}/reimbursements/${id}/notes/${note_id}`);
        };

        this.storeNote = (organization_id, id, data = {}) => {
            return ApiRequest.post(`/platform/organizations/${organization_id}/reimbursements/${id}/notes`, data);
        };

        this.export = (organization_id, filters = {}) => {
            const callback = (_cfg) => {
                _cfg.responseType = 'arraybuffer';
                _cfg.cache = false;

                return _cfg;
            };

            return ApiRequest.get(`/platform/organizations/${organization_id}/reimbursements/export`, filters, {}, true, callback);
        };

        this.exportFields = function(organization_id) {
            return ApiRequest.get(`/platform/organizations/${organization_id}/reimbursements/export-fields`);
        };

        this.getStateOptions = () => {
            return [{
                value: null,
                name: 'Alle',
            }, {
                value: 'pending',
                name: 'In afwachting',
            }, {
                value: 'approved',
                name: 'Geaccepteerd',
            }, {
                value: 'declined',
                name: 'Geweigerd',
            }];
        };

        this.getExpiredOptions = () => {
            return [{
                value: null,
                name: 'Alle',
            }, {
                value: 1,
                name: 'Verlopen',
            }, {
                value: 0,
                name: 'Niet verlopen',
            }];
        };

        this.getDeactivatedOptions = () => {
            return [{
                value: null,
                name: 'Alle',
            }, {
                value: 1,
                name: 'Voucher deactivated',
            }, {
                value: 0,
                name: 'Voucher not deactivated',
            }];
        };

        this.getArchivedOptions = () => {
            return [{
                value: 0,
                name: 'Actief',
            }, {
                value: 1,
                name: 'Archief',
            }];
        };
    });
};

module.exports = [
    'ApiRequest',
    ReimbursementService,
];
