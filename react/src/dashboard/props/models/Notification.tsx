import { DashboardRoutes } from '../../modules/state_router/RouterBuilder';

export interface NotificationRoute {
    name: DashboardRoutes;
    params: Record<string, number>;
    query?: Record<string, string | number>;
}

export default interface Notification {
    id: string;
    title: string;
    description?: string;
    seen: boolean;
    type: string;
    route?: NotificationRoute | null;
    created_at: string;
    created_at_locale: string;
}
