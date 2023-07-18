const sprintf = require('sprintf-js').sprintf;

const FundRequestValidatorService = function(ApiRequest, FileService, ModalService) {
    const uriPrefixAll = '/platform/organizations/%s/fund-requests';

    const FundRequestValidatorService = function() {
        this.indexAll = function(organization_id, data = {}) {
            return ApiRequest.get(sprintf(uriPrefixAll, organization_id), data);
        };

        this.exportAll = function(organization_id, filters = {}) {
            return ApiRequest.get(sprintf(
                uriPrefixAll + '/export', organization_id
            ), filters, {}, true, (_cfg) => {
                _cfg.responseType = 'arraybuffer';
                _cfg.cache = false;

                return _cfg;
            });
        };

        this.index = function(organization_id, data = {}) {
            return ApiRequest.get(
                sprintf(uriPrefixAll, organization_id),
                data
            );
        };

        this.read = function(organization_id, request_id) {
            return ApiRequest.get(
                sprintf(uriPrefixAll + '/%s', organization_id, request_id)
            );
        };

        this.assignBySupervisor = function(organization_id, request_id, values = {}) {
            return ApiRequest.patch(
                sprintf(uriPrefixAll + '/%s/assign-employee', organization_id, request_id),
                values
            );
        };

        this.requestResignAllEmployeesAsSupervisor = function(organization_id, request_id) {
            return ApiRequest.patch(
                sprintf(uriPrefixAll + '/%s/resign-employee', organization_id, request_id)
            );
        };

        this.assign = function(organization_id, request_id) {
            return ApiRequest.patch(
                sprintf(uriPrefixAll + '/%s/assign', organization_id, request_id)
            );
        };

        this.resign = function(organization_id, request_id) {
            return ApiRequest.patch(
                sprintf(uriPrefixAll + '/%s/resign', organization_id, request_id)
            );
        };

        this.approve = function(organization_id, request_id, values = {}) {
            return ApiRequest.patch(sprintf(
                uriPrefixAll + '/%s/approve',
                organization_id,
                request_id
            ), values);
        };

        this.decline = function(organization_id, request_id, note = '') {
            return ApiRequest.patch(sprintf(
                uriPrefixAll + '/%s/decline',
                organization_id,
                request_id
            ), { note });
        };

        this.disregard = function(organization_id, request_id, values = {}) {
            return ApiRequest.patch(sprintf(
                uriPrefixAll + '/%s/disregard',
                organization_id,
                request_id
            ), values);
        };

        this.disregardUndo = function(organization_id, request_id, note = '') {
            return ApiRequest.patch(sprintf(
                uriPrefixAll + '/%s/disregard-undo',
                organization_id,
                request_id
            ));
        };

        this.appendRecord = function(organization_id, request_id, values = {}) {
            return ApiRequest.post(sprintf(
                uriPrefixAll + '/%s/records',
                organization_id,
                request_id
            ), values);
        };

        this.approveRecord = function(organization_id, request_id, record_id) {
            return ApiRequest.patch(sprintf(
                uriPrefixAll + '/%s/records/%s/approve',
                organization_id,
                request_id,
                record_id
            ));
        };

        this.declineRecord = function(organization_id, request_id, record_id, note = '') {
            return ApiRequest.patch(sprintf(
                uriPrefixAll + '/%s/records/%s/decline',
                organization_id,
                request_id,
                record_id
            ), {
                note: note
            });
        };

        this.updateRecord = function(organization_id, request_id, record_id, data) {
            return ApiRequest.patch(sprintf(
                uriPrefixAll + '/%s/records/%s',
                organization_id,
                request_id,
                record_id
            ), data);
        };

        this.requestRecordClarification = function(organization_id, request_id, record_id, question) {
            return ApiRequest.post(sprintf(
                uriPrefixAll + '/%s/clarifications',
                organization_id,
                request_id
            ), {
                fund_request_record_id: record_id,
                question: question
            });
        };

        this.recordClarifications = function(organization_id, request_id, record_id) {
            return ApiRequest.get(sprintf(
                uriPrefixAll + '/%s/clarifications',
                organization_id,
                request_id
            ), {
                fund_request_record_id: record_id,
            });
        };

        this.getPersonBsn = function(organization_id, request_id, data) {
            return ApiRequest.get(sprintf(
                uriPrefixAll + '/%s/person',
                organization_id,
                request_id
            ), data);
        };

        this.notes = (organization_id, id, query) => {
            return ApiRequest.get(`/platform/organizations/${organization_id}/fund-requests/${id}/notes`, query);
        };

        this.noteDestroy = (organization_id, id, note_id) => {
            return ApiRequest.delete(`/platform/organizations/${organization_id}/fund-requests/${id}/notes/${note_id}`);
        };

        this.storeNote = (organization_id, id, data = {}) => {
            return ApiRequest.post(`/platform/organizations/${organization_id}/fund-requests/${id}/notes`, data);
        };

        this.downloadFile = (file) => {
            FileService.download(file).then(res => {
                FileService.downloadFile(file.original_name, res.data);
            }, console.error);
        };

        this.hasFilePreview = (file) => {
            return ['pdf', 'png', 'jpeg', 'jpg'].includes(file.ext);
        };

        this.previewFile = ($event, file) => {
            $event.originalEvent.preventDefault();
            $event.originalEvent.stopPropagation();
    
            if (file.ext == 'pdf') {
                FileService.download(file).then(res => {
                    ModalService.open('pdfPreview', { rawPdfFile: res.data });
                }, console.error);
            } else if (['png', 'jpeg', 'jpg'].includes(file.ext)) {
                ModalService.open('imagePreview', { imageSrc: file.url });
            }
        };
    };

    return new FundRequestValidatorService();
};

module.exports = [
    'ApiRequest',
    'FileService',
    'ModalService',
    FundRequestValidatorService
];