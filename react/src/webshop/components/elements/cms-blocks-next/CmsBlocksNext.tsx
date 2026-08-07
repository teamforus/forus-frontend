import React, { Fragment } from 'react';
import ImplementationPage from '../../../props/models/ImplementationPage';
import CmsBannerBlockNext from './blocks/CmsBannerBlockNext';
import CmsCalloutBlockNext from './blocks/CmsCalloutBlockNext';
import CmsFaqBlockNext from './blocks/CmsFaqBlockNext';
import CmsInfoBlockNext from './blocks/CmsInfoBlockNext';
import CmsLinkPanelsBlockNext from './blocks/CmsLinkPanelsBlockNext';
import CmsProductCategoriesBlockNext from './blocks/CmsProductCategoriesBlockNext';
import CmsProductShowcaseBlockNext from './blocks/CmsProductShowcaseBlockNext';
import CmsProviderSignUpBlockNext from './blocks/CmsProviderSignUpBlockNext';
import CmsProvidersMapBlockNext from './blocks/CmsProvidersMapBlockNext';
import CmsTextBlockNext from './blocks/CmsTextBlockNext';

export default function CmsBlocksNext({ page }: { page: ImplementationPage }) {
    const cmsBlocks = page.cms_blocks || [];

    if (cmsBlocks.length === 0) {
        return null;
    }

    return (
        <Fragment>
            {cmsBlocks.map((block, index) => {
                const key = block.id || index;

                if (block.block_type_key === 'info') {
                    return <CmsInfoBlockNext key={key} block={block} />;
                }

                if (block.block_type_key === 'text') {
                    return <CmsTextBlockNext key={key} block={block} />;
                }

                if (block.block_type_key === 'banner') {
                    return <CmsBannerBlockNext key={key} block={block} />;
                }

                if (block.block_type_key === 'callout') {
                    return <CmsCalloutBlockNext key={key} block={block} />;
                }

                if (block.block_type_key === 'faq') {
                    return <CmsFaqBlockNext key={key} block={block} />;
                }

                if (block.block_type_key === 'link_panels') {
                    return <CmsLinkPanelsBlockNext key={key} block={block} />;
                }

                if (block.block_type_key === 'providers_map') {
                    return <CmsProvidersMapBlockNext key={key} block={block} />;
                }

                if (block.block_type_key === 'product_categories') {
                    return <CmsProductCategoriesBlockNext key={key} block={block} />;
                }

                if (block.block_type_key === 'product_showcase') {
                    return <CmsProductShowcaseBlockNext key={key} block={block} />;
                }

                if (block.block_type_key === 'provider_signup') {
                    return <CmsProviderSignUpBlockNext key={key} block={block} />;
                }

                return null;
            })}
        </Fragment>
    );
}
