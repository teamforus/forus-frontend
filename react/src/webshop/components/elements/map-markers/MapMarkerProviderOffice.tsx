import React from 'react';
import Office from '../../../../dashboard/props/models/Office';
import type { ProductOffice } from '../../../props/models/Product';
import useAssetUrl from '../../../hooks/useAssetUrl';
import useTranslate from '../../../../dashboard/hooks/useTranslate';
import StateNavLink from '../../../modules/state_router/StateNavLink';
import { WebshopRoutes } from '../../../modules/state_router/RouterBuilder';

export default function MapMarkerProviderOffice({
    office,
    organization,
}: {
    office: Office | ProductOffice;
    organization: Office['organization'];
}) {
    const assetUrl = useAssetUrl();
    const translate = useTranslate();

    return (
        <div className="map-card">
            <div className="map-card-img">
                <img
                    src={
                        office?.photo?.sizes?.thumbnail ||
                        organization?.logo?.sizes?.thumbnail ||
                        assetUrl('assets/img/placeholders/office-thumbnail.png')
                    }
                    alt=""
                />
            </div>
            <div className="map-card-content">
                <div className="map-card-title">{organization?.name}</div>
                <div className="map-card-description">
                    <div className={'map-card-description-row'}>
                        <strong>{translate('global.map_marker.address')}:</strong>
                        {office.address}
                    </div>
                    {organization?.business_type?.name && (
                        <div className={'map-card-description-row'}>
                            <strong>{translate('global.map_marker.organization_type')}:</strong>
                            {organization.business_type.name}
                        </div>
                    )}
                    {(office?.phone || organization?.phone) && (
                        <div className={'map-card-description-row'}>
                            <strong>{translate('global.map_marker.phone')}:</strong>
                            {office.phone || organization.phone}
                        </div>
                    )}
                    {organization?.email && (
                        <div className={'map-card-description-row'}>
                            <strong>{translate('global.map_marker.email')}:</strong>
                            {organization.email}
                        </div>
                    )}
                </div>
                <StateNavLink
                    name={WebshopRoutes.PROVIDER_OFFICE}
                    params={{ organization_id: office.organization_id, id: office.id }}
                    className="map-card-button">
                    {translate('global.map_marker.view_details')}
                    <em className="mdi mdi-arrow-right" aria-hidden="true" />
                </StateNavLink>
            </div>
        </div>
    );
}
