import React from 'react';
import Markdown from '../../markdown/Markdown';
import Section from '../../sections/Section';
import ImplementationCmsBlock from '../../../../props/models/ImplementationCmsBlock';
import { stringValue } from '../helpers/values';
import { cmsSectionClassName, cmsSectionStyle } from '../helpers/section';

export default function CmsTextBlockNext({ block }: { block: ImplementationCmsBlock }) {
    const values = block.values || {};
    const title = stringValue(values.section_title);
    const descriptionHtml = block.values_html?.section_description || '';

    if (!title && !descriptionHtml) {
        return null;
    }

    return (
        <Section type={'cms-next'} style={cmsSectionStyle(values)} className={cmsSectionClassName(values)}>
            <div className="block block-cms">
                {title && <h2 className="section-title">{title}</h2>}
                {descriptionHtml && <Markdown content={descriptionHtml} />}
            </div>
        </Section>
    );
}
