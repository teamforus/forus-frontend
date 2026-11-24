import React, { Fragment } from 'react';
import classNames from 'classnames';
import { BlockEmptyProps } from './types';

export default function BlockEmpty({
    title,
    description,
    imageIcon,
    imageIconImg,
    imageIconSvg,
    textAlign = 'center',
    variant = 'default',
    dataDusk,
    actions,
}: BlockEmptyProps) {
    const descriptionLines = description?.split('\n') || [];

    return (
        <div
            className={classNames(
                'block',
                'block-empty',
                variant === 'compact' && 'block-empty-compact',
                textAlign === 'left' && 'text-left',
                textAlign === 'right' && 'text-right',
                textAlign === 'center' && 'text-center',
            )}
            data-dusk={dataDusk}>
            {imageIconImg && (
                <div className="empty-icon">
                    <img className="empty-icon-img empty-icon-img-border" src={imageIconImg} alt={''} />
                </div>
            )}

            {imageIconSvg && (
                <div className="empty-icon">
                    <div className="empty-icon-img empty-icon-img-border">{imageIconSvg}</div>
                </div>
            )}

            {imageIcon && (
                <div className="empty-image">
                    <img src={imageIcon} alt="" />
                </div>
            )}

            {title && <div className="empty-title">{title}</div>}

            {descriptionLines.length > 0 && (
                <div className="empty-details">
                    {descriptionLines.map((value, index) => (
                        <Fragment key={index}>
                            {value}
                            {index < descriptionLines.length - 1 && <br />}
                        </Fragment>
                    ))}
                </div>
            )}

            {actions && <div className="empty-actions">{actions}</div>}
        </div>
    );
}
