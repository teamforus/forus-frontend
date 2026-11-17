import React from 'react';
import classNames from 'classnames';
import StateNavLink from '../../../modules/state_router/StateNavLink';
import { DashboardRoutes } from '../../../modules/state_router/RouterBuilder';
import { PaginationData } from '../../../props/ApiResponses';
import Notification from '../../../props/models/Notification';

export default function HeaderNotificationsPanel({
    notifications,
    organizationId,
    onClose,
}: {
    notifications: PaginationData<Notification>;
    organizationId: number;
    onClose: () => void;
}) {
    return (
        <div className="block block-header-notifications">
            <div className="header-notifications-inner">
                <div className="arrow-box">
                    <em className="arrow" />
                </div>
                <div className="header-notifications-header">
                    <div className="header-notifications-header-title">
                        Nieuwe notificaties
                        {parseInt(notifications?.meta?.total_unseen?.toString()) > 0 && (
                            <span>{` (${notifications.meta.total_unseen} nieuw)`}</span>
                        )}
                    </div>
                    <StateNavLink
                        name={DashboardRoutes.ORGANIZATION_NOTIFICATIONS}
                        params={{ organizationId: organizationId }}
                        onClick={onClose}
                        className="header-notifications-header-link">
                        Bekijk alles
                        <em className="mdi mdi-arrow-right" aria-hidden="true" />
                    </StateNavLink>
                </div>
                <div className="header-notifications-body">
                    {notifications?.data.map((notification) => {
                        const className = classNames('header-notifications-item', !notification.seen && 'unread');

                        const details = (
                            <div className="header-notifications-item-details">
                                <div className="header-notifications-item-title">{notification.title}</div>
                                <div className="header-notifications-item-text">{notification.description}</div>
                                <div className="header-notifications-item-date">
                                    <em className="mdi mdi-clock-outline" />
                                    {notification.created_at_locale}
                                </div>
                            </div>
                        );

                        return notification.route ? (
                            <StateNavLink
                                key={notification.id}
                                name={notification.route.name}
                                params={notification.route.params}
                                query={notification.route.query || {}}
                                activeClass={null}
                                onClick={onClose}
                                className={classNames(className, 'header-notifications-item-link')}>
                                {details}
                            </StateNavLink>
                        ) : (
                            <div key={notification.id} className={className}>
                                {details}
                            </div>
                        );
                    })}
                    {(!notifications || notifications?.data.length == 0) && (
                        <div className="header-notifications-empty">Geen nieuwe notificaties</div>
                    )}
                </div>
            </div>
        </div>
    );
}
