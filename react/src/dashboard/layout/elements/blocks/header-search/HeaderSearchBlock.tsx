import React, { Fragment, useEffect, useState } from 'react';
import classNames from 'classnames';
import StateNavLink from '../../../../modules/state_router/StateNavLink';
import { DashboardRoutes } from '../../../../modules/state_router/RouterBuilder';
import { RequestConfigData } from '../../../../props/ApiResponses';
import useLatestRequest from '../../../../hooks/useLatestRequest';

export type HeaderSearchItem = {
    id: number;
    title: string;
    subtitle?: string;
    route: { name: DashboardRoutes; params: object };
};

export type HeaderSearchBlockResult = {
    total: number;
    items: Array<HeaderSearchItem>;
};

export type HeaderSearchBlockState = 'loading' | 'found' | 'empty';

export type HeaderSearchBlockConfig = {
    key: string;
    title: string;
    icon: string;
    listRoute: DashboardRoutes;
    listQuery?: Record<string, string | number>;
    show: boolean;
    fetch: (query: { q: string; per_page: number }, config?: RequestConfigData) => Promise<HeaderSearchBlockResult>;
};

export const joinValues = (values: Array<string | number | null | undefined>) => {
    return values.filter((value) => value !== null && value !== undefined && value !== '').join(', ') || null;
};

const HighlightText = ({ text, q }: { text: string; q: string }) => {
    const index = q && text ? text.toLowerCase().indexOf(q.toLowerCase()) : -1;

    if (index === -1) {
        return <Fragment>{text}</Fragment>;
    }

    return (
        <Fragment>
            {text.slice(0, index)}
            <span className="header-search-item-highlight">{text.slice(index, index + q.length)}</span>
            {text.slice(index + q.length)}
        </Fragment>
    );
};

export default function HeaderSearchBlock({
    q,
    limit,
    block,
    organizationId,
    onNavigate,
    onStateChange,
}: {
    q: string;
    limit: number;
    block: HeaderSearchBlockConfig;
    organizationId: number;
    onNavigate: () => void;
    onStateChange: (key: string, state: HeaderSearchBlockState) => void;
}) {
    const runLatestRequest = useLatestRequest();

    const [result, setResult] = useState<HeaderSearchBlockResult>(null);

    useEffect(() => {
        runLatestRequest((config) => block.fetch({ q, per_page: limit }, config), {
            onStart: () => {
                setResult(null);
                onStateChange(block.key, 'loading');
            },
            onSuccess: (result) => {
                setResult(result);
                onStateChange(block.key, result.items.length > 0 ? 'found' : 'empty');
            },
            onError: () => onStateChange(block.key, 'empty'),
        });
    }, [block, limit, onStateChange, q, runLatestRequest]);

    if (!result?.items?.length) {
        return null;
    }

    return (
        <div className="header-search-group" data-dusk={`headerSearchBlock_${block.key}`}>
            <div className="header-search-group-header">
                <div className="header-search-group-title">{block.title}</div>
                <StateNavLink
                    name={block.listRoute}
                    params={{ organizationId }}
                    query={{ ...block.listQuery, q }}
                    className="header-search-group-link"
                    dataDusk={`headerSearchBlockLink_${block.key}`}
                    onClick={onNavigate}>
                    Bekijk meer
                </StateNavLink>
            </div>

            {result.items.map((item) => (
                <StateNavLink
                    key={item.id}
                    name={item.route.name}
                    params={item.route.params}
                    className="header-search-item"
                    dataDusk={`headerSearchItem_${block.key}_${item.id}`}
                    onClick={onNavigate}>
                    <em className={classNames('mdi', block.icon, 'header-search-item-icon')} aria-hidden="true" />
                    <span className="header-search-item-details">
                        <span className="header-search-item-title">
                            <HighlightText text={item.title} q={q} />
                        </span>
                        {item.subtitle && <span className="header-search-item-subtitle">{item.subtitle}</span>}
                    </span>
                </StateNavLink>
            ))}
        </div>
    );
}
