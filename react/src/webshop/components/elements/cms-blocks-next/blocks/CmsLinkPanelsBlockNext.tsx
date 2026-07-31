import React, { useMemo } from 'react';
import classNames from 'classnames';
import Markdown from '../../markdown/Markdown';
import Section from '../../sections/Section';
import ImplementationCmsBlock from '../../../../props/models/ImplementationCmsBlock';
import { stringValue, valueIsTrue } from '../helpers/values';
import { cmsSectionClassName, cmsSectionStyle } from '../helpers/section';

const columnOptions = [1, 2, 3];

export default function CmsLinkPanelsBlockNext({ block }: { block: ImplementationCmsBlock }) {
    const values = block.values || {};
    const valuesHtml = block.values_html || {};
    const title = stringValue(values.section_title);
    const descriptionHtml = valuesHtml.section_description || '';
    const columnsValue = Number(values.columns || 2);
    const columns = columnOptions.includes(columnsValue) ? columnsValue : 2;
    const PanelTitleTag = title ? 'h3' : 'h2';

    const panels = useMemo(() => {
        return (block.items || [])
            .filter((item) => item.item_type_key === 'panel')
            .map((item) => {
                const itemValues = item.values || {};
                const itemValuesHtml = item.values_html || {};
                const buttonText = stringValue(itemValues.button_text);
                const buttonLink = stringValue(itemValues.button_link);

                return {
                    id: item.id,
                    title: stringValue(itemValues.title),
                    description: stringValue(itemValues.description),
                    linksHtml: itemValuesHtml.links || '',
                    buttonText,
                    buttonLink,
                    buttonTargetBlank: valueIsTrue(itemValues.button_target_blank),
                    hasButton: Boolean(buttonText && buttonLink),
                };
            })
            .filter((panel) => panel.title || panel.description || panel.linksHtml || panel.hasButton);
    }, [block.items]);

    if (!title && !descriptionHtml && panels.length === 0) {
        return null;
    }

    return (
        <Section type={'cms-next'} style={cmsSectionStyle(values)} className={cmsSectionClassName(values)}>
            <div
                className={classNames(
                    'block block-cms-link-panels',
                    columns === 1 && 'block-cms-link-panels-1-column',
                    columns === 2 && 'block-cms-link-panels-2-columns',
                    columns === 3 && 'block-cms-link-panels-3-columns',
                )}>
                {(title || descriptionHtml) && (
                    <div className="cms-link-panels-header">
                        {title && <h2 className="cms-link-panels-title">{title}</h2>}
                        {descriptionHtml && (
                            <Markdown className="cms-link-panels-description" content={descriptionHtml} />
                        )}
                    </div>
                )}

                {panels.length > 0 && (
                    <div className="cms-link-panels-items">
                        {panels.map((panel) => (
                            <div className="cms-link-panels-panel" key={panel.id}>
                                {panel.title && (
                                    <PanelTitleTag className="cms-link-panels-panel-title">{panel.title}</PanelTitleTag>
                                )}
                                {panel.description && (
                                    <p className="cms-link-panels-panel-description">{panel.description}</p>
                                )}
                                {panel.linksHtml && (
                                    <Markdown className="cms-link-panels-panel-links" content={panel.linksHtml} />
                                )}
                                {panel.hasButton && (
                                    <a
                                        className="cms-link-panels-panel-button"
                                        href={panel.buttonLink}
                                        target={panel.buttonTargetBlank ? '_blank' : undefined}
                                        rel={panel.buttonTargetBlank ? 'noreferrer' : undefined}>
                                        {panel.buttonText}
                                    </a>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </Section>
    );
}
