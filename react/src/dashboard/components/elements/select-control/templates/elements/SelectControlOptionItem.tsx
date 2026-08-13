import React, { Fragment } from 'react';
import { OptionType } from '../../SelectControl';
import { clickOnKeyEnterOrSpace } from '../../../../../helpers/wcag';
import classNames from 'classnames';

export default function SelectControlOptionItem<T>({
    option,
    selected,
    selectOption,
}: {
    option: OptionType<T>;
    selected?: boolean;
    selectOption: (option: OptionType<T>) => void;
}) {
    return (
        <div
            id={'option_' + option.id}
            className={classNames('select-control-option', selected && 'active')}
            onClick={(e) => {
                e.stopPropagation();
                selectOption(option);
            }}
            onKeyDown={clickOnKeyEnterOrSpace}
            tabIndex={0}
            aria-selected={selected}
            role="option">
            {option.labelFormat?.map((str, index) => (
                <Fragment key={str.id}>{index != 1 ? <span>{str.value}</span> : <strong>{str.value}</strong>}</Fragment>
            ))}
        </div>
    );
}
