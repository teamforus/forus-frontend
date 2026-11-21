import BlockProducts from '../../../elements/block-products/BlockProducts';
import React, { useCallback, useEffect, useState } from 'react';
import Product from '../../../../props/models/Product';
import { useProductService } from '../../../../services/ProductService';
import useSetProgress from '../../../../../dashboard/hooks/useSetProgress';

export default function RandomProductsBlock({
    count,
    title,
    showCustomDescription = false,
}: {
    count: number;
    title?: string;
    showCustomDescription?: boolean;
}) {
    const setProgress = useSetProgress();
    const productService = useProductService();

    const [products, setProducts] = useState<Product[]>(null);

    const fetchProducts = useCallback(() => {
        setProgress(0);

        productService
            .sample(count)
            .then((res) => setProducts(res.data.data))
            .catch((e) => console.error(e))
            .finally(() => setProgress(100));
    }, [productService, setProgress, count]);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    return products?.length > 0 ? (
        <BlockProducts
            title={title}
            products={products}
            setProducts={setProducts}
            display="grid"
            showCustomDescription={showCustomDescription}
        />
    ) : null;
}
