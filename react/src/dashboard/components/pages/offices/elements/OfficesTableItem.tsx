import React, { Fragment, useCallback, useState } from 'react';
import { strLimit } from '../../../../helpers/string';
import { PaginationData } from '../../../../props/ApiResponses';
import Organization from '../../../../props/models/Organization';
import useTranslate from '../../../../hooks/useTranslate';
import StateNavLink from '../../../../modules/state_router/StateNavLink';
import TableRowActions from '../../../elements/tables/TableRowActions';
import usePushApiError from '../../../../hooks/usePushApiError';
import classNames from 'classnames';
import { DashboardRoutes } from '../../../../modules/state_router/RouterBuilder';
import Office from '../../../../props/models/Office';
import useAssetUrl from '../../../../hooks/useAssetUrl';
import TableEmptyValue from '../../../elements/table-empty-value/TableEmptyValue';
import { NavLink, useNavigate } from 'react-router';
import { getStateRouteUrl } from '../../../../modules/state_router/Router';
import usePushSuccess from '../../../../hooks/usePushSuccess';
import useOpenModal from '../../../../hooks/useOpenModal';
import useOfficeService from '../../../../services/OfficeService';
import ModalNotification from '../../../modals/ModalNotification';
import ModalDangerZone from '../../../modals/ModalDangerZone';
import { OfficeLocal } from '../Offices';
import OfficeScheduleTable from './OfficeScheduleTable';

export default function OfficesTableItem({
    organization,
    offices,
    office,
    fetchOffices,
}: {
    organization: Organization;
    offices: PaginationData<OfficeLocal>;
    office: OfficeLocal;
    fetchOffices: () => void;
}) {
    const openModal = useOpenModal();
    const navigate = useNavigate();
    const assetUrl = useAssetUrl();
    const translate = useTranslate();
    const pushSuccess = usePushSuccess();
    const pushApiError = usePushApiError();

    const officeService = useOfficeService();

    const [showSchedule, setShowSchedule] = useState(false);

    const confirmDelete = useCallback(
        (office: Office) => {
            openModal((modal) => (
                <ModalNotification
                    modal={modal}
                    title={translate('offices.confirm_delete.title')}
                    description={translate('offices.confirm_delete.description')}
                    buttonSubmit={{
                        onClick: () => {
                            modal.close();
                            officeService
                                .destroy(office.organization_id, office.id)
                                .then(() => {
                                    fetchOffices();
                                    pushSuccess('Vestiging is verwijderd.');
                                })
                                .catch(pushApiError);
                        },
                    }}
                    buttonCancel={{
                        onClick: () => modal.close(),
                    }}
                />
            ));
        },
        [fetchOffices, officeService, openModal, pushApiError, pushSuccess, translate],
    );

    const confirmHasEmployees = useCallback(() => {
        openModal((modal) => (
            <ModalDangerZone
                modal={modal}
                title={translate('offices.confirm_has_employees.title')}
                description_text={translate('offices.confirm_has_employees.description')}
                buttonCancel={{
                    text: translate('offices.confirm_has_employees.buttons.cancel'),
                    onClick: modal.close,
                }}
                buttonSubmit={{
                    type: 'primary',
                    text: translate('offices.confirm_has_employees.buttons.confirm'),
                    onClick: () => {
                        modal.close();
                        navigate(getStateRouteUrl(DashboardRoutes.EMPLOYEES, { organizationId: organization.id }));
                    },
                }}
            />
        ));
    }, [organization.id, navigate, openModal, translate]);

    const deleteOffice = useCallback(
        (office: Office) => {
            if (!office.employees_count) {
                return confirmDelete(office);
            }

            return confirmHasEmployees();
        },
        [confirmDelete, confirmHasEmployees],
    );

    return (
        <Fragment>
            <StateNavLink
                name={DashboardRoutes.OFFICE_EDIT}
                className={'tr-clickable'}
                customElement={'tr'}
                params={{
                    id: office.id,
                    organizationId: office.organization_id,
                }}>
                <td>
                    <div className="td-collapsable clickable">
                        <div
                            className="collapsable-icon"
                            onClick={(e) => {
                                e?.preventDefault();
                                e?.stopPropagation();

                                setShowSchedule(!showSchedule);
                            }}>
                            <em
                                className={classNames(
                                    'mdi',
                                    'icon-collapse',
                                    showSchedule ? 'mdi-menu-down' : 'mdi-menu-right',
                                )}
                            />
                        </div>
                        <div className="collapsable-media">
                            <img
                                className="td-media td-media-sm"
                                src={
                                    office.photo?.sizes.thumbnail ||
                                    assetUrl('/assets/img/placeholders/office-thumbnail.png')
                                }
                                alt={office.branch_name}
                            />
                        </div>
                        <div className="collapsable-content">
                            <div className="text-primary text-semibold">{strLimit(office.address, 40)}</div>
                        </div>
                    </div>
                </td>
                <td>{office.phone ? office.phone : <TableEmptyValue />}</td>
                <td>{office.branch_name ? office.branch_name : <TableEmptyValue />}</td>
                <td>{office.branch_number ? office.branch_number : <TableEmptyValue />}</td>
                <td>{office.branch_id ? office.branch_id : <TableEmptyValue />}</td>
                <td className={'table-td-actions text-right'}>
                    <TableRowActions
                        content={({ close }) => (
                            <div className="dropdown dropdown-actions">
                                <NavLink
                                    className="dropdown-item"
                                    to={getStateRouteUrl(DashboardRoutes.OFFICE_EDIT, {
                                        id: office.id,
                                        organizationId: office.organization_id,
                                    })}>
                                    <em className="mdi mdi-pen icon-start" />
                                    {translate('offices.buttons.adjust')}
                                </NavLink>
                                {offices.meta?.total > 1 && (
                                    <a
                                        className="dropdown-item"
                                        onClick={() => {
                                            deleteOffice(office);
                                            close();
                                        }}>
                                        <em className="mdi mdi-delete icon-start" />{' '}
                                        {translate('offices.buttons.delete')}
                                    </a>
                                )}
                                {office.lat && office.lon && (
                                    <a
                                        className="dropdown-item"
                                        href={`https://www.google.com/maps/place/${office.lat},${office.lon}`}
                                        rel="noreferrer"
                                        target="_blank">
                                        <em className="mdi mdi-map-marker icon-start" />{' '}
                                        {translate('offices.buttons.map')}
                                    </a>
                                )}
                            </div>
                        )}
                    />
                </td>
            </StateNavLink>

            {showSchedule && office.schedule.length != 0 && <OfficeScheduleTable office={office} />}
        </Fragment>
    );
}
