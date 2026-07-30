import React, { Fragment } from 'react';
import Markdown from '../../markdown/Markdown';
import classNames from 'classnames';
import Section from '../../sections/Section';
import ImplementationCmsBlock from '../../../../props/models/ImplementationCmsBlock';
import Label from '../../label/Label';
import { stringValue, valueIsTrue } from '../helpers/values';
import { cmsSectionClassName, cmsSectionStyle } from '../helpers/section';

export default function CmsInfoBlockNext({ block }: { block: ImplementationCmsBlock }) {
    const values = block.values || {};
    const valuesHtml = block.values_html || {};
    const blocksPerRow = Math.min(Math.max(Number(values.blocks_per_row || 1), 1), 3);
    const title = stringValue(values.section_title);
    const descriptionHtml = valuesHtml.section_description || '';
    const posts = (block.items || []).filter((item) => item.item_type_key === 'post');

    if (!title && !descriptionHtml && posts.length === 0) {
        return null;
    }

    return (
        <Section type={'cms-next'} style={cmsSectionStyle(values)} className={cmsSectionClassName(values)}>
            <div className="block block-cms">
                {title && <h2 className="section-title">{title}</h2>}
                {descriptionHtml && <Markdown content={descriptionHtml} />}
                {posts.length > 0 && (
                    <div
                        className={classNames(
                            'block block-cms-funds',
                            blocksPerRow > 1 && 'block-cms-funds-compact',
                            blocksPerRow === 2 && 'block-cms-funds-2-in-row',
                        )}>
                        {posts.map((item) => {
                            const itemValues = item.values || {};
                            const itemValuesHtml = item.values_html || {};
                            const buttonEnabled = valueIsTrue(itemValues.button_enabled);
                            const buttonTargetBlank = valueIsTrue(itemValues.button_target_blank);
                            const buttonText = stringValue(itemValues.button_text);
                            const buttonLinkLabel =
                                stringValue(itemValues.button_link_label) || buttonText || undefined;
                            const shouldMakeItemClickable = buttonEnabled && blocksPerRow > 1;
                            const TitleTag = title ? 'h3' : 'h2';

                            const content = (
                                <Fragment>
                                    {item.media?.media?.sizes?.public && (
                                        <div className="fund-media">
                                            <img src={item.media.media.sizes.public} alt="" />
                                        </div>
                                    )}

                                    <div className="fund-information">
                                        {stringValue(itemValues.title) && (
                                            <TitleTag className="fund-title">{stringValue(itemValues.title)}</TitleTag>
                                        )}
                                        {stringValue(itemValues.label) && (
                                            <Label type="primary" className="fund-label">
                                                {stringValue(itemValues.label)}
                                            </Label>
                                        )}

                                        <div className="fund-description">
                                            <Markdown content={itemValuesHtml.description || ''} />
                                        </div>

                                        {buttonEnabled && (
                                            <div className="fund-button">
                                                <a
                                                    className="button button-primary fund-button-button"
                                                    aria-label={buttonLinkLabel}
                                                    target={buttonTargetBlank ? '_blank' : '_self'}
                                                    rel={buttonTargetBlank ? 'noreferrer' : ''}
                                                    href={stringValue(itemValues.button_link)}>
                                                    {buttonText}
                                                    <div
                                                        className="mdi mdi-arrow-right icon-right"
                                                        aria-hidden="true"
                                                    />
                                                </a>

                                                {blocksPerRow > 1 && (
                                                    <a
                                                        className="button button-text button-text-primary fund-button-link"
                                                        aria-label={buttonLinkLabel}
                                                        target={buttonTargetBlank ? '_blank' : '_self'}
                                                        rel={buttonTargetBlank ? 'noreferrer' : ''}
                                                        href={stringValue(itemValues.button_link)}>
                                                        {buttonText}
                                                    </a>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </Fragment>
                            );

                            return (
                                <div
                                    key={item.id}
                                    className={classNames(
                                        'fund-item',
                                        shouldMakeItemClickable && 'fund-item-clickable',
                                    )}>
                                    {content}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </Section>
    );
}
