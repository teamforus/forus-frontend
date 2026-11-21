import { useMemo } from 'react';
import useFilterNext from '../../../../modules/filter_next/useFilterNext';
import { ApiPaginationMetaProp } from '../../../../props/ApiResponses';
import usePaginatorService from '../../../../modules/paginator/services/usePaginatorService';

export default function useRequesterImportPagination(total: number, paginatorKey: string) {
    const paginatorService = usePaginatorService();

    const [filterValues, , filterUpdate] = useFilterNext({
        page: 1,
        per_page: paginatorService.getPerPage(paginatorKey, 10),
    });

    const meta = useMemo((): ApiPaginationMetaProp => {
        return {
            total,
            current_page: filterValues.page,
            per_page: filterValues.per_page,
            last_page: Math.max(1, Math.ceil(total / filterValues.per_page)),
            from: total ? (filterValues.page - 1) * filterValues.per_page + 1 : 0,
            to: Math.min(filterValues.page * filterValues.per_page, total),
            path: '',
            links: { active: false, label: '', url: '' },
        };
    }, [filterValues.page, filterValues.per_page, total]);

    return { meta, filterValues, filterUpdate };
}
