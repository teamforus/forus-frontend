import React, { Fragment, useMemo, useRef, useState } from 'react';
import { uniqueId } from 'lodash';
import { SelectControlOptionsProp } from '../SelectControl';
import classNames from 'classnames';
import useSelectControlKeyEventFDHandlers from '../hooks/useSelectControlKeyEventFDHandlers';
import FDTargetClick from '../../../../modules/frame_director/components/FDTargetClick';
import FDTargetContainerSelect from '../../../../modules/frame_director/tooltip-data/FDTargetContainerSelect';
import Fund from '../../../../props/models/Fund';
import useAssetUrl from '../../../../hooks/useAssetUrl';

export default function SelectControlOptionsFund<T>({
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
    onInputClick,
    searchOption,
    setShowOptions,
    searchInputChanged,
    onOptionsScroll,
    isOptionSelected,
    selectedOptionId,
    disabled,
    modelValue,
    ariaLabelledby,
    multiline = { selected: false, options: true },
}: SelectControlOptionsProp<T>) {
    const [controlId] = useState('select_control_' + uniqueId());
    const input = useRef(null);
    const selectorRef = useRef<HTMLDivElement>(null);
    const optionsRef = useRef<HTMLDivElement>(null);
    const placeholderRef = useRef<HTMLLabelElement>(null);
    const assetUrl = useAssetUrl();

    const multilineSelected = useMemo(() => {
        return multiline === true || (typeof multiline === 'object' && multiline?.selected === true);
    }, [multiline]);

    const multilineOptions = useMemo(() => {
        return multiline === true || (typeof multiline === 'object' && multiline?.options === true);
    }, [multiline]);

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
            className={classNames(
                'form-control',
                'select-control',
                'select-control-funds',
                disabled && 'disabled',
                className,
            )}
            tabIndex={disabled ? -1 : 0}
            role="combobox"
            data-dusk={dusk}
            aria-haspopup="listbox"
            aria-expanded={showOptions}
            aria-labelledby={ariaLabelledby || controlId}
            aria-controls={showOptions ? `${controlId}_options` : null}
            aria-activedescendant={showOptions && selectedOptionId ? `option_${selectedOptionId}` : null}
            ref={selectorRef}
            onKeyDown={(e) => (disabled ? null : onKeyDown(e))}
            onBlur={onBlur}>
            <FDTargetClick
                contentContainer={FDTargetContainerSelect}
                contentContainerClassName={classNames(
                    'select-control-menu-funds',
                    menuClassName,
                    multilineOptions && 'multiline-options',
                )}
                content={(e) => {
                    if (!showOptions) {
                        return null;
                    }

                    return (
                        <div
                            className="select-control-options"
                            id={`${controlId}_options`}
                            role={'listbox'}
                            onClick={null}
                            data-dusk={`${dusk}Options`}
                            ref={optionsRef}
                            style={{ width: `${e.item.observedRect.width}px` }}
                            onKeyDown={(e) => onKeyDown(e)}
                            onScroll={onOptionsScroll}>
                            {optionsFiltered.slice(0, visibleCount)?.map((option) => (
                                <div
                                    key={option.id}
                                    id={`option_${option.id}`}
                                    className={classNames(
                                        'select-control-option',
                                        isOptionSelected(option) && 'active',
                                    )}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        selectOption(option);
                                    }}
                                    onKeyDown={(e) => (e.key === 'Enter' ? e.currentTarget.click() : null)}
                                    tabIndex={0}
                                    data-dusk={`selectControlFundItem${(option.raw as Fund).id}`}
                                    aria-selected={isOptionSelected(option)}
                                    role="option">
                                    <div className="select-control-option-media-funds">
                                        <img
                                            src={
                                                (option.raw as Fund)?.logo?.sizes?.thumbnail ||
                                                assetUrl('/assets/img/placeholders/fund-thumbnail.png')
                                            }
                                            alt=""
                                        />
                                    </div>
                                    {option.labelFormat?.map((str, index) => (
                                        <Fragment key={str.id}>
                                            {index != 1 ? <span>{str.value}</span> : <strong>{str.value}</strong>}
                                        </Fragment>
                                    ))}
                                </div>
                            ))}
                        </div>
                    );
                }}
                align={'start'}
                position={'bottom'}
                showExternal
                show={showOptions}
                setShow={setShowOptions}
                onContentReady={focusFirst}>
                <div
                    className={classNames(
                        'select-control-input',
                        showOptions && 'options',
                        multilineSelected && 'multiline-selected',
                    )}
                    data-dusk="selectControlFunds">
                    {/* Placeholder */}
                    <label
                        htmlFor={controlId}
                        role="presentation"
                        ref={placeholderRef}
                        className="select-control-search form-control"
                        style={{ display: showOptions && allowSearch ? 'none' : 'flex' }}
                        onClick={searchOption}
                        title={placeholderValue || placeholder}>
                        <div className="select-control-search-placeholder">
                            <div className="select-control-search-placeholder-media-funds">
                                <img
                                    src={
                                        (modelValue?.raw as Fund)?.logo?.sizes?.thumbnail ||
                                        assetUrl('/assets/img/icon-my_funds.svg')
                                    }
                                    alt=""
                                />
                            </div>
                            <span className="ellipsis">{placeholderValue || placeholder}</span>
                        </div>
                        <div className="select-control-icon">
                            <em className={classNames('mdi', showOptions ? 'mdi-chevron-up' : 'mdi-chevron-down')} />
                        </div>
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
                                    aria-controls={`${controlId}_options`}
                                    onChange={(e) => setQuery(e.target.value)}
                                    className="select-control-search form-control"
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
