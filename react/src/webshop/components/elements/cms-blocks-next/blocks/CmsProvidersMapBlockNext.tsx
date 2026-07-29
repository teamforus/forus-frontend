import React from 'react';
import Section from '../../sections/Section';
import StateNavLink from '../../../../modules/state_router/StateNavLink';
import ImplementationCmsBlock from '../../../../props/models/ImplementationCmsBlock';
import { WebshopRoutes } from '../../../../modules/state_router/RouterBuilder';
import { stringValue } from '../helpers/values';
import { cmsSectionClassName, cmsSectionStyle } from '../helpers/section';

export default function CmsProvidersMapBlockNext({ block }: { block: ImplementationCmsBlock }) {
    const values = block.values || {};
    const title = stringValue(values.section_title);
    const description = stringValue(values.section_description);
    const buttonText = stringValue(values.button_text);

    if (!buttonText) {
        return null;
    }

    return (
        <Section type={'cms-next'} style={cmsSectionStyle(values)} className={cmsSectionClassName(values)}>
            <div className="block block-cms-providers-map">
                <div className="cms-providers-map-content">
                    {title && <h2 className="cms-providers-map-title">{title}</h2>}
                    {description && <div className="cms-providers-map-subtitle">{description}</div>}
                    <StateNavLink
                        name={WebshopRoutes.PROVIDERS}
                        query={{ show_map: 1 }}
                        className="button button-primary cms-providers-map-button">
                        {buttonText}
                        <em className="mdi mdi-arrow-right icon-right" aria-hidden="true" />
                    </StateNavLink>
                </div>
            </div>
        </Section>
    );
}
