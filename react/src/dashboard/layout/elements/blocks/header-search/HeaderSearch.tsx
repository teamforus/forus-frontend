import React, { useCallback, useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import ClickOutside from '../../../../modules/click-outside/ClickOutside';
import { useStateRoutes } from '../../../../modules/state_router/Router';
import HeaderSearchBlock from './HeaderSearchBlock';
import { HeaderSearchBlockConfig, HeaderSearchBlockState } from './types';
import BlockEmpty from '../../../../components/elements/block-empty/BlockEmpty';

const SEARCH_DELAY = 1000;

export default function HeaderSearch({
    blocks,
    organizationId,
    limit = 3,
    mobile = false,
    onClose = null,
}: {
    blocks: Array<HeaderSearchBlockConfig>;
    organizationId: number;
    limit?: number;
    mobile?: boolean;
    onClose?: () => void;
}) {
    const { route } = useStateRoutes();

    const [value, setValue] = useState('');
    const [query, setQuery] = useState('');
    const [open, setOpen] = useState(false);
    const [blockStates, setBlockStates] = useState<Record<string, HeaderSearchBlockState>>({});

    const inputRef = useRef<HTMLInputElement>(null);

    const states = blocks.map((block) => blockStates[block.key]);
    const loading = !!query && states.some((state) => !state || state === 'loading');
    const empty = !!query && !loading && !states.includes('found');
    const showDropdown = open && !!value.trim() && !!query;

    const inputId = mobile ? 'header_search_mobile' : 'header_search';
    const resultsId = `${inputId}_results`;

    const updateBlockState = useCallback((key: string, state: HeaderSearchBlockState) => {
        setBlockStates((states) => ({ ...states, [key]: state }));
    }, []);

    const clear = useCallback(() => {
        setValue('');
        setQuery('');
        setOpen(false);
    }, []);

    const navigateAway = useCallback(() => {
        clear();
        onClose?.();
    }, [clear, onClose]);

    useEffect(() => {
        const nextQuery = value.trim();

        if (!nextQuery) {
            setQuery('');
            return;
        }

        const timeout = window.setTimeout(() => setQuery(nextQuery), SEARCH_DELAY);

        return () => window.clearTimeout(timeout);
    }, [value]);

    useEffect(() => {
        if (!query) {
            setBlockStates({});
        }
    }, [query]);

    useEffect(() => {
        clear();
    }, [route?.state?.name, organizationId, clear]);

    return (
        <ClickOutside
            className={classNames('block block-header-search', mobile && 'block-header-search-mobile')}
            onBlur={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget)) {
                    setOpen(false);
                }
            }}
            onKeyDown={(e) => {
                if (e.key === 'Escape' && open) {
                    e.preventDefault();
                    e.stopPropagation();
                    inputRef.current?.focus();
                    setOpen(false);
                }
            }}
            onClickOutside={() => setOpen(false)}>
            <form
                className="form header-search-form"
                role="search"
                onSubmit={(e) => {
                    e.preventDefault();
                    setOpen(true);
                }}>
                <label htmlFor={inputId} className="sr-only">
                    Zoeken
                </label>
                <input
                    id={inputId}
                    ref={inputRef}
                    type="search"
                    className="form-control header-search-input"
                    placeholder="Zoeken"
                    autoComplete="off"
                    value={value}
                    aria-expanded={showDropdown}
                    aria-controls={resultsId}
                    data-dusk="headerSearchInput"
                    onFocus={() => setOpen(true)}
                    onClick={() => setOpen(true)}
                    onChange={(e) => {
                        if (e.target.value.trim() !== query) {
                            setQuery('');
                        }

                        setValue(e.target.value);
                        setOpen(true);
                    }}
                />
                {value && (
                    <button
                        type="button"
                        className="header-search-clear"
                        aria-label="Zoekopdracht wissen"
                        data-dusk="headerSearchClear"
                        onClick={() => {
                            clear();
                            inputRef.current?.focus();
                        }}>
                        <em className="mdi mdi-close" aria-hidden="true" />
                    </button>
                )}
                <em
                    className={classNames(
                        'mdi',
                        'header-search-icon',
                        loading ? 'mdi-loading mdi-spin' : 'mdi-magnify',
                    )}
                    aria-hidden="true"
                />
            </form>

            {query && (
                <div
                    className="header-search-dropdown"
                    id={resultsId}
                    hidden={!showDropdown}
                    aria-busy={loading}
                    data-query={query}
                    data-dusk="headerSearchResults">
                    {blocks.map((block) => (
                        <HeaderSearchBlock
                            key={block.key}
                            q={query}
                            limit={limit}
                            block={block}
                            organizationId={organizationId}
                            onNavigate={navigateAway}
                            onStateChange={updateBlockState}
                        />
                    ))}

                    {loading && !states.includes('found') && (
                        <div className="header-search-loading" role="status">
                            <em className="mdi mdi-loading mdi-spin header-search-loading-icon" aria-hidden="true" />
                            Resultaten laden…
                        </div>
                    )}

                    {empty && (
                        <BlockEmpty
                            variant="compact"
                            imageIconSvg={<em className="mdi mdi-table-off" aria-hidden="true" />}
                            title={`Geen resultaten voor "${query}".`}
                            description="Probeer een andere zoekterm."
                            dataDusk="headerSearchEmpty"
                        />
                    )}
                </div>
            )}
        </ClickOutside>
    );
}
