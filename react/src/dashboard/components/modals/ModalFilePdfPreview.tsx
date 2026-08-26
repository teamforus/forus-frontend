import React from 'react';
import { ModalState } from '../../modules/modals/context/ModalContext';
import File from '../../props/models/File';
import useTranslate from '../../hooks/useTranslate';
import classNames from 'classnames';
import useFilePdfPreviewArchive from '../../services/helpers/useFilePdfPreviewArchive';

export default function ModalFilePdfPreview({
    modal,
    className,
    file,
}: {
    modal: ModalState;
    className?: string;
    file: File;
}) {
    const translate = useTranslate();
    const { failed, loading, pages } = useFilePdfPreviewArchive(file);

    return (
        <div
            className={classNames('modal', 'modal-animated', modal.loading && 'modal-loading', className)}
            data-dusk="modalFilePdfPreview">
            <div className="modal-backdrop" onClick={modal.close} />

            <div className="modal-window">
                <a
                    className="mdi mdi-close modal-close"
                    data-dusk="modalFilePdfPreviewClose"
                    onClick={modal.close}
                    role="button"
                />
                <div className="modal-header">{translate('modals.modal_file_pdf_preview.title')}</div>
                <div className="modal-body">
                    <div className="modal-section modal-section-collapse">
                        <div className={classNames('block block-pdf-preview-pages', loading && 'loading')}>
                            {loading && (
                                <div className="pdf-preview-pages-loader" role="status">
                                    <em
                                        className="mdi mdi-loading mdi-spin pdf-preview-pages-loader-icon"
                                        aria-hidden="true"
                                    />
                                    <div className="pdf-preview-pages-loader-text">
                                        {translate('modals.modal_file_pdf_preview.loading')}
                                    </div>
                                </div>
                            )}

                            {!loading && (failed || pages.length === 0) && (
                                <div className="pdf-preview-pages-message">
                                    {translate('modals.modal_file_pdf_preview.unavailable')}
                                </div>
                            )}

                            {pages.map((page) => (
                                <img
                                    key={page.page}
                                    className="pdf-preview-pages-page"
                                    data-dusk="pdfPreviewPage"
                                    src={page.url}
                                    alt={translate('modals.modal_file_pdf_preview.page_alt', {
                                        page: page.page,
                                    })}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
