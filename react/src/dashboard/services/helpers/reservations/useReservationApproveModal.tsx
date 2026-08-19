import React, { useCallback } from 'react';
import useOpenModal from '../../../hooks/useOpenModal';
import Organization from '../../../props/models/Organization';
import Reservation from '../../../props/models/Reservation';
import ModalReservationApprove from '../../../components/modals/ModalReservationApprove';

export default function useReservationApproveModal(organization: Organization) {
    const openModal = useOpenModal();

    return useCallback(
        (reservations: Reservation[], onDone?: () => void) => {
            openModal((modal) => (
                <ModalReservationApprove
                    modal={modal}
                    organization={organization}
                    reservations={reservations}
                    onDone={onDone}
                />
            ));
        },
        [openModal, organization],
    );
}
