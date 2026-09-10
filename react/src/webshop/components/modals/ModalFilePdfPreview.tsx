import React from 'react';
import classNames from 'classnames';
import { ModalState } from '../../../dashboard/modules/modals/context/ModalContext';
import FileModel from '../../../dashboard/props/models/File';
import useTranslate from '../../../dashboard/hooks/useTranslate';
import useFilePdfPreviewArchive from '../../../dashboard/services/helpers/useFilePdfPreviewArchive';

export default function ModalFilePdfPreview({
    modal,
    className = '',
    file,
}: {
    modal: ModalState;
    className?: string;
    file: FileModel;
}) {
    const translate = useTranslate();
    const { failed, loading, pages } = useFilePdfPreviewArchive(file);

    return (
        <div
            className={classNames(
                'modal',
                'modal-animated',
                'modal-file-preview',
                className,
                !modal.loading && 'modal-loaded',
            )}
            data-dusk="modalFilePdfPreview">
            <div className="modal-backdrop" onClick={modal.close} aria-label={translate('pdf_preview.buttons.close')} />

            <div className="modal-window">
                <button
                    type="button"
                    className="mdi mdi-close modal-close"
                    data-dusk="modalFilePdfPreviewClose"
                    onClick={modal.close}
                    aria-label={translate('pdf_preview.buttons.close')}
                />
                <div className="modal-header">
                    <h2 className="modal-header-title">{translate('pdf_preview.header.title')}</h2>
                </div>
                <div className="modal-body">
                    <div className={classNames('block block-pdf-preview-pages', loading && 'loading')}>
                        {loading && (
                            <div className="pdf-preview-pages-loader" role="status">
                                <em
                                    className="mdi mdi-loading mdi-spin pdf-preview-pages-loader-icon"
                                    aria-hidden="true"
                                />
                                <div className="pdf-preview-pages-loader-text">{translate('pdf_preview.loading')}</div>
                            </div>
                        )}

                        {!loading && (failed || pages.length === 0) && (
                            <div className="pdf-preview-pages-message">{translate('pdf_preview.unavailable')}</div>
                        )}

                        {pages.map((page) => (
                            <img
                                className="pdf-preview-pages-page"
                                key={page.page}
                                data-dusk="pdfPreviewPage"
                                src={page.url}
                                alt={translate('pdf_preview.page_alt', { page: page.page })}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
