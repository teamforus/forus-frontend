const ReimbursementService = function(ApiRequest) {
    return new (function() {
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

        this.getStates = () => {
            return [{
                value: null,
                name: 'Alle'
            }, {
                value: 'pending',
                name: 'Pending'
            }, {
                value: 'accepted',
                name: 'Accepted'
            }, {
                value: 'rejected',
                name: 'Rejected'
            }];
        };

        this.getExpiredOptions = () => {
            return [{
                value: null,
                name: 'Alle'
            }, {
                value: 1,
                name: 'Expired'
            }, {
                value: 0,
                name: 'Non expired'
            }];
        };
    });
};

module.exports = [
    'ApiRequest',
    ReimbursementService,
];
