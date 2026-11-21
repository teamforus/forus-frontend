import { useMemo, useState } from 'react';
import { chunk } from 'lodash';
import useTranslate from '../../../../hooks/useTranslate';
import useBatchedPreviewAction from '../../../../hooks/batch-processing/useBatchedPreviewAction';
import { BATCH_SIZE } from '../../../../hooks/batch-processing/constants';
import useVoucherService, {
    ProfileVoucherAwardPreviewResult,
    ProfileVoucherAwardResult,
} from '../../../../services/VoucherService';

type ProfileVoucherBatch = { ids: number[]; fund_id: number };

export default function useProfileVoucherAward(organizationId: number) {
    const translate = useTranslate();
    const voucherService = useVoucherService();

    const [skipWouldSkip, setSkipWouldSkip] = useState(false);
    const [executionSkipWouldSkip, setExecutionSkipWouldSkip] = useState(false);
    const [selectedFundIds, setSelectedFundIds] = useState<number[]>([]);
    const [skippedPairs, setSkippedPairs] = useState<ProfileVoucherAwardPreviewResult[]>([]);

    const action = useBatchedPreviewAction<
        number[],
        ProfileVoucherBatch,
        ProfileVoucherAwardPreviewResult,
        ProfileVoucherAwardResult
    >({
        loadIds: () => voucherService.fromProfilesIds(organizationId).then((response) => response.data.data),
        makeBatches: (ids, fundIds) =>
            fundIds.flatMap((fund_id) => chunk(ids, BATCH_SIZE).map((ids) => ({ ids, fund_id }))),
        previewBatch: (batch) =>
            voucherService
                .previewFromProfiles(organizationId, [batch.fund_id], batch.ids)
                .then((response) => response.data.data),
        executeBatch: (batch) =>
            voucherService
                .storeFromProfiles(organizationId, [batch.fund_id], batch.ids)
                .then((response) => response.data.data),
        previewId: (result) => result.profile_id,
        resultId: (result) => result.profile_id,
        isRejected: (error) => error.status === 422 && !!error.data?.errors,
    });

    const hasEligibleAwards = action.preview?.some((result) => result.status === 'eligible');
    const skippedCount = action.preview?.filter((result) => result.status === 'skipped').length || 0;

    const results = useMemo((): ProfileVoucherAwardResult[] => {
        if (action.results === null) {
            return null;
        }

        const skipped: ProfileVoucherAwardResult[] = skippedPairs.map((result) => ({
            fund_id: result.fund_id,
            fund_name: result.fund_name,
            profile_id: result.profile_id,
            identity_id: result.identity_id,
            profile_name: result.profile_name,
            client_number: result.client_number,
            status: 'skipped',
            message: translate('vouchers.from_profiles.skipped_by_preview'),
            errors: [],
            diagnostic_id: null,
            voucher_ids: [],
        }));

        return [...action.results, ...skipped].sort(
            (left, right) => left.profile_id - right.profile_id || left.fund_id - right.fund_id,
        );
    }, [action.results, skippedPairs, translate]);

    const reset = () => {
        action.reset();
        setSkipWouldSkip(false);
        setExecutionSkipWouldSkip(false);
        setSkippedPairs([]);
    };

    return {
        ...action,
        results,
        reset,
        skippedCount,
        skippedPairs,
        skipWouldSkip,
        executionSkipWouldSkip,
        setSkipWouldSkip,
        selectedFundIds,
        hasEligibleAwards,
        setSelectedFundIds,
        calculate: () => {
            if (selectedFundIds.length) {
                reset();
                action.calculate([...selectedFundIds]);
            }
        },
        createVouchers: () => {
            if (action.phase !== 'preview' || !hasEligibleAwards) {
                return;
            }

            const skipped = skipWouldSkip ? action.preview.filter((result) => result.status === 'skipped') : [];
            const excludedPairs = new Set(skipped.map((result) => `${result.fund_id}:${result.profile_id}`));

            setSkippedPairs(skipped);
            setExecutionSkipWouldSkip(skipWouldSkip);
            action.execute({
                filterBatch: (batch) => ({
                    ...batch,
                    ids: batch.ids.filter((id) => !excludedPairs.has(`${batch.fund_id}:${id}`)),
                }),
            });
        },
    };
}
