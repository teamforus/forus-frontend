import React from 'react';
import classNames from 'classnames';
import useTranslate from '../../../../../dashboard/hooks/useTranslate';
import FundsFilterGroup from './base-group/FundsFilterGroup';
import { clickOnKeyEnter } from '../../../../../dashboard/helpers/wcag';
import Tag from '../../../../../dashboard/props/models/Tag';

export default function FundsFilterGroupTags({
    value,
    setValue,
    openByDefault = false,
    tags,
}: {
    value: number[];
    setValue: (selected: number[]) => void;
    openByDefault?: boolean;
    tags: Array<Partial<Tag>>;
}) {
    const translate = useTranslate();

    return (
        <FundsFilterGroup
            dusk={'fundFilterGroupTags'}
            title={translate('funds.labels.category')}
            controls={'select_category'}
            openByDefault={openByDefault}
            content={(isOpen) => (
                <div
                    id="select_category"
                    className="showcase-aside-group-body"
                    role="group"
                    aria-label={translate('funds.labels.category')}
                    hidden={!isOpen}>
                    <div className="showcase-aside-block-options">
                        {tags?.map((tag) => {
                            const isActive = value?.includes(tag.id);

                            return (
                                <div
                                    key={tag.id}
                                    role="button"
                                    tabIndex={0}
                                    aria-pressed={isActive}
                                    aria-label={tag.name}
                                    onClick={() => {
                                        setValue(
                                            value?.includes(tag.id)
                                                ? value?.filter((id) => id !== tag.id)
                                                : [...value, tag.id],
                                        );
                                    }}
                                    onKeyDown={(e) => clickOnKeyEnter(e, true)}
                                    className={classNames(
                                        'showcase-aside-block-option',
                                        isActive && 'showcase-aside-block-option-active',
                                    )}
                                    data-dusk={'fundTagFilterOption' + tag.id}>
                                    <div className="showcase-aside-block-option-check">
                                        <em className="mdi mdi-check" aria-hidden="true" />
                                    </div>
                                    <div className="showcase-aside-block-option-name">{tag.name}</div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        />
    );
}
