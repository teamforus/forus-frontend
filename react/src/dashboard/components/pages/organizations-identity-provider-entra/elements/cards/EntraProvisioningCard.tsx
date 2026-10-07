import React from 'react';
import classNames from 'classnames';
import useTranslate from '../../../../../hooks/useTranslate';
import type IdentityProviderConnection from '../../../../../props/models/IdentityProvider/IdentityProviderConnection';
import CardBlockKeyValue from '../../../../elements/card/blocks/CardBlockKeyValue';
import FormGroup from '../../../../elements/forms/elements/FormGroup';
import FormGroupInfo from '../../../../elements/forms/elements/FormGroupInfo';
import Label from '../../../../elements/label/Label';

export default function EntraProvisioningCard({
    connection,
    credentialRevoked,
    token,
    busy,
    onIssue,
    onRevoke,
}: {
    connection: IdentityProviderConnection;
    credentialRevoked: boolean;
    token: string | null;
    busy: boolean;
    onIssue: () => void;
    onRevoke: () => void;
}) {
    const translate = useTranslate();
    const credential = connection.scim_credential;
    const configured = credential && !credential.revoked_at && !credentialRevoked;

    return (
        <div className="card card-collapsed">
            <div className="card-header">
                <div className="card-title">
                    {translate('organizations_identity_provider_entra.provisioning.title')}
                </div>
            </div>

            <div className="card-section form">
                <div className="card-text">{translate('organizations_identity_provider_entra.provisioning.setup')}</div>

                <FormGroup
                    label={translate('organizations_identity_provider_entra.provisioning.endpoint')}
                    input={(id) => (
                        <FormGroupInfo
                            copyShow={true}
                            copyValue={connection.scim_url}
                            info={translate('organizations_identity_provider_entra.provisioning.endpoint_info')}>
                            <input id={id} className="form-control" value={connection.scim_url} readOnly={true} />
                        </FormGroupInfo>
                    )}
                />

                {token && (
                    <>
                        <div className="form-group">
                            <div className="block block-info-box block-info-box-dashed" role="status">
                                <div className="info-box-icon mdi mdi-alert-outline" aria-hidden="true" />
                                <div className="info-box-content">
                                    {translate('organizations_identity_provider_entra.provisioning.token_once')}
                                </div>
                            </div>
                        </div>

                        <FormGroup
                            label={translate('organizations_identity_provider_entra.provisioning.new_token')}
                            input={(id) => (
                                <FormGroupInfo
                                    copyShow={true}
                                    copyValue={token}
                                    info={translate('organizations_identity_provider_entra.provisioning.token_info')}>
                                    <input
                                        id={id}
                                        className="form-control"
                                        value={token}
                                        autoComplete="off"
                                        spellCheck={false}
                                        readOnly={true}
                                    />
                                </FormGroupInfo>
                            )}
                        />
                    </>
                )}
            </div>

            {credential && (
                <div className="card-section">
                    <CardBlockKeyValue
                        size="lg"
                        items={[
                            {
                                label: translate(
                                    'organizations_identity_provider_entra.provisioning.credential_status',
                                ),
                                value: (
                                    <Label type={configured ? 'success' : 'default'}>
                                        {configured
                                            ? translate('organizations_identity_provider_entra.provisioning.configured')
                                            : translate('organizations_identity_provider_entra.provisioning.revoked')}
                                    </Label>
                                ),
                            },
                            {
                                label: translate('organizations_identity_provider_entra.ui.created_at'),
                                value: credential.created_at_locale,
                            },
                            {
                                label: translate('organizations_identity_provider_entra.provisioning.last_used'),
                                value: credential.last_used_at_locale,
                            },
                        ]}
                    />
                </div>
            )}

            <div className="card-footer card-footer-primary">
                <div className="button-group flex-end flex-gap-sm">
                    <button
                        type="button"
                        className={classNames('button', configured ? 'button-default' : 'button-primary')}
                        disabled={busy}
                        onClick={onIssue}>
                        <em className="mdi mdi-key icon-start" aria-hidden="true" />
                        {configured
                            ? translate('organizations_identity_provider_entra.provisioning.rotate')
                            : translate('organizations_identity_provider_entra.provisioning.create')}
                    </button>

                    {configured && (
                        <button type="button" className="button button-danger" disabled={busy} onClick={onRevoke}>
                            {translate('organizations_identity_provider_entra.provisioning.revoke')}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
