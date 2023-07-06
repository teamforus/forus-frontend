const ModalPhotoCropperComponent = function (
    $q,
    $element,
    ImageConvertorService,
    PushNotificationsService,
) {
    const $ctrl = this;

    $ctrl.confirmed = false;
    $ctrl.targetFile = false;
    $ctrl.fileIndex = 0;
    $ctrl.loaded = false;

    $ctrl.pdfType = 'application/pdf';
    $ctrl.imageTypes = ['image/jpg', 'image/jpeg', 'image/png'];

    const fileIsImage = (file) => {
        return $ctrl.imageTypes.includes(file.type);
    }

    const fileIsPdf = (file) => {
        return file.type == $ctrl.pdfType;
    }

    $ctrl.prepareFile = (file) => {
        if (!fileIsImage(file)) {
            return $q((resolve) => resolve({ file, is_image: false, is_pdf: fileIsPdf(file) }));
        }

        return $q((resolve, reject) => ImageConvertorService.instance(file).then((convertor) => resolve({
            file,
            size: {
                w: Math.min(convertor.getImage().width, 2000),
                h: Math.min(convertor.getImage().height, 2000),
            },
            originalRatio: convertor.originalRatio(),
            originalPhoto: convertor.getImage().src,
            is_image: true,
            is_pdf: fileIsPdf(file),
        }), reject));
    };

    $ctrl.onImageLoadDone = (file) => {
        file.loaded = true;
        $ctrl.updateImageLoad();
    };

    $ctrl.onImageLoadBegin = (file) => {
        file.loaded = false;
        $ctrl.updateImageLoad();
    };

    $ctrl.updateImageLoad = () => {
        $ctrl.loaded = $ctrl.files.filter((file) => file.is_image && !file.loaded).length === 0;
    }

    $ctrl.rotate = (index, deg = 0) => {
        ImageConvertorService.instance($ctrl.files[index].file).then((res) => {
            const file = $ctrl.base64ToFile(
                res.rotate($ctrl.files[index].file.type, deg),
                $ctrl.files[index].file
            );

            this.prepareFile(file).then((value) => $ctrl.files[index] = value);
        })
    }

    $ctrl.base64ToFile = (base64Image, file) => {
        const blob = ImageConvertorService.dataURItoBlob(base64Image);

        blob.name = file.name;
        blob.lastModified = file.lastModified;
        blob.lastModifiedDate = file.lastModifiedDate;

        return new File([blob], file.name, { type: file.type });
    }

    $ctrl.convertPdfCanvasToPreview = (pdfCanvas) => {
        const canvasPreview = document.createElement('canvas');
        const contextPreview = canvasPreview.getContext('2d');
        const ratio = pdfCanvas.height / pdfCanvas.width;

        if (ratio >= 1) {
            canvasPreview.height = Math.min(pdfCanvas.height, 1000);
            canvasPreview.width = canvasPreview.height / ratio;
        } else {
            canvasPreview.width = Math.min(pdfCanvas.width, 1000);
            canvasPreview.height = canvasPreview.width * ratio;
        }

        const position = ImageConvertorService.cover(
            canvasPreview.width,
            canvasPreview.height,
            pdfCanvas.width,
            pdfCanvas.height
        );

        contextPreview.drawImage(
            pdfCanvas,
            position.offsetX,
            position.offsetY,
            position.width,
            position.height
        );

        return canvasPreview;
    }

    $ctrl.pdfToBlob = (rawPdfFile) => {
        const pdfjsLib = window['pdfjs-dist/build/pdf'];

        return $q((resolve) => {
            new Response(rawPdfFile).arrayBuffer().then((data) => {
                pdfjsLib.getDocument({ data }).promise.then((pdf) => {
                    pdf.getPage(1).then((page) => {
                        const viewport = page.getViewport({ scale: 1.5 });
                        const canvas = document.createElement('canvas');
                        const canvasContext = canvas.getContext('2d');

                        canvas.height = viewport.height;
                        canvas.width = viewport.width;

                        page.render({ canvasContext, viewport }).promise.then(() => {
                            $ctrl.convertPdfCanvasToPreview(canvas).toBlob((blob) => resolve(blob), 'image/jpeg');
                        });
                    });
                }, console.error);
            });
        });
    };

    $ctrl.makePreviews = (files) => {
        return $q.all(files.map((fileItem) => {
            if (fileItem.file.type === 'application/pdf') {
                return $ctrl.pdfToBlob(fileItem.file).then((blob) => ({
                    ...fileItem,
                    file_preview: new File([blob], "pdf_preview.jpg", { type: "image/jpeg" }),
                }));
            }

            return fileItem;
        }));
    }

    $ctrl.submit = () => {
        $ctrl.makePreviews($ctrl.files).then((files) => {
            $ctrl.onSubmit(files.map((fileItem) => {
                const { file_preview, cropped_photo, is_image } = fileItem;
                const file = is_image ? $ctrl.base64ToFile(cropped_photo, fileItem.file) : fileItem.file;

                return { file, file_preview };
            }));

            $ctrl.close();
        });
    };

    const appendFirst = (parentNode, childNode) => {
        if (parentNode.firstChild) {
            parentNode.insertBefore(childNode, parentNode.firstChild);
        } else {
            parentNode.appendChild(childNode);
        }
    };

    $ctrl.prevMedia = () => {
        $ctrl.fileIndex = ($ctrl.fileIndex <= 0 ? $ctrl.files.length : $ctrl.fileIndex) - 1;
    };

    $ctrl.nextMedia = () => {
        $ctrl.fileIndex = $ctrl.fileIndex >= $ctrl.files.length - 1 ? 0 : $ctrl.fileIndex + 1;
    };

    $ctrl.replaceFileAtIndex = (index) => {
        if ($ctrl.input && $ctrl.input.remove) {
            $ctrl.input.remove();
        }

        $ctrl.input = document.createElement('input');
        $ctrl.input.setAttribute("type", "file");
        $ctrl.input.setAttribute("accept", $ctrl.accept.join(','));
        $ctrl.input.setAttribute('hidden', '');
        $ctrl.input.addEventListener('change', (e) => {
            $ctrl.prepareFile(e.target.files[0]).then((file) => $ctrl.files[index] = file).then(
                () => {},
                () => PushNotificationsService.danger('Error!', 'Selected file is not a valid image.'),
            );
        });

        appendFirst($element[0], $ctrl.input);

        $ctrl.input.click();
    };

    $ctrl.$onInit = () => {
        const { accept, getFiles, makePreview, onSubmit } = $ctrl.modal.scope;

        $ctrl.input = false;
        $ctrl.accept = accept;
        $ctrl.onSubmit = onSubmit;
        $ctrl.makePreview = makePreview;

        const promises = getFiles().map((file) => $q((resolve) => {
            $ctrl.prepareFile(file).then(resolve, () => resolve(false));
        }));

        $q.all(promises).then((files) => {
            const validFiles = files.filter((file) => file !== false);
            const invalidFiles = files.filter((file) => file == false);

            $ctrl.files = validFiles;
            $ctrl.updateImageLoad();

            if (invalidFiles.length && validFiles.length) {
                return PushNotificationsService.danger('Error! Some of the selected files are not valid images and are skipped.');
            }

            if (invalidFiles.length && !validFiles.length) {
                PushNotificationsService.danger('Error! Uploaded file is not a valid image, please try another file.');
                $ctrl.close();
            }
        });
    };
};

module.exports = {
    bindings: {
        close: '=',
        modal: '=',
    },
    controller: [
        '$q',
        '$element',
        'ImageConvertorService',
        'PushNotificationsService',
        ModalPhotoCropperComponent,
    ],
    templateUrl: 'assets/tpl/modals/file-previews/modal-photo-cropper.html',
};