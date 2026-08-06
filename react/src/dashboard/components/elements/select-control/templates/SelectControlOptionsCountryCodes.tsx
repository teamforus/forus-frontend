import React, { useRef, useState } from 'react';
import classNames from 'classnames';
import { uniqueId } from 'lodash';
import FDTargetClick from '../../../../modules/frame_director/components/FDTargetClick';
import FDTargetContainerSelect from '../../../../modules/frame_director/tooltip-data/FDTargetContainerSelect';
import { SelectControlOptionsProp } from '../SelectControl';
import SelectControlOptionItem from './elements/SelectControlOptionItem';
import useSelectControlKeyEventFDHandlers from '../hooks/useSelectControlKeyEventFDHandlers';

export default function SelectControlOptionsCountryCodes<T>({
    query,
    setQuery,
    optionsFiltered,
    placeholderValue,
    placeholder,
    selectOption,
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
}: SelectControlOptionsProp<T>) {
    const [controlId] = useState(uniqueId('select_control_'));
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
            className={classNames('select-control', 'select-control-country-codes', className)}
            tabIndex={0}
            role="button"
            aria-haspopup="listbox"
            aria-expanded={showOptions}
            aria-labelledby={controlId}
            aria-controls={`${controlId}_options`}
            ref={selectorRef}
            onKeyDown={onKeyDown}
            onBlur={onBlur}>
            <FDTargetClick
                contentContainer={FDTargetContainerSelect}
                contentContainerClassName={classNames('select-control-menu-country-codes', menuClassName)}
                content={() => {
                    if (!showOptions) {
                        return null;
                    }

                    return (
                        <div
                            className="select-control-input select-control-container-country-codes"
                            ref={optionsRef}
                            onKeyDown={onKeyDown}>
                            <div className="select-control-search-container">
                                <input
                                    id={controlId}
                                    placeholder="Zoeken"
                                    ref={input}
                                    value={query}
                                    onClick={onInputClick}
                                    onChange={(e) => setQuery(e.target.value)}
                                    className="select-control-search form-control"
                                />

                                {query ? (
                                    <div
                                        className="select-control-search-clear"
                                        onClick={() => {
                                            setQuery('');
                                            searchInputChanged();
                                        }}
                                        aria-label="Annuleren">
                                        <em className="mdi mdi-close-circle" />
                                    </div>
                                ) : (
                                    <div className="select-control-search-icon-country-codes">
                                        <em className="mdi mdi-magnify" />
                                    </div>
                                )}
                            </div>
                            <div
                                className="select-control-options"
                                id={`${controlId}_options`}
                                role="listbox"
                                onScroll={onOptionsScroll}>
                                {optionsFiltered.slice(0, visibleCount)?.map((option) => (
                                    <SelectControlOptionItem
                                        key={option.id}
                                        selected={isOptionSelected(option)}
                                        option={option}
                                        selectOption={selectOption}
                                    />
                                ))}
                            </div>
                        </div>
                    );
                }}
                align="start"
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
                        className="select-control-search form-control"
                        onClick={searchOption}
                        title={placeholderValue || placeholder}>
                        <span className="select-control-search-placeholder">
                            {modelValue?.raw['code'] + ' +' + modelValue?.raw['dialCode']}
                        </span>
                        <span className="select-control-icon">
                            <em className={classNames('mdi', showOptions ? 'mdi-chevron-up' : 'mdi-chevron-down')} />
                        </span>
                    </label>
                </div>
            </FDTargetClick>
        </div>
    );
}
