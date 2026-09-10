import React, { Fragment, useRef, useState } from 'react';
import classNames from 'classnames';
import { uniqueId } from 'lodash';
import { clickOnKeyEnterOrSpace } from '../../../../helpers/wcag';
import FDTargetClick from '../../../../modules/frame_director/components/FDTargetClick';
import FDTargetContainerSelect from '../../../../modules/frame_director/tooltip-data/FDTargetContainerSelect';
import { SelectControlOptionsProp } from '../SelectControl';
import useSelectControlKeyEventFDHandlers from '../hooks/useSelectControlKeyEventFDHandlers';

export default function SelectControlOptionsLang<T>({
    id,
    dusk,
    query,
    setQuery,
    optionsFiltered,
    placeholderValue,
    placeholder,
    selectOption,
    allowSearch,
    showOptions,
    visibleCount,
    className,
    menuClassName,
    modelValue,
    onInputClick,
    searchOption,
    setShowOptions,
    searchInputChanged,
    onOptionsScroll,
    isOptionSelected,
    rawValue,
    disabled,
    propKey,
}: SelectControlOptionsProp<T>) {
    const [controlId] = useState('select_control_' + uniqueId());
    const input = useRef(null);
    const selectorRef = useRef<HTMLDivElement>(null);
    const optionsRef = useRef<HTMLDivElement>(null);
    const placeholderRef = useRef<HTMLLabelElement>(null);

    const { onKeyDown, onBlur, focusFirst } = useSelectControlKeyEventFDHandlers(
        selectorRef,
        optionsRef,
        placeholderRef,
        showOptions,
        setShowOptions,
    );

    return (
        <div
            id={id}
            className={classNames('select-control', 'select-control-lang', disabled && 'disabled', className)}
            tabIndex={0}
            role="button"
            data-dusk={dusk}
            aria-haspopup="listbox"
            aria-expanded={showOptions}
            aria-labelledby={allowSearch ? controlId : null}
            aria-controls={`${controlId}_options`}
            ref={selectorRef}
            onKeyDown={onKeyDown}
            onBlur={onBlur}>
            <FDTargetClick
                contentContainer={FDTargetContainerSelect}
                contentContainerClassName={classNames('select-control-menu-lang', menuClassName)}
                content={() => {
                    if (!showOptions) {
                        return null;
                    }

                    return (
                        <div
                            className="select-control-options"
                            id={`${controlId}_options`}
                            role="listbox"
                            onClick={null}
                            ref={optionsRef}
                            onKeyDown={onKeyDown}
                            onScroll={onOptionsScroll}>
                            {optionsFiltered.slice(0, visibleCount)?.map((option) => (
                                <div
                                    className={classNames(
                                        'select-control-option',
                                        isOptionSelected(option) && 'active',
                                    )}
                                    key={option.id}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        selectOption(option);
                                    }}
                                    onKeyDown={clickOnKeyEnterOrSpace}
                                    tabIndex={0}
                                    aria-selected={isOptionSelected(option)}
                                    role="option">
                                    {option.labelFormat?.map((str, index) => (
                                        <Fragment key={str.id}>
                                            {option?.raw?.[propKey]?.toUpperCase() || ''}
                                            <div className="select-control-option-separator-lang" />
                                            <div
                                                className={classNames(
                                                    'select-control-option-name-lang',
                                                    option?.raw?.[propKey]?.toUpperCase() === 'AR' &&
                                                        'select-control-option-name-right-lang',
                                                )}>
                                                {index != 1 ? <span>{str.value}</span> : <strong>{str.value}</strong>}
                                            </div>
                                            {isOptionSelected(option) && (
                                                <em className="select-control-option-check-lang mdi mdi-check" />
                                            )}
                                        </Fragment>
                                    ))}
                                </div>
                            ))}
                        </div>
                    );
                }}
                align="end"
                position="bottom"
                showExternal
                show={showOptions}
                setShow={setShowOptions}
                onContentReady={focusFirst}>
                <div className={classNames('select-control-input', showOptions && 'options')}>
                    {/* Placeholder */}
                    <label
                        htmlFor={controlId}
                        ref={placeholderRef}
                        className="select-control-search"
                        onClick={searchOption}
                        style={{ display: showOptions && allowSearch ? 'none' : 'flex' }}
                        title={placeholderValue || placeholder}>
                        <em className="mdi mdi-web select-control-search-icon-lang" />
                        <span className="select-control-search-placeholder">
                            {modelValue?.raw[propKey]?.toUpperCase() ||
                                placeholderValue?.toUpperCase() ||
                                rawValue?.toString()?.toUpperCase()}
                        </span>
                        <span className="select-control-icon">
                            <em className={classNames('mdi', showOptions ? 'mdi-menu-up' : 'mdi-menu-down')} />
                        </span>
                    </label>

                    {allowSearch && (
                        <div className="select-control-search-container">
                            {showOptions && (
                                <input
                                    id={controlId}
                                    placeholder={placeholder || placeholderValue}
                                    ref={input}
                                    value={query}
                                    tabIndex={0}
                                    onClick={onInputClick}
                                    onChange={(e) => setQuery(e.target.value)}
                                    className="select-control-search"
                                />
                            )}

                            {query && (
                                <div
                                    className="select-control-search-clear"
                                    onClick={() => {
                                        setQuery('');
                                        searchInputChanged();
                                    }}
                                    aria-label="Annuleren">
                                    <em className="mdi mdi-close-circle" />
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </FDTargetClick>
        </div>
    );
}
