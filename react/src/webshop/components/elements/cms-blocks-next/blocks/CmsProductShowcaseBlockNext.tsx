import React, { useCallback, useEffect, useState } from 'react';
import { PaginationData } from '../../../../../dashboard/props/ApiResponses';
import Product from '../../../../props/models/Product';
import ProductsList from '../../lists/products-list/ProductsList';
import Markdown from '../../markdown/Markdown';
import Section from '../../sections/Section';
import StateNavLink from '../../../../modules/state_router/StateNavLink';
import ImplementationCmsBlock from '../../../../props/models/ImplementationCmsBlock';
import { WebshopRoutes } from '../../../../modules/state_router/RouterBuilder';
import { useProductService } from '../../../../services/ProductService';
import useSetProgress from '../../../../../dashboard/hooks/useSetProgress';
import { stringValue } from '../helpers/values';
import { cmsSectionClassName, cmsSectionStyle } from '../helpers/section';

const productCounts = [3, 6, 9, 12];

export default function CmsProductShowcaseBlockNext({ block }: { block: ImplementationCmsBlock }) {
    const values = block.values || {};
    const valuesHtml = block.values_html || {};
    const setProgress = useSetProgress();
    const productService = useProductService();

    const title = stringValue(values.section_title);
    const descriptionHtml = valuesHtml.section_description || '';
    const productCountValue = Number(values.product_count || 6);
    const productCount = productCounts.includes(productCountValue) ? productCountValue : 6;
    const buttonText = stringValue(values.button_text);

    const [products, setProducts] = useState<PaginationData<Product>>(null);

    const fetchProducts = useCallback(() => {
        setProgress(0);

        productService
            .sample(productCount)
            .then((res) => setProducts(res.data))
            .catch((e) => console.error(e))
            .finally(() => setProgress(100));
    }, [productCount, productService, setProgress]);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    if (!buttonText || !products?.data.length) {
        return null;
    }

    return (
        <Section type={'cms-next'} style={cmsSectionStyle(values)} className={cmsSectionClassName(values)}>
            {title && (
                <h2 className="section-title">
                    <StateNavLink name={WebshopRoutes.PRODUCTS}>{title}</StateNavLink>
                </h2>
            )}

            {descriptionHtml && <Markdown content={descriptionHtml} />}

            <ProductsList
                display="grid"
                products={products.data}
                setProducts={(list) => setProducts({ ...products, data: list })}
                headerTag={title ? 'h3' : 'h2'}
            />

            <div className="block block-show-more">
                <StateNavLink className="button button-primary show-more-button" name={WebshopRoutes.PRODUCTS}>
                    {buttonText}
                    <em className="mdi mdi-arrow-right icon-right" aria-hidden="true" />
                </StateNavLink>
            </div>
        </Section>
    );
}
