import React from 'react';
import useTranslate from '../../../../dashboard/hooks/useTranslate';
import useCmsPage from './hooks/useCmsPage';
import BlockShowcase from '../../elements/block-showcase/BlockShowcase';
import ExplanationFaq from './elements/ExplanationFaq';
import { WebshopRoutes } from '../../../modules/state_router/RouterBuilder';
import CmsPageContent from './elements/CmsPageContent';

export default function Explanation() {
    const translate = useTranslate();

    const page = useCmsPage('explanation');

    return (
        <BlockShowcase
            breadcrumbItems={[
                { name: translate('explanation.breadcrumbs.home'), state: WebshopRoutes.HOME },
                { name: translate('explanation.breadcrumbs.explanation') },
            ]}>
            {page && (
                <CmsPageContent page={page}>
                    <ExplanationFaq page={page} />
                </CmsPageContent>
            )}
        </BlockShowcase>
    );
}
