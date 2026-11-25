import type { DashboardRoutes } from '../../../../modules/state_router/RouterBuilder';
import type { RequestConfigData } from '../../../../props/ApiResponses';

export type HeaderSearchBlockState = 'loading' | 'found' | 'empty';

export type HeaderSearchItem = {
    id: number;
    title: string;
    subtitle?: string;
    thumbnailUrl?: string;
    route: { name: DashboardRoutes; params: object };
};

export type HeaderSearchBlockResult = {
    items: Array<HeaderSearchItem>;
    total: number;
};

export type HeaderSearchBlockConfig = {
    key: string;
    title: string;
    icon: string;
    listRoute: DashboardRoutes;
    listQuery?: Record<string, string | number>;
    show: boolean;
    fetch: (query: { q: string; per_page: number }, config?: RequestConfigData) => Promise<HeaderSearchBlockResult>;
};
