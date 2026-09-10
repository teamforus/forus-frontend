import React, {
    FunctionComponent,
    HTMLInputAutoCompleteAttribute,
    UIEventHandler,
    useCallback,
    useEffect,
    useMemo,
    useState,
} from 'react';
import './styles/ui-select.scss';
import { uniqueId } from 'lodash';
import SelectControlOptions from './templates/SelectControlOptions';

type SelectControlProps<T> = {
    id?: string;
    options?: Array<T>;
    propKey?: string | null;
    propValue?: string | null;
    strict?: boolean;
    allowSearch?: boolean;
    autoClear?: boolean;
    value?: T | string | number | boolean;
    onChange: CallableFunction;
    onCreate?: CallableFunction;
    onSearchChange?: CallableFunction;
    placeholder?: string | null;
    disabled?: boolean;
    className?: string;
    menuClassName?: string;
    scrollSize?: number;
    dusk?: string;
    optionsComponent?: FunctionComponent<SelectControlOptionsProp<T>>;
    multiline?: boolean | { selected: boolean; options: boolean };
    searchAutoComplete?: HTMLInputAutoCompleteAttribute;
    ariaLabelledby?: string;
};

export interface OptionType<T> {
    raw: T;
    id: string;
    label: string;
    value: unknown;
    _index: number;
    labelFormat?: Array<{ id: string; value: string }>;
}

export type SelectControlOptionsProp<T> = {
    id?: string;
    dusk: string;
    query: string;
    setQuery: (query: string) => void;
    optionsFiltered: Array<OptionType<T>>;
    placeholderValue: string;
    placeholder: string;
    showOptions: boolean;
    selectOption: (option: OptionType<T>) => void;
    allowSearch: boolean;
    visibleCount: number;
    setVisibleCount: (visibleCount: number) => void;
    className?: string;
    menuClassName?: string;
    onInputClick: (e: React.MouseEvent<HTMLInputElement>) => void;
    modelValue?: OptionType<T> | null;
    searchOption: (e: React.MouseEvent<HTMLElement>) => void;
    setShowOptions?: React.Dispatch<React.SetStateAction<boolean>>;
    searchInputChanged: () => void;
    searchAutoComplete?: HTMLInputAutoCompleteAttribute;
    onOptionsScroll: UIEventHandler;
    isOptionSelected: (option: OptionType<T>) => boolean;
    selectedOptionId?: string | null;
    disabled?: boolean;
    rawValue?: unknown;
    propKey?: string | null;
    propValue?: string | null;
    ariaLabelledby?: string;
    multiline?: boolean | { selected: boolean; options: boolean };
};

export default function SelectControl<T>({
    id = null,
    propKey = null,
    propValue = 'name',
    options = [],
    strict = false,
    allowSearch = false,
    autoClear = true,
    value = null,
    placeholder = null,
    onChange = null,
    onSearchChange = null,
    disabled = false,
    className = null,
    menuClassName = null,
    scrollSize = 50,
    optionsComponent = SelectControlOptions,
    searchAutoComplete = 'off',
    dusk = null,
    multiline,
    ariaLabelledby = null,
}: SelectControlProps<T>) {
    const [query, setQuery] = useState('');
    const [modelValue, setModelValue] = useState<OptionType<T> | null>(null);
    const [showOptions, setShowOptions] = useState(false);
    const [visibleCount, setVisibleCount] = useState(scrollSize);
    const [scrollEndThreshold] = useState(10);

    const [placeholderValue, setPlaceholderValue] = useState('');

    const optionsPrepared = useMemo(() => {
        return (
            options?.map((option) => ({
                id: uniqueId(),
                label: option[propValue]?.toString()?.toLowerCase() || '',
                value: null,
                raw: option,
                _index: -1,
            })) || []
        );
    }, [options, propValue]);

    const isOptionSelected = useCallback(
        (option: OptionType<T>) => {
            if (strict) {
                return propKey ? option.raw[propKey] === value : option.raw === value;
            }

            return propKey ? option.raw[propKey] == value : option.raw == value;
        },
        [propKey, strict, value],
    );

    const findValue = useCallback(() => {
        return optionsPrepared.find(isOptionSelected);
    }, [isOptionSelected, optionsPrepared]);

    const selectedOptionId = useMemo(() => {
        return findValue()?.id ?? null;
    }, [findValue]);

    const prepareOptions = useCallback(
        (search: string) => {
            const options = optionsPrepared
                .map((option) => ({ ...option, _index: option.label.indexOf(search) }))
                .filter((option) => option._index > -1);

            if (search) {
                options.sort((a, b) => a._index - b._index);
            }

            return options;
        },
        [optionsPrepared],
    );

    const optionsFiltered = useMemo(() => {
        const search = query.toLowerCase().trim();
        const search_len = search.length;
        const options = allowSearch ? prepareOptions(search) : optionsPrepared;

        return options.map((option: OptionType<T>) => {
            const end = -(option.raw[propValue]?.length - (option._index + search_len));
            const labelFormat = allowSearch
                ? [
                      { id: uniqueId(), value: option.raw[propValue].slice(0, option._index) },
                      {
                          id: uniqueId(),
                          value: option.raw[propValue].slice(option._index, option._index + search_len),
                      },
                      { id: uniqueId(), value: end < 0 ? option.raw[propValue].slice(end) : '' },
                  ]
                : [{ id: uniqueId(), value: option.raw[propValue] }];

            return { ...option, labelFormat };
        });
    }, [query, allowSearch, prepareOptions, optionsPrepared, propValue]);

    const searchInputChanged = useCallback(() => {
        setVisibleCount(scrollSize);
    }, [scrollSize]);

    const onInputClick = useCallback(
        (e: React.MouseEvent<HTMLInputElement>) => {
            e.stopPropagation();

            if (allowSearch && autoClear) {
                setQuery('');
            }

            searchInputChanged();
        },
        [allowSearch, autoClear, searchInputChanged],
    );

    const searchOption = useCallback(() => {
        if (disabled || showOptions) {
            setShowOptions(false);
            return;
        }

        setShowOptions(true);

        if (allowSearch && strict && modelValue && modelValue[propValue]) {
            setQuery(modelValue[propValue]);
        }

        searchInputChanged();
    }, [disabled, showOptions, allowSearch, strict, modelValue, propValue, searchInputChanged]);

    const selectOption = useCallback(
        (option: OptionType<T>) => {
            setModelValue(option);
            setQuery('');
            onChange(propKey ? option.raw[propKey] : option.raw);

            setShowOptions(false);

            if (onSearchChange) {
                onSearchChange();
            }
        },
        [onChange, onSearchChange, propKey],
    );

    const onOptionsScroll: UIEventHandler = useCallback(
        (e) => {
            const top = e.currentTarget.scrollTop + e.currentTarget.clientHeight;

            if (top >= e.currentTarget.scrollHeight - scrollEndThreshold) {
                setVisibleCount((visibleCount) => visibleCount + scrollEndThreshold);
            }
        },
        [scrollEndThreshold],
    );

    useEffect(() => {
        setModelValue((oldValue: OptionType<T>) => {
            const newValue = findValue();

            if (
                oldValue &&
                newValue &&
                (propKey ? oldValue.raw[propKey] == newValue.raw[propKey] : oldValue.raw == newValue.raw) &&
                (propValue ? oldValue.raw[propValue] == newValue.raw[propValue] : oldValue.label == newValue.label)
            ) {
                return oldValue;
            }

            return oldValue != newValue ? newValue : oldValue;
        });
    }, [findValue, propKey, propValue]);

    useEffect(() => {
        if (modelValue) {
            setPlaceholderValue(propValue ? modelValue.raw[propValue] : modelValue.label);
        }
    }, [modelValue, propValue]);

    useEffect(() => {
        searchInputChanged();
        setVisibleCount(scrollSize);
    }, [query, scrollSize, searchInputChanged]);

    return React.createElement(optionsComponent, {
        id,
        dusk,
        optionsFiltered,
        selectOption,
        placeholder,
        placeholderValue,
        showOptions,
        allowSearch,
        visibleCount,
        setVisibleCount,
        onInputClick,
        query,
        setQuery,
        searchOption,
        setShowOptions,
        searchInputChanged,
        onOptionsScroll,
        isOptionSelected,
        selectedOptionId,
        modelValue,
        className,
        menuClassName,
        rawValue: value,
        disabled,
        propKey,
        propValue,
        multiline,
        searchAutoComplete,
        ariaLabelledby,
    });
}
