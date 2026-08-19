import React, { Fragment, useRef, useState } from 'react';
import classNames from 'classnames';
import { uniqueId } from 'lodash';
import { clickOnKeyEnter } from '../../../../helpers/wcag';
import { hasPermission } from '../../../../helpers/utils';
import useActiveOrganization from '../../../../hooks/useActiveOrganization';
import useIsSponsorPanel from '../../../../hooks/useIsSponsorPanel';
import useThumbnailUrl from '../../../../hooks/useThumbnailUrl';
import useTranslate from '../../../../hooks/useTranslate';
import ClickOutside from '../../../../modules/click-outside/ClickOutside';
import { DashboardRoutes } from '../../../../modules/state_router/RouterBuilder';
import StateNavLink from '../../../../modules/state_router/StateNavLink';
import Organization, { Permission } from '../../../../props/models/Organization';
import { SelectControlOptionsProp } from '../SelectControl';
import useSelectControlKeyEventHandlers from '../hooks/useSelectControlKeyEventHandlers';

export default function SelectControlOptionsOrganization<T>({
    query,
    setQuery,
    optionsFiltered,
    placeholderValue,
    placeholder,
    selectOption,
    showOptions,
    visibleCount,
    className,
    onInputClick,
    modelValue,
    searchOption,
    searchAutoComplete,
    setShowOptions,
    searchInputChanged,
    onOptionsScroll,
    isOptionSelected,
}: SelectControlOptionsProp<T>) {
    const translate = useTranslate();
    const thumbnailUrl = useThumbnailUrl();
    const isSponsorPanel = useIsSponsorPanel();
    const activeOrganization = useActiveOrganization();

    const [controlId] = useState('select_control_' + uniqueId());

    const input = useRef<HTMLInputElement>(null);
    const selectorRef = useRef<HTMLDivElement>(null);
    const placeholderRef = useRef<HTMLLabelElement>(null);

    const { onKeyDown, onBlur } = useSelectControlKeyEventHandlers(
        selectorRef,
        placeholderRef,
        showOptions,
        setShowOptions,
    );

    return (
        <ClickOutside targetRef={selectorRef} disabled={!showOptions} onClickOutside={() => setShowOptions(false)}>
            <div
                className={classNames('select-control', 'select-control-organizations', className)}
                data-dusk="headerOrganizationSwitcher"
                tabIndex={0}
                ref={selectorRef}
                role="button"
                aria-haspopup="listbox"
                aria-expanded={showOptions}
                aria-labelledby={controlId}
                aria-controls={`${controlId}_options`}
                onKeyDown={onKeyDown}
                onBlur={onBlur}>
                <div className={classNames('select-control-input', showOptions && 'options')}>
                    {/* Placeholder */}
                    <label
                        role="button"
                        ref={placeholderRef}
                        className="select-control-search form-control"
                        onClick={searchOption}>
                        <span className="select-control-logo-organizations">
                            {modelValue && (
                                <img
                                    alt="Logo"
                                    src={
                                        (modelValue?.raw as Organization)?.logo?.sizes?.thumbnail ||
                                        thumbnailUrl('organization')
                                    }
                                />
                            )}
                        </span>
                        <span className="select-control-search-placeholder">{placeholderValue || placeholder}</span>
                        <span className="select-control-icon" />
                    </label>

                    <div className="select-control-search form-control">
                        <div className="select-control-search-icon-organizations">
                            <div className="mdi mdi-magnify" />
                        </div>

                        <div className="select-control-search-input-organizations">
                            {showOptions && (
                                <input
                                    id={controlId}
                                    type="search"
                                    placeholder={placeholderValue || placeholder}
                                    ref={input}
                                    value={query}
                                    autoComplete={searchAutoComplete}
                                    onClick={onInputClick}
                                    onChange={(e) => setQuery(e.target.value)}
                                />
                            )}
                        </div>

                        <button
                            type="button"
                            className="select-control-search-clear-organizations"
                            disabled={!query}
                            aria-label="Annuleren"
                            onKeyDown={(e) => {
                                if (['Enter', ' '].includes(e.key)) {
                                    e.stopPropagation();
                                }
                            }}
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setQuery('');
                                searchInputChanged();
                                input.current?.focus();
                            }}>
                            <em className="mdi mdi-close" />
                        </button>
                    </div>

                    {showOptions && (
                        <div className="select-control-options-group-organizations">
                            <div
                                className="select-control-options"
                                role="listbox"
                                id={`${controlId}_options`}
                                onScroll={onOptionsScroll}>
                                {optionsFiltered.slice(0, visibleCount)?.map((option) => (
                                    <div
                                        data-dusk={`headerOrganizationItem${(option.raw as Organization)?.id}`}
                                        className={classNames(
                                            'select-control-option',
                                            isOptionSelected(option) && 'active',
                                        )}
                                        tabIndex={0}
                                        key={option.id}
                                        aria-selected={isOptionSelected(option)}
                                        role="option"
                                        onKeyDown={clickOnKeyEnter}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            selectOption(option);
                                        }}>
                                        <div className="select-control-logo-organizations">
                                            <img
                                                alt="Logo"
                                                src={
                                                    (option.raw as Organization)?.logo?.sizes?.thumbnail ||
                                                    thumbnailUrl('organization')
                                                }
                                            />
                                        </div>
                                        <div className="select-control-option-value-organizations">
                                            {option.labelFormat?.map((str, index) => (
                                                <Fragment key={str.id}>
                                                    {index != 1 ? (
                                                        <span>{str.value}</span>
                                                    ) : (
                                                        <strong>{str.value}</strong>
                                                    )}
                                                </Fragment>
                                            ))}
                                        </div>
                                    </div>
                                ))}

                                {optionsFiltered.length === 0 && (
                                    <div className="select-control-option-no-results-organizations">
                                        <div className="select-control-option-value-organizations">
                                            {translate('organizations.labels.no_results')}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="select-control-options-actions-organizations">
                                {isSponsorPanel &&
                                    hasPermission(activeOrganization, Permission.MANAGE_ORGANIZATION) && (
                                        <StateNavLink
                                            name={DashboardRoutes.ORGANIZATION_CONTACTS}
                                            params={{ organizationId: (modelValue?.raw as Organization)?.id }}
                                            onClick={() => setShowOptions(false)}
                                            className={classNames('select-control-switcher-setting-organizations')}>
                                            <div className="select-control-switcher-setting-icon-organizations">
                                                <em className="mdi mdi-email-edit-outline" />
                                            </div>
                                            <div className="select-control-switcher-setting-name-organizations">
                                                {translate('organizations.buttons.contacts')}
                                            </div>
                                        </StateNavLink>
                                    )}

                                {isSponsorPanel &&
                                    hasPermission(activeOrganization, Permission.MANAGE_ORGANIZATION) &&
                                    activeOrganization.allow_translations && (
                                        <StateNavLink
                                            name={DashboardRoutes.ORGANIZATION_TRANSLATIONS}
                                            params={{ organizationId: (modelValue?.raw as Organization)?.id }}
                                            onClick={() => setShowOptions(false)}
                                            className={classNames('select-control-switcher-setting-organizations')}>
                                            <div className="select-control-switcher-setting-icon-organizations">
                                                <em className="mdi mdi-translate-variant" />
                                            </div>
                                            <div className="select-control-switcher-setting-name-organizations">
                                                {translate('organizations.buttons.translations')}
                                            </div>
                                        </StateNavLink>
                                    )}

                                {hasPermission(activeOrganization, Permission.MANAGE_ORGANIZATION) && (
                                    <StateNavLink
                                        name={DashboardRoutes.ORGANIZATION_EDIT}
                                        params={{ organizationId: (modelValue?.raw as Organization)?.id }}
                                        onClick={() => setShowOptions(false)}
                                        className={classNames('select-control-switcher-setting-organizations')}>
                                        <div className="select-control-switcher-setting-icon-organizations">
                                            <em className="mdi mdi-cog" />
                                        </div>
                                        <div className="select-control-switcher-setting-name-organizations">
                                            {translate('organizations.buttons.edit')}
                                        </div>
                                    </StateNavLink>
                                )}

                                <StateNavLink
                                    name={DashboardRoutes.ORGANIZATION_CREATE}
                                    onClick={() => setShowOptions(false)}
                                    className={classNames('select-control-switcher-setting-organizations')}>
                                    <div className="select-control-switcher-setting-icon-organizations">
                                        <em className="mdi mdi-plus-circle" />
                                    </div>
                                    <div className="select-control-switcher-setting-name-organizations">
                                        {translate('organizations.buttons.add')}
                                    </div>
                                </StateNavLink>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </ClickOutside>
    );
}
