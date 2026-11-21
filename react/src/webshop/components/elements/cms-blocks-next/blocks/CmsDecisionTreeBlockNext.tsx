import React, { CSSProperties, useId } from 'react';
import ImplementationCmsBlock from '../../../../props/models/ImplementationCmsBlock';
import Section from '../../sections/Section';
import { stringValue } from '../helpers/values';
import { cmsSectionClassName, cmsSectionStyle } from '../helpers/section';
import DecisionTreeLoader from '../../decision-tree/DecisionTreeLoader';

export default function CmsDecisionTreeBlockNext({ block }: { block: ImplementationCmsBlock }) {
    const titleId = useId();
    const values = block.values || {};
    const title = stringValue(values.section_title);
    const description = stringValue(values.section_description);
    const titleColor = stringValue(values.section_title_color);

    return (
        <Section
            type={'cms-next'}
            wrapper={false}
            style={cmsSectionStyle(values)}
            className={cmsSectionClassName(values)}>
            <div
                className="block block-cms-decision-tree"
                aria-labelledby={title ? titleId : undefined}
                style={
                    {
                        '--decision-tree-title-color': titleColor || undefined,
                    } as CSSProperties
                }>
                <div className="wrapper cms-decision-tree-wrapper">
                    <div className="cms-decision-tree-header">
                        {title && (
                            <h2 id={titleId} className="cms-decision-tree-title">
                                {title}
                            </h2>
                        )}
                        {description && <p className="cms-decision-tree-description">{description}</p>}
                    </div>

                    <DecisionTreeLoader />
                </div>
            </div>
        </Section>
    );
}
