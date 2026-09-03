import React, { useCallback } from 'react';
import ModalPdfPreview from '../../components/modals/ModalPdfPreview';
import ModalImagePreview from '../../components/modals/ModalImagePreview';
import ModalFilePdfPreview from '../../components/modals/ModalFilePdfPreview';
import useOpenModal from '../../hooks/useOpenModal';
import File from '../../props/models/File';
import { useFileService } from '../FileService';
import usePushApiError from '../../hooks/usePushApiError';
import {
    canPreviewFile,
    isImageExtension,
    isPdfExtension,
    normalizeFileExtension,
    usesPdfPreviewPages,
} from '../../helpers/filePreview';

export default function useFilePreview() {
    const openModal = useOpenModal();
    const pushApiError = usePushApiError();

    const fileService = useFileService();

    return useCallback(
        (file: File) => {
            const extension = normalizeFileExtension(file?.ext);

            if (!canPreviewFile(file)) {
                return;
            }

            if (usesPdfPreviewPages(file)) {
                openModal((modal) => <ModalFilePdfPreview modal={modal} file={file} />);

                return;
            }

            if (isPdfExtension(extension)) {
                fileService
                    .downloadBlob(file)
                    .then((res) => {
                        openModal((modal) => <ModalPdfPreview modal={modal} rawPdfFile={res.data} />);
                    })
                    .catch(pushApiError);
            } else if (isImageExtension(extension)) {
                fileService
                    .downloadBlob(file)
                    .then((res) => {
                        const imageUrl = URL.createObjectURL(res.data);

                        openModal((modal) => <ModalImagePreview modal={modal} imageSrc={imageUrl} />, {
                            onClosed: () => URL.revokeObjectURL(imageUrl),
                        });
                    })
                    .catch(pushApiError);
            }
        },
        [fileService, openModal, pushApiError],
    );
}
