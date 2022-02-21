const FileUploaderDirective = function(
    $scope,
    $timeout,
    $element,
    FileService,
    ModalService
) {
    const $dir = $scope.$dir = {};
    let input = false;

    const $dropArea = $element.find('.uploader-droparea');
    const multiple = $scope.multiple ? $scope.multiple : true;
    const onFileError = $scope.onFileError || (() => { });
    const onFileQueued = $scope.onFileQueued || (() => { });
    const onFileRemoved = $scope.onFileRemoved || (() => { });
    const onFileUploaded = $scope.onFileUploaded || (() => { });
    const onFileResolved = $scope.onFileResolved || (() => { });
    const onFileBatchQueued = $scope.onFileBatchQueued || (() => { });

    const eventInfo = (file = null) => {
        return { file, ...{ files: $scope.files } };
    };

    const accept = $scope.accept || [
        '.xlsx', '.xls', '.docx', '.doc', '.pdf', '.png', '.jpg', '.jpeg'
    ];

    const filterValidFiles = (files) => {
        return files.filter(file => {
            return accept.indexOf('.' + file.name.split('.')[file.name.split('.').length - 1]) != -1;
        });
    };

    const appendFirst = (parentNode, childNode) => {
        if (parentNode.firstChild) {
            parentNode.insertBefore(childNode, parentNode.firstChild);
        } else {
            parentNode.appendChild(childNode);
        }
    };

    const uploadFile = (item) => {
        item.uploading = true;

        FileService.store(item.file, $scope.type, (e) => item.progress = e.progress, item).then(
            (res) => {
                item.uploaded = true;
                item.file_data = res.data.data;
                item.file_uid = res.data.data.uid;
                item.has_preview = ['pdf', 'png', 'jpeg', 'jpg'].includes(item.file_data.ext);
                onFileUploaded(eventInfo(item));
            },
            (res) => {
                if (res.data && res.data.errors) {
                    item.error = res.data.errors.file || res.data.errors.type;
                } else {
                    item.error = res.data ? [res.data.message] : [];
                }
                onFileError(eventInfo(item));
            },
        ).finally(() => {
            item.cancel = null;
            item.uploading = false;
            onFileResolved(eventInfo(item));
        });

        onFileQueued(eventInfo(item));

        return item;
    }

    $dir.selectFile = (e) => {
        e && e.preventDefault() && e.stopPropagation();


        if (input && input.remove) {
            input.remove();
        }

        input = document.createElement('input');
        input.setAttribute("type", "file");
        input.setAttribute("accept", accept.join(','));
        input.setAttribute('hidden', '');
        input.addEventListener('change', (e) => $scope.addFiles(e.target.files));

        if (multiple) {
            input.setAttribute('multiple', '');
        }

        appendFirst($element[0], input);

        input.click();
    };

    $dir.removeFile = (file) => {
        if (typeof file.cancel === 'function') {
            file.cancel();
        }

        let index = $scope.files.indexOf(file);

        if (index != -1) {
            $scope.files.splice(index, 1);
        }

        onFileRemoved(eventInfo());
    };

    $dir.previewFile = ($event, file) => {
        $event.preventDefault();
        $event.stopPropagation();e

        if (file.file_data.ext == 'pdf') {
            FileService.download(file.file_data).then(
                res => ModalService.open('pdfPreview', { rawPdfFile: res.data }),
                console.error
            );
        } else if (['png', 'jpeg', 'jpg'].includes(file.file_data.ext)) {
            ModalService.open('imagePreview', { imageSrc: file.file_data.url });
        }
    };

    $dir.downloadFile = ($event, file) => {
        $event.preventDefault();
        $event.stopPropagation();

        FileService.download(file.file_data).then(res => {
            FileService.downloadFile(file.file_data.original_name, res.data);
        }, console.error);
    };

    $scope.addFiles = (files) => {
        $timeout(() => $scope.files = [
            ...$scope.files,
            ...filterValidFiles([...files]).map((file) => uploadFile({
                file: file,
                uploaded: false,
                progress: 0,
            }))
        ], 0);

        onFileBatchQueued(eventInfo());
    };

    const onInit = () => {
        $dir.readOnly = $scope.readOnly || false;

        $dropArea.on('drag dragstart dragend dragover dragenter dragleave drop', function(e) {
            e.preventDefault();
            e.stopPropagation();
        });

        $dropArea.on('dragover dragenter', (e) => $dropArea.addClass('is-dragover'))
        $dropArea.on('dragleave dragend drop', () => $dropArea.removeClass('is-dragover'));
        $dropArea.on('drop', (e) => $scope.addFiles(e.originalEvent.dataTransfer.files));
    };

    onInit();
};

module.exports = () => {
    return {
        scope: {
            type: '@',
            files: '=',
            accept: '=',
            multiple: '@',
            readOnly: '=',
            onFileError: '&',
            onFileQueued: '&',
            onFileRemoved: '&',
            onFileUploaded: '&',
            onFileResolved: '&',
            onFileBatchQueued: '&',
        },
        restrict: "EA",
        replace: true,
        controller: [
            '$scope',
            '$timeout',
            '$element',
            'FileService',
            'ModalService',
            FileUploaderDirective
        ],
        templateUrl: 'assets/tpl/directives/controls/file-uploader.html'
    };
};