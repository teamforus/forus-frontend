import { strLimit } from '../../../../helpers/string';
import React, { Fragment, ReactNode, useMemo } from 'react';
import Media from '../../../../props/models/Media';
import useAssetUrl from '../../../../hooks/useAssetUrl';
import classNames from 'classnames';

export default function TableEntityMain({
    media = false,
    mediaAlt = '',
    mediaSize = 'sm',
    mediaRound = true,
    mediaBorder = true,
    mediaPlaceholder,
    title,
    titleLimit = 64,
    subtitle,
    subtitleLimit = 64,
    subtitleProperties,
    collapsed = null,
    collapsedClicked = null,
    collapsePlaceholder = false,
}: {
    media?: Media | false;
    mediaAlt?: string;
    mediaSize?: 'sm' | 'md';
    mediaRound?: boolean;
    mediaBorder?: boolean;
    mediaPlaceholder?: 'fund' | 'organization' | 'product' | 'form' | 'physical_card_type' | 'office';
    title: string;
    titleLimit?: number;
    subtitle?: string | number | ReactNode;
    subtitleLimit?: number;
    subtitleProperties?: Array<{ label: string; value: string | number }>;
    collapsed?: boolean;
    collapsedClicked?: (e: React.MouseEvent) => void;
    collapsePlaceholder?: boolean;
}) {
    const assetUrl = useAssetUrl();

    const thumbnailUrl = useMemo(() => {
        const thumbnails = {
            form: assetUrl('/assets/img/icon-fund-form.svg'),
            fund: assetUrl('/assets/img/placeholders/fund-thumbnail.png'),
            office: assetUrl('/assets/img/placeholders/office-thumbnail.png'),
            product: assetUrl('/assets/img/placeholders/product-thumbnail.png'),
            organization: assetUrl('/assets/img/placeholders/organization-thumbnail.png'),
            physical_card_type: assetUrl('/assets/img/placeholders/physical-card-type.svg'),
        };

        return thumbnails[mediaPlaceholder] || null;
    }, [assetUrl, mediaPlaceholder]);

    const subtitleValue = useMemo(() => {
        if (typeof subtitle === 'string' || typeof subtitle === 'number') {
            return subtitle.toString();
        }

        return subtitle;
    }, [subtitle]);

    return (
        <div className="td-entity-main">
            {(collapsed !== null || collapsePlaceholder) && (
                <div className="td-entity-main-collapse" onClick={collapsed !== null ? collapsedClicked : undefined}>
                    {collapsed !== null ? (
                        collapsed ? (
                            <em className="mdi mdi-menu-right" />
                        ) : (
                            <em className="mdi mdi-menu-down" />
                        )
                    ) : (
                        <em className="mdi"> </em>
                    )}
                </div>
            )}

            {media !== false && (
                <div className="td-entity-main-media">
                    <img
                        className={classNames(
                            'td-media',
                            mediaSize === 'sm' && 'td-media-sm',
                            mediaSize === 'md' && 'td-media-md',
                            mediaRound && 'td-media-round',
                            !mediaBorder && 'td-media-borderless',
                        )}
                        src={media?.sizes.thumbnail || thumbnailUrl}
                        alt={mediaAlt}
                    />
                </div>
            )}

            <div className="td-entity-main-content">
                <div className="text-strong text-primary" title={title}>
                    {strLimit(title, titleLimit)}
                </div>

                {subtitleValue &&
                    (typeof subtitleValue === 'string' ? (
                        <div className="text-muted-dark" title={subtitleValue}>
                            {strLimit(subtitleValue, subtitleLimit)}
                        </div>
                    ) : (
                        subtitleValue
                    ))}

                {subtitleProperties?.length > 0 && (
                    <div className={'td-entity-properties'}>
                        {subtitleProperties?.map((property, index) => (
                            <Fragment key={index}>
                                <div className={'td-entity-property'}>
                                    <div className={'td-entity-property-label'}>{property.label}</div>
                                    <div className={'td-entity-property-value'}>{property.value?.toString()}</div>
                                </div>
                                {index < subtitleProperties?.length - 1 && (
                                    <span className={'td-entity-property-separator'} />
                                )}
                            </Fragment>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
