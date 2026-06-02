import React, { ReactNode } from 'react';
import AppLinks from '../../../../elements/app-links/AppLinks';
import QrCode from '../../../../../../dashboard/components/elements/qr-code/QrCode';
import useAssetUrl from '../../../../../hooks/useAssetUrl';
import useTranslate from '../../../../../../dashboard/hooks/useTranslate';
import { clickOnKeyEnter } from '../../../../../../dashboard/helpers/wcag';
import { makeQrCodeContent } from '../../../../../../dashboard/helpers/utils';

export default function StartQrCode({
    title,
    qrValue,
    hasBackTarget,
    authInfo,
    onBack,
}: {
    title: string;
    qrValue: { type: 'auth_token'; value: string };
    hasBackTarget: boolean;
    authInfo: ReactNode;
    onBack: () => void;
}) {
    const assetUrl = useAssetUrl();
    const translate = useTranslate();

    return (
        <div className="block block-auth">
            <div className="auth-wrapper auth-wrapper-qr">
                <h1 className="auth-title">{title}</h1>
                <div className="auth-pane">
                    <div className="auth-pane-body">
                        <div className="auth-qr">
                            <div className="auth-qr-content">
                                <div className="auth-heading auth-heading-lg">
                                    {translate('fund_request.sign_up.app.title')}
                                </div>
                                <div className="auth-text">{translate('fund_request.sign_up.app.description_top')}</div>
                                <div className="auth-qr-code show-sm">
                                    {qrValue && (
                                        <QrCode
                                            value={makeQrCodeContent(qrValue.type, qrValue.value)}
                                            logo={assetUrl('/assets/img/me-logo.png')}
                                        />
                                    )}
                                </div>
                                <div className="auth-text">
                                    {translate('fund_request.sign_up.app.description_bottom')}
                                </div>
                                <AppLinks />
                            </div>
                            <div className="auth-qr-code hide-sm">
                                {qrValue && (
                                    <QrCode
                                        value={makeQrCodeContent(qrValue.type, qrValue.value)}
                                        logo={assetUrl('/assets/img/me-logo.png')}
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                    {hasBackTarget && (
                        <div className="auth-pane-footer">
                            <div className="flex flex-horizontal flex-center">
                                <div className="flex flex-grow">
                                    <div
                                        role={'button'}
                                        tabIndex={0}
                                        onKeyDown={clickOnKeyEnter}
                                        className="button button-text button-text-padless"
                                        onClick={onBack}>
                                        <em className="mdi mdi-chevron-left icon-lefts" />
                                        {translate('auth.back')}
                                    </div>
                                </div>
                                <div className="flex">&nbsp;</div>
                            </div>
                        </div>
                    )}
                </div>

                {authInfo}
            </div>
        </div>
    );
}
