import React from 'react';
import ProductsListItem from './ProductsListItem';
import Product from '../../../../props/models/Product';
import classNames from 'classnames';

export default function ProductsList({
    display = 'grid',
    headerTag = 'h2',
    products = [],
    setProducts = null,
}: {
    display: 'grid' | 'list' | 'search';
    headerTag?: 'h2' | 'h3';
    products?: Array<Product>;
    setProducts?: (products: Array<Product>) => void;
}) {
    return (
        <div
            className={classNames(
                'block',
                display === 'grid' && 'block-products',
                display === 'list' && 'block-products-list',
            )}
            data-dusk={
                display === 'grid' ? 'displayTypeGrid' : display === 'list' ? 'displayTypeList' : 'displayTypeSearch'
            }>
            {products?.map((product) => (
                <ProductsListItem
                    key={product.id}
                    product={product}
                    display={display}
                    headerTag={headerTag}
                    onToggleBookmark={(product) => {
                        setProducts?.(
                            products.map((item) => {
                                return item.id === product.id ? { ...item, bookmarked: product.bookmarked } : item;
                            }),
                        );
                    }}
                />
            ))}
        </div>
    );
}
