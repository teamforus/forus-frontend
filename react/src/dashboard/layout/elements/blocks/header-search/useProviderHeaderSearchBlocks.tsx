import { useMemo } from 'react';
import Organization, { Permission } from '../../../../props/models/Organization';
import { hasPermission } from '../../../../helpers/utils';
import { DashboardRoutes } from '../../../../modules/state_router/RouterBuilder';
import useProductService from '../../../../services/ProductService';
import useProductReservationService from '../../../../services/ProductReservationService';
import { HeaderSearchBlockConfig } from './types';
import { joinValues } from './helpers/joinValues';

export default function useProviderHeaderSearchBlocks(organization?: Organization): Array<HeaderSearchBlockConfig> {
    const productService = useProductService();
    const productReservationService = useProductReservationService();

    return useMemo(() => {
        if (!organization) {
            return [];
        }

        const organizationId = organization.id;

        const blocks: Array<HeaderSearchBlockConfig> = [
            {
                key: 'products',
                title: 'Aanbod',
                icon: 'mdi-tag',
                listRoute: DashboardRoutes.PRODUCTS,
                listQuery: { source: 'all' },
                show: hasPermission(organization, Permission.MANAGE_PRODUCTS),
                fetch: (query, config) => {
                    return productService.list(organizationId, query, config).then((res) => ({
                        total: res.data.meta.total,
                        items: res.data.data.map((product) => ({
                            id: product.id,
                            title: product.name,
                            thumbnailUrl: product.photos?.[0]?.sizes?.thumbnail,
                            route: { name: DashboardRoutes.PRODUCT, params: { organizationId, id: product.id } },
                        })),
                    }));
                },
            },
            {
                key: 'reservations',
                title: 'Reserveringen',
                icon: 'mdi-calendar-check-outline',
                listRoute: DashboardRoutes.RESERVATIONS,
                show: hasPermission(organization, Permission.SCAN_VOUCHERS),
                fetch: (query, config) => {
                    return productReservationService
                        .list(
                            organizationId,
                            { ...query, archived: 0, order_by: 'created_at', order_dir: 'desc' },
                            config,
                        )
                        .then((res) => ({
                            total: res.data.meta.total,
                            items: res.data.data.map((reservation) => ({
                                id: reservation.id,
                                title: `Reservering #${reservation.code}`,
                                thumbnailUrl: reservation.product?.photos?.[0]?.sizes?.thumbnail,
                                subtitle: joinValues([
                                    reservation.product?.name,
                                    [reservation.first_name, reservation.last_name].filter(Boolean).join(' ') ||
                                        reservation.identity_email,
                                ]),
                                route: {
                                    name: DashboardRoutes.RESERVATION,
                                    params: { organizationId, id: reservation.id },
                                },
                            })),
                        }));
                },
            },
        ];

        return blocks.filter((block) => block.show);
    }, [organization, productService, productReservationService]);
}
