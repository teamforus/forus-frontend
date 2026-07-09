import { useCallback } from 'react';
import File from '../../props/models/File';
import { useFileService } from '../FileService';
import useConfirmDangerAction from '../../hooks/useConfirmDangerAction';
import usePushApiError from '../../hooks/usePushApiError';
import useTranslate from '../../hooks/useTranslate';
import { hasPdfPreviewPages, usesPdfPreviewPages } from '../../helpers/filePreview';

export default function useFileDownload() {
    const translate = useTranslate();
    const pushApiError = usePushApiError();
    const confirmDangerAction = useConfirmDangerAction();

    const fileService = useFileService();

    return useCallback(
        (file: File) => {
            if (usesPdfPreviewPages(file)) {
                const downloadType = hasPdfPreviewPages(file) ? 'with_preview_pages' : 'without_preview_pages';

                confirmDangerAction(
                    translate(`modals.modal_file_pdf_archive.download.${downloadType}.title`),
                    translate(`modals.modal_file_pdf_archive.download.${downloadType}.description`),
                    translate('modals.modal_file_pdf_archive.download.buttons.confirm'),
                    translate('modals.modal_file_pdf_archive.download.buttons.cancel'),
                    translate(`modals.modal_file_pdf_archive.download.${downloadType}.confirmation`),
                ).then((confirmed) => {
                    if (!confirmed) {
                        return;
                    }

                    fileService
                        .downloadArchive(file)
                        .then((res) => {
                            fileService.downloadFile(`file-pdf-${file.uid}.zip`, res.data, res.headers['content-type']);
                        })
                        .catch(pushApiError);
                });

                return;
            }

            fileService
                .download(file)
                .then((res) => fileService.downloadFile(file.original_name, res.data, res.headers['content-type']))
                .catch(pushApiError);
        },
        [confirmDangerAction, fileService, pushApiError, translate],
    );
}
