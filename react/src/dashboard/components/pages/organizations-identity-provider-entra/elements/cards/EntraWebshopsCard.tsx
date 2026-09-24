import useTranslate from '../../../../../hooks/useTranslate';
import React from 'react';
import useEnvData from '../../../../../hooks/useEnvData';
import type IdentityProviderWebshop from '../../../../../props/models/IdentityProvider/IdentityProviderWebshop';
import TableEmptyValue from '../../../../elements/table-empty-value/TableEmptyValue';
import TableTopScroller from '../../../../elements/tables/TableTopScroller';
import TableRowActions from '../../../../elements/tables/TableRowActions';
import Label from '../../../../elements/label/Label';
import { DashboardRoutes } from '../../../../../modules/state_router/RouterBuilder';
import StateNavLink from '../../../../../modules/state_router/StateNavLink';
import { useIdentityProviderConnectionService } from '../../../../../services/IdentityProviderConnectionService';

export default function EntraWebshopsCard({
    organizationId,
    webshops,
}: {
    organizationId: number;
    webshops: Array<IdentityProviderWebshop>;
}) {
    const translate = useTranslate();
    const envData = useEnvData();
    const identityProviderConnectionService = useIdentityProviderConnectionService();

    if (envData.client_type === 'provider') {
        return null;
    }

    return (
        <div className="card card-collapsed">
            <div className="card-header">
                <div className="card-title">{translate('organizations_identity_provider_entra.ui.webshops_title')}</div>
            </div>

            <div className="card-section">
                <div className="card-block card-block-table">
                    <TableTopScroller>
                        <table className="table">
                            <thead>
                                <tr>
                                    {identityProviderConnectionService.getWebshopsColumns().map((column) => (
                                        <th key={column.key}>{translate(column.label)}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {webshops.length === 0 && (
                                    <tr>
                                        <td colSpan={4}>
                                            {translate('organizations_identity_provider_entra.ui.webshops_empty')}
                                        </td>
                                    </tr>
                                )}

                                {webshops.map((webshop) => (
                                    <StateNavLink
                                        key={webshop.id}
                                        name={DashboardRoutes.IMPLEMENTATION_AUTH_PAGE}
                                        params={{ id: webshop.id, organizationId }}
                                        customElement="tr"
                                        className="tr-clickable">
                                        <td className="text-strong">{webshop.name}</td>
                                        <td>{webshop.url_webshop || <TableEmptyValue />}</td>
                                        <td>
                                            <Label type={webshop.entra_login_enabled ? 'success' : 'default'}>
                                                {webshop.entra_login_enabled
                                                    ? translate('organizations_identity_provider_entra.ui.selected')
                                                    : translate(
                                                          'organizations_identity_provider_entra.ui.not_selected',
                                                      )}
                                            </Label>
                                        </td>
                                        <td className="table-td-actions text-right">
                                            <TableRowActions
                                                content={(e) => (
                                                    <div className="dropdown dropdown-actions">
                                                        <StateNavLink
                                                            name={DashboardRoutes.IMPLEMENTATION_AUTH_PAGE}
                                                            params={{ id: webshop.id, organizationId }}
                                                            className="dropdown-item"
                                                            onClick={e.close}>
                                                            <em className="mdi mdi-cog icon-start" />
                                                            {translate(
                                                                'organizations_identity_provider_entra.ui.configure_login',
                                                            )}
                                                        </StateNavLink>
                                                    </div>
                                                )}
                                            />
                                        </td>
                                    </StateNavLink>
                                ))}
                            </tbody>
                        </table>
                    </TableTopScroller>
                </div>
            </div>
        </div>
    );
}
