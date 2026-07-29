import React from 'react';
import classNames from 'classnames';
import Label from '../../label/Label';
import Section from '../../sections/Section';
import ImplementationCmsBlock from '../../../../props/models/ImplementationCmsBlock';
import { stringValue, valueIsTrue } from '../helpers/values';
import { cmsSectionClassName, cmsSectionStyle } from '../helpers/section';

const contentAlignments = ['left', 'center', 'right'];

export default function CmsCalloutBlockNext({ block }: { block: ImplementationCmsBlock }) {
    const values = block.values || {};
    const image = block.media?.image;
    const imageUrl = image?.sizes?.large || image?.sizes?.public || image?.sizes?.original;
    const label = stringValue(values.label);
    const title = stringValue(values.section_title);
    const description = stringValue(values.section_description);
    const buttonText = stringValue(values.button_text);
    const buttonLink = stringValue(values.button_link);
    const showButton = valueIsTrue(values.button_enabled) && Boolean(buttonText && buttonLink);
    const buttonTargetBlank = valueIsTrue(values.button_target_blank);
    const contentAlignment = stringValue(values.content_alignment);
    const resolvedContentAlignment = contentAlignments.includes(contentAlignment) ? contentAlignment : 'left';

    if (!imageUrl && !label && !title && !description && !showButton) {
        return null;
    }

    return (
        <Section type={'cms-next'} style={cmsSectionStyle(values)} className={cmsSectionClassName(values)}>
            <div
                className={classNames(
                    'block block-cms-callout',
                    resolvedContentAlignment === 'left' && 'block-cms-callout-align-left',
                    resolvedContentAlignment === 'center' && 'block-cms-callout-align-center',
                    resolvedContentAlignment === 'right' && 'block-cms-callout-align-right',
                )}>
                {imageUrl && (
                    <div className="cms-callout-media">
                        <img className="cms-callout-image" src={imageUrl} alt="" />
                    </div>
                )}

                <div className="cms-callout-content">
                    {label && (
                        <div className="cms-callout-label">
                            <Label type="primary">{label}</Label>
                        </div>
                    )}
                    {title && <h2 className="cms-callout-title">{title}</h2>}
                    {description && <div className="cms-callout-description">{description}</div>}
                    {showButton && (
                        <div className="cms-callout-actions">
                            <a
                                className="button button-primary"
                                target={buttonTargetBlank ? '_blank' : undefined}
                                rel={buttonTargetBlank ? 'noreferrer' : undefined}
                                href={buttonLink}>
                                {buttonText}
                                <em className="mdi mdi-arrow-right icon-right" aria-hidden="true" />
                            </a>
                        </div>
                    )}
                </div>
            </div>
        </Section>
    );
}
