import React, { CSSProperties, Fragment, useMemo } from 'react';
import classNames from 'classnames';
import Section from '../../sections/Section';
import ImplementationCmsBlock from '../../../../props/models/ImplementationCmsBlock';
import { stringValue, valueIsTrue } from '../helpers/values';
import { cmsSectionClassName, cmsSectionStyle } from '../helpers/section';

const overlayLayouts = ['image_overlay_left', 'image_overlay_center', 'image_overlay_right'];

export default function CmsBannerBlockNext({ block }: { block: ImplementationCmsBlock }) {
    const values = block.values || {};
    const image = block.media?.image;
    const imageUrl = image?.sizes?.large || image?.sizes?.public || image?.sizes?.original;
    const layout = stringValue(values.layout);
    const isOverlay = overlayLayouts.includes(layout);
    const title = stringValue(values.section_title);
    const description = stringValue(values.section_description);
    const label = stringValue(values.label);
    const buttonLabel = stringValue(values.button_label);
    const linkLabel = stringValue(values.link_label);
    const url = stringValue(values.url);
    const linkArea = stringValue(values.link_area);
    const targetBlank = valueIsTrue(values.target_blank);
    const labelEnabled = valueIsTrue(values.label_enabled) && label;
    const buttonEnabled = valueIsTrue(values.button_enabled) && buttonLabel;
    const buttonLinkEnabled = Boolean(url && buttonEnabled && linkArea === 'button');
    const bannerLinkEnabled = Boolean(url && !buttonLinkEnabled);
    const buttonVisible = Boolean(url && buttonEnabled);
    const textBackgroundColor = stringValue(values.text_background_color);
    const textColor = stringValue(values.text_color);
    const labelBackgroundColor = stringValue(values.label_background_color);
    const labelTextColor = stringValue(values.label_text_color);
    const buttonColor = stringValue(values.button_color);
    const buttonTextColor = stringValue(values.button_text_color);

    const contentStyle = useMemo<CSSProperties | undefined>(() => {
        const style: CSSProperties = {};

        if (textColor) {
            style.color = textColor;
        }

        if (!isOverlay && textBackgroundColor) {
            style.backgroundColor = textBackgroundColor;
        }

        return Object.keys(style).length > 0 ? style : undefined;
    }, [isOverlay, textBackgroundColor, textColor]);

    const overlayStyle = useMemo<CSSProperties | undefined>(() => {
        return isOverlay && textBackgroundColor ? { backgroundColor: textBackgroundColor } : undefined;
    }, [isOverlay, textBackgroundColor]);

    const labelStyle = useMemo<CSSProperties | undefined>(() => {
        const style: CSSProperties = {};

        if (labelBackgroundColor) {
            style.backgroundColor = labelBackgroundColor;
        }

        if (labelTextColor) {
            style.color = labelTextColor;
        }

        return Object.keys(style).length > 0 ? style : undefined;
    }, [labelBackgroundColor, labelTextColor]);

    const buttonStyle = useMemo<CSSProperties | undefined>(() => {
        const style: CSSProperties = {};

        if (buttonColor) {
            style.backgroundColor = buttonColor;
            style.borderColor = buttonColor;
        }

        if (buttonTextColor) {
            style.color = buttonTextColor;
        }

        return Object.keys(style).length > 0 ? style : undefined;
    }, [buttonColor, buttonTextColor]);

    if (!imageUrl) {
        return null;
    }

    const buttonContent = (
        <Fragment>
            {buttonLabel}
            <span className="mdi mdi-arrow-right icon-right" aria-hidden="true" />
        </Fragment>
    );

    const content = (
        <div className="cms-banner-content" style={contentStyle}>
            {labelEnabled && (
                <div className={classNames('label', 'label-primary', 'cms-banner-label')} style={labelStyle}>
                    {label}
                </div>
            )}
            {title && <h2 className="cms-banner-title">{title}</h2>}
            {description && <p className="cms-banner-description">{description}</p>}
            {buttonVisible &&
                (buttonLinkEnabled ? (
                    <a
                        className="button button-primary cms-banner-button"
                        href={url}
                        target={targetBlank ? '_blank' : '_self'}
                        rel={targetBlank ? 'noreferrer' : undefined}
                        aria-label={linkLabel || undefined}
                        style={buttonStyle}>
                        {buttonContent}
                    </a>
                ) : (
                    <span className="button button-primary cms-banner-button" style={buttonStyle}>
                        {buttonContent}
                    </span>
                ))}
        </div>
    );

    const blockClassName = classNames(
        'block block-cms-banner',
        bannerLinkEnabled && 'block-cms-banner-clickable',
        layout === 'image_left' && 'block-cms-banner-image-left',
        layout === 'image_right' && 'block-cms-banner-image-right',
        layout === 'image_overlay_left' && 'block-cms-banner-overlay',
        layout === 'image_overlay_left' && 'block-cms-banner-overlay-left',
        layout === 'image_overlay_center' && 'block-cms-banner-overlay',
        layout === 'image_overlay_center' && 'block-cms-banner-overlay-center',
        layout === 'image_overlay_right' && 'block-cms-banner-overlay',
        layout === 'image_overlay_right' && 'block-cms-banner-overlay-right',
    );

    const blockContent = isOverlay ? (
        <Fragment>
            <div className="cms-banner-media">
                <img src={imageUrl} alt="" />
            </div>
            <div className="cms-banner-image-overlay" style={overlayStyle} />
            <div className="wrapper cms-banner-wrapper">{content}</div>
        </Fragment>
    ) : (
        <Fragment>
            <div className="cms-banner-media">
                <img src={imageUrl} alt="" />
            </div>
            {content}
        </Fragment>
    );

    return (
        <Section
            type={'cms-next'}
            wrapper={!isOverlay}
            style={cmsSectionStyle(values)}
            className={cmsSectionClassName(values)}>
            {bannerLinkEnabled ? (
                <a
                    className={blockClassName}
                    href={url}
                    target={targetBlank ? '_blank' : '_self'}
                    rel={targetBlank ? 'noreferrer' : undefined}
                    aria-label={linkLabel || undefined}>
                    {blockContent}
                </a>
            ) : (
                <div className={blockClassName}>{blockContent}</div>
            )}
        </Section>
    );
}
