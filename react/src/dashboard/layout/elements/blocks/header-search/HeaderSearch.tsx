import React, { useCallback, useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import ClickOutside from '../../../../modules/click-outside/ClickOutside';
import { useStateRoutes } from '../../../../modules/state_router/Router';
import HeaderSearchBlock, { HeaderSearchBlockConfig, HeaderSearchBlockState } from './HeaderSearchBlock';

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

    const inputRef = useRef<HTMLInputElement>(null);

    const [open, setOpen] = useState(false);
    const [blockStates, setBlockStates] = useState<Record<string, HeaderSearchBlockState>>({});

    const [value, setValue] = useState('');
    const [query, setQuery] = useState('');

    const states = blocks.map((block) => blockStates[block.key]);
    const loading = !!query && states.some((state) => !state || state === 'loading');
    const empty = !!query && !loading && !states.includes('found');
    const showDropdown = open && !!value.trim() && !!query;

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

    const inputId = mobile ? 'header_search_mobile' : 'header_search';
    const resultsId = `${inputId}_results`;

    return (
        <ClickOutside
            className={classNames('header-search', mobile && 'header-search-mobile')}
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
                    onChange={(e) => {
                        setValue(e.target.value);
                        setOpen(true);
                    }}
                    onKeyDown={(e) => {
                        if (e.key === 'Escape') {
                            e.stopPropagation();
                            setOpen(false);
                        }
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
                        <div className="header-search-empty" data-dusk="headerSearchEmpty">
                            <div className="header-search-empty-icon" aria-hidden="true">
                                <em className="mdi mdi-table-off" />
                            </div>
                            <div className="header-search-empty-title">Geen resultaten voor &quot;{query}&quot;.</div>
                            <div className="header-search-empty-description">Probeer een andere zoekterm.</div>
                        </div>
                    )}
                </div>
            )}
        </ClickOutside>
    );
}
