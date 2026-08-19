import React, { useCallback } from 'react';
import Reservation from '../../../../props/models/Reservation';
import { runSequentially } from '../../../../helpers/utils';
import useConfirmReservationArchive from '../../../../services/helpers/reservations/useConfirmReservationArchive';
import useConfirmReservationUnarchive from '../../../../services/helpers/reservations/useConfirmReservationUnarchive';
import useProductReservationService from '../../../../services/ProductReservationService';
import Organization from '../../../../props/models/Organization';
import usePushSuccess from '../../../../hooks/usePushSuccess';
import usePushApiError from '../../../../hooks/usePushApiError';
import useReservationApproveModal from '../../../../services/helpers/reservations/useReservationApproveModal';
import useReservationRejectModal from '../../../../services/helpers/reservations/useReservationRejectModal';

export default function useReservationsTableActions(organization: Organization, fetchReservations: () => void) {
    const pushSuccess = usePushSuccess();
    const pushApiError = usePushApiError();

    const productReservationService = useProductReservationService();

    const confirmReservationArchive = useConfirmReservationArchive();
    const confirmReservationUnarchive = useConfirmReservationUnarchive();
    const openReservationRejectModal = useReservationRejectModal(organization);
    const openReservationApproveModal = useReservationApproveModal(organization);

    const unarchiveReservations = useCallback(
        (reservations: Reservation[]) => {
            confirmReservationUnarchive(reservations, () => {
                const total = reservations.length;
                const isSingle = total === 1;

                const tasks = reservations.map(
                    (reservation, idx) => () =>
                        productReservationService.unarchive(organization.id, reservation.id).then(() => {
                            const prefix = isSingle ? '' : `${idx + 1}/${total}: `;

                            pushSuccess(
                                `${prefix}Reservering voor ${reservation.product!.name} voor ${reservation.amount_locale} uit het archief gehaald.`,
                            );
                        }),
                );

                runSequentially(tasks)
                    .then(() => {
                        if (!isSingle) {
                            pushSuccess('Alle reserveringen zijn uit het archief gehaald.');
                        }
                        fetchReservations();
                    })
                    .catch(pushApiError);
            });
        },
        [
            organization.id,
            confirmReservationUnarchive,
            fetchReservations,
            productReservationService,
            pushApiError,
            pushSuccess,
        ],
    );

    const acceptReservations = useCallback(
        (reservations: Reservation[]) => {
            openReservationApproveModal(reservations, fetchReservations);
        },
        [fetchReservations, openReservationApproveModal],
    );

    const rejectReservations = useCallback(
        (reservations: Reservation[]) => {
            openReservationRejectModal(reservations, fetchReservations);
        },
        [fetchReservations, openReservationRejectModal],
    );

    const archiveReservations = useCallback(
        (reservations: Reservation[]) => {
            confirmReservationArchive(reservations, () => {
                const total = reservations.length;
                const isSingle = total === 1;

                const tasks = reservations.map(
                    (reservation, idx) => () =>
                        productReservationService.archive(organization.id, reservation.id).then(() => {
                            const prefix = isSingle ? '' : `${idx + 1}/${total}: `;

                            pushSuccess(
                                `${prefix}Reservering voor ${reservation.product!.name} voor ${reservation.amount_locale} gearchiveerd.`,
                            );
                        }),
                );

                runSequentially(tasks)
                    .then(() => {
                        if (!isSingle) {
                            pushSuccess('Alle reserveringen zijn gearchiveerd.');
                        }
                        fetchReservations();
                    })
                    .catch(pushApiError);
            });
        },
        [
            organization.id,
            confirmReservationArchive,
            fetchReservations,
            productReservationService,
            pushApiError,
            pushSuccess,
        ],
    );

    return { unarchiveReservations, acceptReservations, rejectReservations, archiveReservations };
}
