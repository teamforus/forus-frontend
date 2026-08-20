import React from 'react';
import { ModalState } from '../../modules/modals/context/ModalContext';
import classNames from 'classnames';
import TableEmptyValue from '../elements/table-empty-value/TableEmptyValue';
import TableDateTime from '../elements/tables/elements/TableDateTime';
import FormGroup from '../elements/forms/elements/FormGroup';
import ProviderMessage from '../../props/models/ProviderMessage';

export default function ModalProviderMessageShow({
    modal,
    providerMessage,
    exportProviderMessage,
}: {
    modal: ModalState;
    providerMessage: ProviderMessage;
    exportProviderMessage: (providerMessage: ProviderMessage) => void;
}) {
    return (
        <div className={classNames('modal', 'modal-animated', 'modal-lg', modal.loading && 'modal-loading')}>
            <div className="modal-backdrop" onClick={modal.close} />

            <div className="modal-window">
                <div className="modal-header">
                    Berichtinformatie
                    <div className="modal-close mdi mdi-close" onClick={modal.close} role="button" />
                </div>
                <div className="modal-body form">
                    <div className="modal-section">
                        <div className="block block-email-log-preview">
                            <div className="form-group">
                                <div className="email-log-overview email-log-overview-two-columns">
                                    <div className="email-log-overview-col">
                                        <div className="email-log-label">Verstuurd op</div>
                                        <div className="email-log-value">
                                            <TableDateTime value={providerMessage.created_at_locale} />
                                        </div>
                                    </div>
                                    <div className="email-log-overview-col">
                                        <div className="email-log-label">Ontvanger</div>
                                        <div className="email-log-value">
                                            <div className={'text-primary text-semibold'}>
                                                {providerMessage.identity?.email || <TableEmptyValue />}
                                            </div>
                                            <div>
                                                <TableEmptyValue />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <FormGroup
                                label="Onderwerp"
                                input={() => (
                                    <div className={'form-control form-control-dashed'}>
                                        {providerMessage.type_locale}
                                    </div>
                                )}
                            />
                            <FormGroup
                                label="Bericht"
                                input={() => (
                                    <div className={'form-control form-control-dashed email-log-preview'}>
                                        {!modal.loading && (
                                            <iframe
                                                sandbox={'allow-same-origin'}
                                                srcDoc={providerMessage.message_html}
                                                onLoad={(e) => {
                                                    const iframeDoc = e.currentTarget.contentWindow.document;
                                                    const iframeDocHeight = iframeDoc.documentElement.scrollHeight;

                                                    iframeDoc.querySelectorAll('a').forEach((el) => {
                                                        el.onclick = (e) => {
                                                            e.preventDefault();
                                                            window
                                                                .open(el.href, '_blank', 'noopener,noreferrer')
                                                                ?.focus();
                                                        };
                                                    });

                                                    e.currentTarget.style.height = `${iframeDocHeight}px`;
                                                }}
                                            />
                                        )}
                                    </div>
                                )}
                            />
                        </div>
                    </div>
                </div>
                <div className="modal-footer">
                    <div className="button-group">
                        <div className="button button-default" data-dusk="closeModalButton" onClick={modal.close}>
                            Sluiten
                        </div>
                        <div
                            className="button button-primary"
                            onClick={() => {
                                modal.close();
                                exportProviderMessage(providerMessage);
                            }}>
                            Download als PDF
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
