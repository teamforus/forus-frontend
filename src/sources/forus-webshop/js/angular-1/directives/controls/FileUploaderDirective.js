const FileUploaderDirective = function (
    $q,
    $scope,
    $element,
    FileService,
    ModalService,
    PushNotificationsService,
) {
    const $dir = $scope.$dir;

    const eventInfo = (file = null) => {
        return { file, ...{ files: $dir.files } };
    };

    const filterValidFiles = (files) => {
        return files.filter(file => {
            return $dir.acceptedFiles().indexOf('.' + file.name.split('.')[file.name.split('.').length - 1]) != -1;
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

        const data = [
            ['type', $dir.type],
            ['file', item.file],
        ].concat(item.file_preview ? [['file_preview', item.file_preview]] : []);

        FileService.storeData(data, (e) => item.progress = e.progress, item).then(
            (res) => {
                item.uploaded = true;
                item.file_data = res.data.data;
                item.has_preview = ['pdf', 'png', 'jpeg', 'jpg'].includes(item.file_data.ext);

                if (typeof $dir.onFileUploaded === 'function') {
                    $dir.onFileUploaded(eventInfo(item));
                }
            },
            (res) => {
                if (res.data && res.data.errors) {
                    item.error = res.data.errors.file || res.data.errors.type;
                } else {
                    item.error = res.data ? [res.data.message] : [];
                }

                if (typeof $dir.onFileError === 'function') {
                    $dir.onFileError(eventInfo(item));
                }
            },
        ).finally(() => {
            item.cancel = null;
            item.uploading = false;

            if (typeof $dir.onFileResolved === 'function') {
                $dir.onFileResolved(eventInfo(item));
            }
        });

        if ($dir.onFileQueued) {
            $dir.onFileQueued(eventInfo(item));
        }

        return item;
    }

    $dir.selectFile = (e) => {
        e && e.preventDefault() && e.stopPropagation();

        if ($dir.input && $dir.input.remove) {
            $dir.input.remove();
        }

        $dir.input = document.createElement('input');
        $dir.input.setAttribute("type", "file");
        $dir.input.setAttribute("accept", $dir.acceptedFiles().join(','));
        $dir.input.setAttribute('hidden', '');
        $dir.input.addEventListener('change', (e) => $dir.addFiles(e.target.files));

        if ($dir.multiple) {
            $dir.input.setAttribute('multiple', '');
        }

        appendFirst($element[0], $dir.input);

        $dir.input.click();
    };

    $dir.removeFile = (file) => {
        if (typeof file.cancel === 'function') {
            file.cancel();
        }

        let index = $dir.files.indexOf(file);

        if (index != -1) {
            $dir.files.splice(index, 1);
        }

        if (typeof $dir.onFileRemoved === 'function') {
            $dir.onFileRemoved(eventInfo());
        }
    };

    $dir.previewFile = ($event, file) => {
        $event.preventDefault();
        $event.stopPropagation();

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

    $dir.prepareFilesForUpload = (files = []) => {
        return $q((resolve) => {
            if (!$dir.shouldCropMedia()) {
                return resolve(files.map((file) => uploadFile({ file: file, uploaded: false, progress: 0 })));
            }

            ModalService.open('photoCropper', {
                accept: $dir.acceptedFiles(),
                makePreview: $dir.makePreviews,
                getFiles: () => files,
                onSubmit: (files) => resolve(files.map((item) => uploadFile({
                    file: item.file,
                    file_preview: item.file_preview || null,
                    ...{ uploaded: false, progress: 0 },
                }))),
            });
        });
    };

    $dir.addFiles = (files) => {
        if ($dir.multipleSize) {
            const allowedSize = $dir.multipleSize - $dir.files.length;
            const submittedSize = files.length;

            if (allowedSize < submittedSize) {
                files = [...files].slice(0, allowedSize);

                PushNotificationsService.info(
                    'To many files selected',
                    `Files count limit exceeded, only first ${allowedSize} files added.`,
                );
            }
        }

        $dir.prepareFilesForUpload(filterValidFiles([...files])).then((files) => {
            $dir.files = [...$dir.files, ...files]

            if ($dir.onFileBatchQueued) {
                $dir.onFileBatchQueued(eventInfo(files));
            }
        });
    };

    $dir.restoreFiles = (files) => {
        return files.map((file) => {
            if (file.file) {
                return file;
            }

            return {
                file: { name: file.original_name },
                file_data: file,
                has_preview: ['pdf', 'png', 'jpeg', 'jpg'].includes(file.ext),
                uploaded: true,
            }
        });
    };

    $dir.acceptedFiles = () => {
        if (typeof $dir.accept === 'undefined') {
            return ['.xlsx', '.xls', '.docx', '.doc', '.pdf', '.png', '.jpg', '.jpeg']
        }

        return $dir.accept;
    }

    $dir.shouldCropMedia = () => {
        return typeof $dir.cropMedia === 'undefined' ? true : $dir.cropMedia;
    }

    $dir.$onInit = () => {
        const $dropArea = $element.find('.uploader-droparea');

        $dir.input = false;
        $dir.multiple = $dir.multiple || true;
        $dir.multipleSize = $dir.multipleSize || false;

        $dir.fileListCompact = $dir.fileListCompact != 'false';
        $dir.files = $dir.restoreFiles($dir.files || []);

        $dropArea.on('drag dragstart dragend dragover dragenter dragleave drop', function (e) {
            e.preventDefault();
            e.stopPropagation();
        });

        $dropArea.on('dragover dragenter', (e) => $dropArea.addClass('is-dragover'))
        $dropArea.on('dragleave dragend drop', () => $dropArea.removeClass('is-dragover'));
        $dropArea.on('drop', (e) => $dir.addFiles(e.originalEvent.dataTransfer.files));
    };
};

module.exports = () => {
    return {
        scope: {
            type: '@',
            files: '=',
            accept: '=',
            multiple: '@',
            multipleSize: '@',
            makePreviews: '@',
            readOnly: '=',
            cropMedia: '=',
            fileListCompact: '@',
            onFileError: '&',
            onFileQueued: '&',
            onFileRemoved: '&',
            onFileUploaded: '&',
            onFileResolved: '&',
            onFileBatchQueued: '&',
        },
        bindToController: true,
        controllerAs: '$dir',
        restrict: "EA",
        replace: true,
        controller: [
            '$q',
            '$scope',
            '$element',
            'FileService',
            'ModalService',
            'PushNotificationsService',
            FileUploaderDirective,
        ],
        templateUrl: 'assets/tpl/directives/controls/file-uploader.html',
    };
};