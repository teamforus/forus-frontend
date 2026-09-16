import useTranslate from '../../../hooks/useTranslate';
import React, { Fragment, useCallback, useContext, useEffect, useRef, useState } from 'react';
import usePushApiError from '../../../hooks/usePushApiError';
import usePushSuccess from '../../../hooks/usePushSuccess';
import { useIdentityProviderLinkService } from '../../../services/IdentityProviderLinkService';
import { PaginationData, ResponseError } from '../../../props/ApiResponses';
import type IdentityProviderUserLink from '../../../props/models/IdentityProvider/IdentityProviderUserLink';
import type IdentityProviderLinkOption from '../../../props/models/IdentityProvider/IdentityProviderLinkOption';
import type IdentityProviderLinksMeta from '../../../props/models/IdentityProvider/IdentityProviderLinksMeta';
import useLatestRequestWithProgress from '../../../hooks/useLatestRequestWithProgress';
import usePaginatorService from '../../../modules/paginator/services/usePaginatorService';
import useFilterNext from '../../../modules/filter_next/useFilterNext';
import useConfirmDangerAction from '../../../hooks/useConfirmDangerAction';
import LoaderTableCard from '../../elements/loader-table-card/LoaderTableCard';
import { authContext } from '../../../contexts/AuthContext';
import { useNavigateState } from '../../../modules/state_router/Router';
import { DashboardRoutes } from '../../../modules/state_router/RouterBuilder';
import usePushDanger from '../../../hooks/usePushDanger';
import {
    appendIdentityProviderDiagnosticReference,
    consumeIdentityProviderHandoff,
} from '../../../helpers/identityProviderHandoff';
import TableTopScroller from '../../elements/tables/TableTopScroller';
import TableRowActions from '../../elements/tables/TableRowActions';
import InfoBox from '../../elements/info-box/InfoBox';
import classNames from 'classnames';

const identityProviderNames: Record<string, string> = {
    entra: 'Microsoft Entra',
};

export default function SecurityIdentityProviderLinks() {
    const translate = useTranslate();
    const pushDanger = usePushDanger();
    const pushSuccess = usePushSuccess();
    const pushApiError = usePushApiError();
    const navigateState = useNavigateState();
    const confirmDangerAction = useConfirmDangerAction();
    const { updateIdentity } = useContext(authContext);

    const paginatorService = usePaginatorService();
    const identityProviderLinkService = useIdentityProviderLinkService();

    const [busy, setBusy] = useState(false);
    const [paginatorKey] = useState('identity_provider_links');
    const [links, setLinks] = useState<PaginationData<IdentityProviderUserLink, IdentityProviderLinksMeta>>(null);
    const [callbackError] = useState(() => consumeIdentityProviderHandoff('entra_error'));
    const [exchangeToken] = useState(() => consumeIdentityProviderHandoff('entra_exchange'));
    const [sessionUid] = useState(() => consumeIdentityProviderHandoff('entra_session'));
    const [callbackErrorReference] = useState(() => consumeIdentityProviderHandoff('entra_error_ref'));
    const [completing, setCompleting] = useState(!!exchangeToken && !callbackError);
    const [availableConnections, setAvailableConnections] = useState<Array<IdentityProviderLinkOption>>([]);

    const callbackErrorHandledRef = useRef(false);
    const completionStartedRef = useRef(false);

    const runLatestRequest = useLatestRequestWithProgress();

    const [filterValues, filterValuesActive, filterUpdate] = useFilterNext({
        per_page: paginatorService.getPerPage(paginatorKey),
    });

    const fetchLinks = useCallback(() => {
        runLatestRequest((config) => identityProviderLinkService.links(filterValuesActive, config), {
            onSuccess: (response) => {
                setLinks(response.data);
                setAvailableConnections(response.data.meta.available_connections || []);
            },
            onError: (error) => pushApiError(error as ResponseError),
        });
    }, [filterValuesActive, identityProviderLinkService, pushApiError, runLatestRequest]);

    const startLink = useCallback(
        (connectionUid: string) => {
            setBusy(true);

            identityProviderLinkService
                .startLink(connectionUid)
                .then((response) => window.location.assign(response.data.data.redirect_url))
                .catch(pushApiError)
                .finally(() => setBusy(false));
        },
        [identityProviderLinkService, pushApiError],
    );

    useEffect(() => {
        if (!completing) {
            fetchLinks();
        }
    }, [completing, fetchLinks]);

    useEffect(() => {
        if (completionStartedRef.current) {
            return;
        }

        completionStartedRef.current = true;

        if (!exchangeToken || callbackError) {
            identityProviderLinkService.clearBrowserToken(sessionUid);
            return;
        }

        identityProviderLinkService
            .completeLink(sessionUid, exchangeToken)
            .then(() => {
                updateIdentity().catch(pushApiError);
            })
            .catch((error: ResponseError) => {
                pushDanger(
                    translate('organizations_identity_provider_entra.ui.link_failed_title'),
                    error.data?.message || translate('organizations_identity_provider_entra.ui.link_failed'),
                );
            })
            .finally(() => setCompleting(false));
    }, [
        callbackError,
        exchangeToken,
        identityProviderLinkService,
        pushApiError,
        pushDanger,
        sessionUid,
        translate,
        updateIdentity,
    ]);

    useEffect(() => {
        if (!callbackError || callbackErrorHandledRef.current) {
            return;
        }

        callbackErrorHandledRef.current = true;
        pushDanger(
            translate('organizations_identity_provider_entra.ui.link_failed_title'),
            appendIdentityProviderDiagnosticReference(
                translate('organizations_identity_provider_entra.ui.link_failed'),
                callbackErrorReference,
            ),
        );
    }, [callbackError, callbackErrorReference, pushDanger, translate]);

    useEffect(() => {
        if (
            !completing &&
            links?.meta.can_manage_links &&
            links.meta.total === 0 &&
            availableConnections.length === 0
        ) {
            navigateState(DashboardRoutes.ORGANIZATIONS);
        }
    }, [availableConnections, completing, links, navigateState]);

    return (
        <>
            {links?.meta.can_manage_links && availableConnections.length > 0 && (
                <div className="card">
                    <div className="card-header">
                        <div className="card-title">
                            {translate('organizations_identity_provider_entra.ui.link_title')}
                        </div>
                    </div>

                    <div className="card-section">
                        <div className="card-block card-block-table">
                            <TableTopScroller>
                                <table className="table">
                                    <thead>
                                        <tr>
                                            {identityProviderLinkService.getColumns().map((column) => (
                                                <th key={column.key}>{translate(column.label)}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {availableConnections.map((connection) => (
                                            <tr key={connection.uid}>
                                                <td className="text-strong">{connection.organization.name}</td>
                                                <td>
                                                    {identityProviderNames[connection.provider] || connection.provider}
                                                </td>
                                                <td className="table-td-actions text-right">
                                                    <button
                                                        type="button"
                                                        className="button button-primary button-sm"
                                                        disabled={busy || completing}
                                                        onClick={() => startLink(connection.uid)}>
                                                        {translate(
                                                            'organizations_identity_provider_entra.ui.link_account',
                                                        )}
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </TableTopScroller>
                        </div>
                    </div>
                    <div className="card-section card-section-padless">
                        <InfoBox borderType="none">
                            {translate('organizations_identity_provider_entra.ui.link_info')}
                        </InfoBox>
                    </div>
                </div>
            )}

            <div className="card">
                <div className="card-header">
                    <div className="card-title">
                        {translate('organizations_identity_provider_entra.ui.links_title')}
                    </div>
                </div>
                {links && !links.meta.can_manage_links && (
                    <div className="card-section card-section-padless">
                        <InfoBox borderType="none">{links.meta.management_message}</InfoBox>
                    </div>
                )}

                <LoaderTableCard
                    loading={!links || completing}
                    empty={links?.meta?.total === 0}
                    emptyTitle={translate('organizations_identity_provider_entra.ui.links_empty')}
                    columns={identityProviderLinkService.getColumns()}
                    tableFooter={
                        <div className="card-section card-section-padless">
                            <InfoBox borderType="none">
                                {translate('organizations_identity_provider_entra.ui.link_info')}
                            </InfoBox>
                        </div>
                    }
                    tableOptions={{ hasTooltips: false }}
                    paginator={{ key: paginatorKey, data: links, filterValues, filterUpdate }}>
                    {links?.data.map((link) => (
                        <tr key={link.uid}>
                            <td className="text-strong">{link.organization.name}</td>
                            <td>{identityProviderNames[link.provider] || link.provider}</td>
                            <td className="table-td-actions text-right">
                                <TableRowActions
                                    disabled={busy || completing || !links.meta.can_manage_links}
                                    content={({ close }) => (
                                        <div className="dropdown dropdown-actions">
                                            <a
                                                className={classNames('dropdown-item', {
                                                    disabled: busy || !links.meta.can_manage_links,
                                                })}
                                                aria-disabled={busy || !links.meta.can_manage_links}
                                                onClick={() => {
                                                    close();
                                                    confirmDangerAction(
                                                        translate(
                                                            'organizations_identity_provider_entra.ui.unlink_title',
                                                        ),
                                                        translate(
                                                            'organizations_identity_provider_entra.ui.unlink_confirm',
                                                        ),
                                                        translate('organizations_identity_provider_entra.ui.unlink'),
                                                        translate('organizations_identity_provider_entra.ui.cancel'),
                                                    ).then((confirmed) => {
                                                        if (!confirmed) {
                                                            return;
                                                        }

                                                        setBusy(true);

                                                        identityProviderLinkService
                                                            .unlink(link.uid)
                                                            .then(() => {
                                                                pushSuccess(
                                                                    translate(
                                                                        'organizations_identity_provider_entra.ui.unlinked',
                                                                    ),
                                                                );
                                                                fetchLinks();
                                                                updateIdentity().then();
                                                            })
                                                            .catch(pushApiError)
                                                            .finally(() => setBusy(false));
                                                    });
                                                }}>
                                                <em className="mdi mdi-delete icon-start" />
                                                {translate('organizations_identity_provider_entra.ui.unlink')}
                                            </a>
                                        </div>
                                    )}
                                />
                            </td>
                        </tr>
                    ))}
                </LoaderTableCard>
            </div>
        </>
    );
}
