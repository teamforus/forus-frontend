import React, { useEffect, useState } from 'react';
import StateNavLink from '../../../../modules/state_router/StateNavLink';
import useLatestRequest from '../../../../hooks/useLatestRequest';
import { HeaderSearchBlockConfig, HeaderSearchBlockResult, HeaderSearchBlockState } from './types';
import HeaderSearchItemContent from './HeaderSearchItemContent';

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
    const [result, setResult] = useState<HeaderSearchBlockResult>(null);

    const runLatestRequest = useLatestRequest();

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
            onError: () => {
                onStateChange(block.key, 'empty');
            },
        });
    }, [block, limit, onStateChange, q, runLatestRequest]);

    if (!result?.items?.length) {
        return null;
    }

    return (
        <div className="header-search-group" data-dusk={`headerSearchBlock_${block.key}`}>
            <div className="header-search-group-header">
                <div className="header-search-group-title">
                    {block.title} ({result.total})
                </div>
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
                    <HeaderSearchItemContent
                        icon={block.icon}
                        title={item.title}
                        subtitle={item.subtitle}
                        thumbnailUrl={item.thumbnailUrl}
                        q={q}
                    />
                </StateNavLink>
            ))}
        </div>
    );
}
