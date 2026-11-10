import { useEffect, useMemo, useState } from 'react';
import RecordType from '../../../../props/models/RecordType';
import usePushApiError from '../../../../hooks/usePushApiError';
import { useRecordTypeService } from '../../../../services/RecordTypeService';
import usePushDanger from '../../../../hooks/usePushDanger';
import useTranslate from '../../../../hooks/useTranslate';

export default function useProfileRecordTypes(organizationId: number) {
    const translate = useTranslate();
    const pushDanger = usePushDanger();
    const pushApiError = usePushApiError();

    const recordTypeService = useRecordTypeService();

    const [catalog, setCatalog] = useState<{ organizationId: number; types: RecordType<string>[] }>(null);

    const recordTypes = catalog?.organizationId === organizationId ? catalog.types : null;

    const recordTypesByKey = useMemo(() => {
        return Object.fromEntries((recordTypes || []).map((type) => [type.key, type]));
    }, [recordTypes]);

    useEffect(() => {
        let active = true;

        setCatalog(null);

        recordTypeService
            .list<RecordType<string>>({ organization_id: organizationId })
            .then((response) => {
                if (active) {
                    setCatalog({ organizationId, types: response.data });

                    if (response.data.length === 1000) {
                        pushDanger(
                            translate('errors.api.title.default'),
                            translate('identities.profile_groups.limit_reached'),
                        );
                    }
                }
            })
            .catch((error) => {
                if (active) {
                    pushApiError(error);
                }
            });

        return () => {
            active = false;
        };
    }, [organizationId, pushApiError, pushDanger, recordTypeService, translate]);

    return {
        recordTypes,
        recordTypesByKey,
    };
}
