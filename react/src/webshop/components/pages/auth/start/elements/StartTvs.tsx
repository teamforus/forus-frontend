import React from 'react';
import useTranslate from '../../../../../../dashboard/hooks/useTranslate';
import { clickOnKeyEnter } from '../../../../../../dashboard/helpers/wcag';

export default function StartTvs({
    tvsForm,
    authInfo,
    onBack,
}: {
    tvsForm: React.ReactNode;
    authInfo: React.ReactNode;
    onBack: () => void;
}) {
    const translate = useTranslate();

    return (
        <div className="block block-auth">
            <div className="auth-wrapper">
                <h1 className="auth-title">{translate('auth.header.digid.title')}</h1>

                <div className="auth-pane">
                    <div className="auth-pane-body">
                        <div className="auth-row">
                            <div className="auth-col">
                                <h2 className="auth-text">
                                    <div className="auth-heading">{translate('auth.header.digid.description')}</div>
                                </h2>
                                {tvsForm}
                            </div>
                        </div>
                    </div>
                    <div className="auth-pane-footer">
                        <div className="flex flex-horizontal flex-center">
                            <div className="flex flex-grow">
                                <div
                                    role={'button'}
                                    tabIndex={4}
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
                </div>

                {authInfo}
            </div>
        </div>
    );
}
