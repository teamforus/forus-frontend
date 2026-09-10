import React, { useCallback, useMemo } from 'react';
import { useFileService } from '../../../../dashboard/services/FileService';
import useAssetUrl from '../../../hooks/useAssetUrl';
import { ResponseError } from '../../../../dashboard/props/ApiResponses';
import useOpenModal from '../../../../dashboard/hooks/useOpenModal';
import ModalImagePreview from '../../modals/ModalImagePreview';
import ModalPdfPreview from '../../modals/ModalPdfPreview';
import ModalFilePdfPreview from '../../modals/ModalFilePdfPreview';
import { FileUploaderItem } from './FileUploader';
import useTranslate from '../../../../dashboard/hooks/useTranslate';
import classNames from 'classnames';
import {
    canPreviewFile,
    isImageExtension,
    isPdfExtension,
    usesPdfPreviewPages,
} from '../../../../dashboard/helpers/filePreview';

export default function FileUploaderItemView({
    item,
    template,
    hidePreviewButton,
    hideDownloadButton,
    readOnly,
    removeFile,
}: {
    item: FileUploaderItem;
    template?: 'default' | 'compact' | 'inline' | 'group';
    hidePreviewButton?: boolean;
    hideDownloadButton?: boolean;
    readOnly?: boolean;
    removeFile?: (file: FileUploaderItem) => void;
}) {
    const assetUrl = useAssetUrl();
    const openModal = useOpenModal();
    const translate = useTranslate();
    const fileService = useFileService();

    const name = useMemo(() => {
        return item.file?.name || item.file_data?.original_name || '';
    }, [item.file?.name, item.file_data?.original_name]);

    const extension = useMemo(() => {
        const lastDotIndex = name.lastIndexOf('.');
        return lastDotIndex === -1 ? '' : name.slice(lastDotIndex + 1).toLowerCase();
    }, [name]);

    const uploadProgress = useMemo(() => {
        const value = Number(item.progress);

        if (!Number.isFinite(value)) {
            return 0;
        }

        return Math.max(0, Math.min(100, Math.round(value)));
    }, [item.progress]);

    const visibleProgress = item.uploading ? Math.min(uploadProgress, 99) : uploadProgress;
    const showPreviewButton = item.has_preview && !hidePreviewButton;
    const showDownloadButton = !item.uploading && !hideDownloadButton && !usesPdfPreviewPages(item.file_data);
    const showRemoveButton = !readOnly;

    const previewFile = useCallback(
        (e: React.MouseEvent, file: Partial<FileUploaderItem>) => {
            e.preventDefault();
            e.stopPropagation();

            const fileData = file.file_data;

            if (!fileData || !canPreviewFile(fileData)) {
                return;
            }

            if (usesPdfPreviewPages(fileData)) {
                openModal((modal) => <ModalFilePdfPreview modal={modal} file={fileData} />);

                return;
            }

            if (isPdfExtension(fileData.ext)) {
                fileService
                    .downloadBlob(fileData)
                    .then((res) => {
                        openModal((modal) => <ModalPdfPreview modal={modal} rawPdfFile={res.data} />);
                    })
                    .catch((err: ResponseError) => console.error(err));
            } else if (isImageExtension(fileData.ext)) {
                fileService
                    .downloadBlob(fileData)
                    .then((res) => {
                        const imageUrl = URL.createObjectURL(res.data);

                        openModal((modal) => <ModalImagePreview modal={modal} imageSrc={imageUrl} />, {
                            onClosed: () => URL.revokeObjectURL(imageUrl),
                        });
                    })
                    .catch((err: ResponseError) => console.error(err));
            }
        },
        [fileService, openModal],
    );

    const downloadFile = useCallback(
        (e: React.MouseEvent, fileData: FileUploaderItem['file_data']) => {
            e.preventDefault();
            e.stopPropagation();

            if (!fileData) {
                return;
            }

            fileService
                .download(fileData)
                .then((res) => fileService.downloadFile(fileData.original_name, res.data, res.headers['content-type']))
                .catch((err: ResponseError) => console.error(err));
        },
        [fileService],
    );

    return (
        <div className={classNames('file-item', { 'file-item-uploading': item.uploading })}>
            <div
                className={classNames('file-item-container', {
                    'file-item-container-compact': template === 'compact',
                    'file-item-container-inline': template === 'inline',
                })}>
                <div className="file-item-icon">
                    <img src={extension ? assetUrl(`/assets/img/file-icon-${extension}.svg`) : undefined} alt="" />
                </div>
                <div className="file-item-name">{name}</div>
                <div className="file-item-progress">
                    <div className="file-item-progress-container">
                        <progress max="100" value={visibleProgress} />
                    </div>
                    {template === 'group' && <div className="file-item-progress-value">{visibleProgress}%</div>}
                </div>

                {showPreviewButton && (
                    <div className="file-item-action">
                        <button
                            className="mdi mdi-eye-outline"
                            onClick={(e) => previewFile(e, item)}
                            title={translate('global.file_item.view_file')}
                            data-dusk="filePreviewButton"
                            role="button"
                            tabIndex={0}
                            type="button"
                            name={translate('global.file_item.view_file')}
                        />
                    </div>
                )}

                {showDownloadButton && (
                    <div className="file-item-action">
                        <button
                            type={'button'}
                            className="mdi mdi-tray-arrow-down"
                            onClick={(e) => downloadFile(e, item.file_data)}
                            title={translate('global.file_item.download_file')}
                            data-dusk="fileDownloadButton"
                            role="button"
                            tabIndex={0}
                            name={translate('global.file_item.download_file')}></button>
                    </div>
                )}

                {showRemoveButton && (
                    <div className="file-item-action">
                        <button
                            type="button"
                            className="mdi mdi-close"
                            onClick={() => removeFile(item)}
                            title={translate('global.file_item.remove_file')}
                            role="button"
                            tabIndex={0}
                            name={translate('global.file_item.remove_file')}></button>
                    </div>
                )}
            </div>
            <div className="file-item-error">
                {item?.error?.map((error, index) => (
                    <div key={index} className="text-danger">
                        {error}
                    </div>
                ))}
            </div>
        </div>
    );
}
