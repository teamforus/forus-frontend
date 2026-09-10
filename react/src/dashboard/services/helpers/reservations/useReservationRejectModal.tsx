import React, { useCallback } from 'react';
import useOpenModal from '../../../hooks/useOpenModal';
import Organization from '../../../props/models/Organization';
import Reservation from '../../../props/models/Reservation';
import ModalReservationReject from '../../../components/modals/ModalReservationReject';
import useShowRejectInfoExtraPaid from './useShowRejectInfoExtraPaid';

export default function useReservationRejectModal(organization: Organization) {
    const openModal = useOpenModal();
    const showRejectInfoExtraPaid = useShowRejectInfoExtraPaid();

    return useCallback(
        (reservations: Reservation[], onDone?: () => void) => {
            if (
                reservations.some(
                    (reservation) =>
                        reservation.extra_payment?.is_paid && !reservation.extra_payment?.is_fully_refunded,
                )
            ) {
                showRejectInfoExtraPaid();

                return;
            }

            openModal((modal) => (
                <ModalReservationReject
                    modal={modal}
                    organization={organization}
                    reservations={reservations}
                    onDone={onDone}
                />
            ));
        },
        [openModal, organization, showRejectInfoExtraPaid],
    );
}
