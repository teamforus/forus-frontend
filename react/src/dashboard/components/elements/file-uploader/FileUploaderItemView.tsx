import React, { Fragment, useCallback, useMemo } from 'react';
import { FileUploaderItem } from '../../../../webshop/components/elements/file-uploader/FileUploader';
import { isPdfExtension } from '../../../helpers/filePreview';
import useFileDownload from '../../../services/helpers/useFileDownload';
import useFilePreview from '../../../services/helpers/useFilePreview';

export default function FileUploaderItemView({
    item,
    hidePreviewButton,
    hideDownloadButton,
    readOnly,
    removeFile,
}: {
    item: FileUploaderItem;
    hidePreviewButton?: boolean;
    hideDownloadButton?: boolean;
    readOnly?: boolean;
    removeFile?: (file: FileUploaderItem) => void;
}) {
    const filePreview = useFilePreview();
    const fileDownload = useFileDownload();

    const name = useMemo(() => {
        return item.file?.name || item.file_data?.original_name || '';
    }, [item.file?.name, item.file_data?.original_name]);

    const showPreviewButton = item.has_preview && !hidePreviewButton;
    const showDownloadButton = !item.uploading && !hideDownloadButton;
    const showRemoveButton = !readOnly;
    const previewButtonTitle = isPdfExtension(item.file_data?.ext) ? 'Bekijk PDF-bestand' : 'Bekijk file';

    const previewFile = useCallback(
        (e: React.MouseEvent, file: Partial<FileUploaderItem>) => {
            e.preventDefault();
            e.stopPropagation();

            const fileData = file.file_data;

            if (!fileData) {
                return;
            }

            filePreview(fileData);
        },
        [filePreview],
    );

    const downloadFile = useCallback(
        (e: React.MouseEvent, fileData: FileUploaderItem['file_data']) => {
            e.preventDefault();
            e.stopPropagation();

            if (!fileData) {
                return;
            }

            fileDownload(fileData);
        },
        [fileDownload],
    );

    return (
        <Fragment>
            <div className="block block-attachments-list">
                <div className="attachment-item">
                    <div className="attachment-icon">
                        <div className="mdi mdi-file" />
                        <div className="attachment-size">{item.file_data?.size || ' - kB'}</div>
                    </div>
                    <div className="attachment-name">{name}</div>
                    <div className="attachment-date"></div>
                    <div className="attachment-actions">
                        {showDownloadButton && (
                            <button
                                type="button"
                                className="attachment-action"
                                title="Download"
                                aria-label="Download"
                                data-dusk="fileDownloadButton"
                                onClick={(e) => downloadFile(e, item.file_data)}>
                                <div className="mdi mdi-download" aria-hidden="true" />
                            </button>
                        )}

                        {showPreviewButton && (
                            <button
                                type="button"
                                className="attachment-action"
                                title={previewButtonTitle}
                                aria-label={previewButtonTitle}
                                data-dusk="filePreviewButton"
                                onClick={(e) => previewFile(e, item)}>
                                <div className="mdi mdi-eye" aria-hidden="true" />
                            </button>
                        )}

                        {showRemoveButton && (
                            <div className="file-item-action">
                                <button
                                    type="button"
                                    className="attachment-action"
                                    onClick={() => removeFile(item)}
                                    title="Remove file">
                                    <div className="mdi mdi-close" aria-hidden="true" />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="file-item-error">
                {item?.error?.map((error, index) => (
                    <div key={index} className="text-danger">
                        {error}
                    </div>
                ))}
            </div>
        </Fragment>
    );
}
