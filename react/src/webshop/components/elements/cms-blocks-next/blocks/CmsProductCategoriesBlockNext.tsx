import React, { CSSProperties, useId, useMemo } from 'react';
import classNames from 'classnames';
import useRootProductCategories from '../../../pages/products/hooks/useRootProductCategories';
import useTranslate from '../../../../../dashboard/hooks/useTranslate';
import StateNavLink from '../../../../modules/state_router/StateNavLink';
import ImplementationCmsBlock from '../../../../props/models/ImplementationCmsBlock';
import { WebshopRoutes } from '../../../../modules/state_router/RouterBuilder';
import Section from '../../sections/Section';
import SVGShapeTop from '../../../../../../assets/forus-webshop/resources/_webshop-common/assets/img/product-categories-shape-top.svg';
import SVGShapeBottom from '../../../../../../assets/forus-webshop/resources/_webshop-common/assets/img/product-categories-shape-bottom.svg';
import { stringValue } from '../helpers/values';
import { cmsSectionClassName, cmsSectionStyle } from '../helpers/section';

type ProductCategoriesStyle = CSSProperties & {
    '--cms-product-categories-shape-color'?: string;
    '--cms-product-categories-shape-opacity'?: number;
};

export default function CmsProductCategoriesBlockNext({ block }: { block: ImplementationCmsBlock }) {
    const titleId = useId();
    const translate = useTranslate();
    const values = block.values || {};
    const title = stringValue(values.section_title);
    const description = stringValue(values.section_description);
    const backgroundType = stringValue(values.section_background_type);
    const shapeColor = stringValue(values.section_background_shape_color);
    const resolvedBackgroundType = backgroundType === 'solid' ? 'solid' : 'shape';
    const isShape = resolvedBackgroundType === 'shape';

    const { productCategories, productCategoriesIconMap } = useRootProductCategories();

    const blockStyle = useMemo<ProductCategoriesStyle | undefined>(() => {
        const style: ProductCategoriesStyle = {};

        if (isShape && shapeColor) {
            style['--cms-product-categories-shape-color'] = shapeColor;
            style['--cms-product-categories-shape-opacity'] = 1;
        }

        return Object.keys(style).length > 0 ? style : undefined;
    }, [isShape, shapeColor]);

    if (!productCategories?.length) {
        return null;
    }

    return (
        <Section
            type={'cms-next'}
            wrapper={false}
            style={!isShape ? cmsSectionStyle(values) : undefined}
            className={cmsSectionClassName(values)}>
            <div
                className={classNames(
                    'block block-cms-product-categories',
                    isShape && 'block-cms-product-categories-shape',
                    !isShape && 'block-cms-product-categories-solid',
                )}
                aria-labelledby={title ? titleId : undefined}
                style={blockStyle}>
                {isShape && (
                    <div className="cms-product-categories-shape" aria-hidden="true">
                        <SVGShapeTop />
                    </div>
                )}

                <div className="cms-product-categories-content">
                    <div className="wrapper cms-product-categories-wrapper">
                        {title && (
                            <h2 id={titleId} className="cms-product-categories-title">
                                {title}
                            </h2>
                        )}

                        {description && <p className="cms-product-categories-description">{description}</p>}

                        <div
                            className={classNames(
                                'cms-product-categories-items',
                                !productCategoriesIconMap && 'cms-product-categories-items-no-icons',
                            )}>
                            {productCategories.map((category) => (
                                <StateNavLink
                                    name={WebshopRoutes.PRODUCTS}
                                    query={{ product_category_ids: category.id }}
                                    className="cms-product-categories-item"
                                    key={category.id}
                                    dataAttributes={{
                                        'aria-label': translate('block_product_categories.category_link_label', {
                                            category: category.name,
                                        }),
                                    }}>
                                    {productCategoriesIconMap?.[category.key] && (
                                        <div className="cms-product-categories-item-icon" aria-hidden="true">
                                            {productCategoriesIconMap[category.key]}
                                        </div>
                                    )}
                                    <span className="cms-product-categories-item-name">{category.name}</span>
                                </StateNavLink>
                            ))}
                        </div>
                    </div>
                </div>

                {isShape && (
                    <div className="cms-product-categories-shape" aria-hidden="true">
                        <SVGShapeBottom />
                    </div>
                )}
            </div>
        </Section>
    );
}
