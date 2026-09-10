import React, { useMemo, useRef, useState } from 'react';
import { uniqueId } from 'lodash';
import { SelectControlOptionsProp } from '../SelectControl';
import classNames from 'classnames';
import SelectControlOptionItem from './elements/SelectControlOptionItem';
import useSelectControlKeyEventFDHandlers from '../hooks/useSelectControlKeyEventFDHandlers';
import FDTargetClick from '../../../../modules/frame_director/components/FDTargetClick';
import FDTargetContainerSelect from '../../../../modules/frame_director/tooltip-data/FDTargetContainerSelect';
import type { FDPosition } from '../../../../modules/frame_director/types';

export default function SelectControlOptions<T>({
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
    ariaLabelledby,
    multiline = { selected: false, options: true },
}: SelectControlOptionsProp<T>) {
    const [controlId] = useState('select_control_' + uniqueId());
    const [menuPosition, setMenuPosition] = useState<FDPosition>('bottom');
    const input = useRef(null);
    const selectorRef = useRef<HTMLDivElement>(null);
    const optionsRef = useRef<HTMLDivElement>(null);
    const placeholderRef = useRef<HTMLLabelElement>(null);

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
            className={classNames('form-control', 'select-control', disabled && 'disabled', className)}
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
                contentContainerClassName={classNames(menuClassName, multilineOptions && 'multiline-options')}
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
                                <SelectControlOptionItem
                                    key={option.id}
                                    option={option}
                                    selected={isOptionSelected(option)}
                                    selectOption={(option) => {
                                        selectOption(option);
                                        e.close();
                                    }}
                                />
                            ))}
                        </div>
                    );
                }}
                align={'start'}
                position={'bottom'}
                showExternal
                show={showOptions}
                setShow={setShowOptions}
                onPositionChange={setMenuPosition}
                onContentReady={focusFirst}>
                <div
                    className={classNames(
                        'select-control-input',
                        showOptions && 'options',
                        showOptions && menuPosition === 'top' && 'options-top',
                        multilineSelected && 'multiline-selected',
                    )}>
                    {/* Placeholder */}
                    <span
                        role="presentation"
                        ref={placeholderRef}
                        className="select-control-search form-control"
                        onClick={searchOption}
                        style={{ display: showOptions && allowSearch ? 'none' : 'flex' }}
                        aria-label={placeholderValue || placeholder}>
                        <span className="select-control-search-placeholder">{placeholderValue || placeholder}</span>
                        <span className={'select-control-icon'}>
                            <em className={classNames('mdi', showOptions ? 'mdi-chevron-up' : 'mdi-chevron-down')} />
                        </span>
                    </span>

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
