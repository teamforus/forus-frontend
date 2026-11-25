import React, { Fragment } from 'react';
import Product from '../../../../../props/models/Product';
import useAssetUrl from '../../../../../hooks/useAssetUrl';

export default function ProductsListItemSearch({ product, price }: { product: Product; price: string }) {
    const assetUrl = useAssetUrl();

    return (
        <Fragment>
            <div className="search-media">
                <img
                    src={product.photos[0]?.sizes?.small || assetUrl('/assets/img/placeholders/product-small.png')}
                    alt={product.alternative_text}
                />
            </div>
            <div className="search-content">
                <div className="search-details">
                    <h2 className="search-title">{product.name}</h2>
                    <div className="search-subtitle">{product.organization.name}</div>
                </div>

                <div className="search-actions">
                    <div className="search-price">{price}</div>
                </div>
            </div>
        </Fragment>
    );
}
