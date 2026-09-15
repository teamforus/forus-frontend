import useTranslate from '../../../../../hooks/useTranslate';
import React from 'react';
import type IdentityProviderConnection from '../../../../../props/models/IdentityProvider/IdentityProviderConnection';
import CardBlockKeyValue from '../../../../elements/card/blocks/CardBlockKeyValue';
import Label, { LabelType } from '../../../../elements/label/Label';

const statusLabels: Record<IdentityProviderConnection['status'], string> = {
    enabled: 'organizations_identity_provider_entra.ui.active',
    paused: 'organizations_identity_provider_entra.ui.paused',
    disconnected: 'organizations_identity_provider_entra.ui.disconnected',
};

const statusTypes: Record<IdentityProviderConnection['status'], LabelType> = {
    enabled: 'success',
    paused: 'warning',
    disconnected: 'default',
};

export default function EntraConnectionCard({
    busy = false,
    connection,
    onPause,
    onResume,
    onDisconnect,
    readOnly = false,
}: {
    busy?: boolean;
    connection: IdentityProviderConnection;
    onPause?: () => void;
    onResume?: () => void;
    onDisconnect?: () => void;
    readOnly?: boolean;
}) {
    const translate = useTranslate();
    return (
        <div className="card card-collapsed">
            <div className="card-header">
                <div className="card-title">
                    {translate('organizations_identity_provider_entra.ui.connection_title')}
                </div>
            </div>

            <div className="card-section">
                <CardBlockKeyValue
                    size="lg"
                    items={[
                        {
                            label: translate('organizations_identity_provider_entra.ui.status'),
                            value: (
                                <Label type={statusTypes[connection.status]}>
                                    {translate(statusLabels[connection.status])}
                                </Label>
                            ),
                        },
                        {
                            label: translate('organizations_identity_provider_entra.ui.tenant_id'),
                            value: <span className="text-word-break">{connection.tenant_id}</span>,
                        },
                        {
                            label: translate('organizations_identity_provider_entra.ui.connected_at'),
                            value: connection.consented_at_locale,
                        },
                        ...(connection.status === 'disconnected'
                            ? [
                                  {
                                      label: translate('organizations_identity_provider_entra.ui.disconnected_at'),
                                      value: connection.disconnected_at_locale,
                                  },
                              ]
                            : []),
                        {
                            label: translate('organizations_identity_provider_entra.ui.linked_employees'),
                            value: connection.managed_employees_count,
                        },
                        {
                            label: translate('organizations_identity_provider_entra.ui.last_success'),
                            value: connection.last_auth_success_at_locale,
                        },
                        {
                            label: translate('organizations_identity_provider_entra.ui.last_failure'),
                            value: connection.last_auth_failure_code ? (
                                <span>
                                    {connection.last_auth_failure_at_locale}
                                    {' · '}
                                    {connection.last_auth_failure_code}
                                </span>
                            ) : null,
                        },
                    ]}
                />
            </div>

            {!readOnly && connection.status !== 'disconnected' && (
                <div className="card-footer card-footer-primary">
                    <div className="button-group flex-end flex-gap-sm">
                        {connection.status === 'enabled' && (
                            <button type="button" className="button button-default" disabled={busy} onClick={onPause}>
                                <em className="mdi mdi-pause icon-start" />
                                {translate('organizations_identity_provider_entra.ui.pause')}
                            </button>
                        )}

                        {connection.status === 'paused' && (
                            <button type="button" className="button button-default" disabled={busy} onClick={onResume}>
                                <em className="mdi mdi-play icon-start" />
                                {translate('organizations_identity_provider_entra.ui.resume')}
                            </button>
                        )}

                        <button type="button" className="button button-danger" disabled={busy} onClick={onDisconnect}>
                            {translate('organizations_identity_provider_entra.ui.disconnect')}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
