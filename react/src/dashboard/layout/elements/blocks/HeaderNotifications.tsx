import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Organization from '../../../props/models/Organization';
import { useNotificationService } from '../../../services/NotificationService';
import { PaginationData } from '../../../props/ApiResponses';
import Notification from '../../../props/models/Notification';
import useEnvData from '../../../hooks/useEnvData';
import usePushApiError from '../../../hooks/usePushApiError';
import classNames from 'classnames';
import useFDTargetObserverRef from '../../../modules/frame_director/hooks/useFDTargetObserverRef';
import HeaderDropdown from './HeaderDropdown';
import HeaderNotificationsPanel from './HeaderNotificationsPanel';

export default function HeaderNotifications({
    organization,
    sidebarOpen,
    onSidebarToggle,
}: {
    organization: Organization;
    sidebarOpen: boolean;
    onSidebarToggle?: () => void;
}) {
    const envData = useEnvData();
    const pushApiError = usePushApiError();
    const notificationService = useNotificationService();

    const [setReadTimeoutDelay] = useState(2500);
    const [readReady, setReadReady] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [notifications, setNotifications] = useState<PaginationData<Notification>>(null);

    const requestRef = useRef(0);
    const notificationRef = useRef<HTMLButtonElement>(null);

    const unseenCount = parseInt(notifications?.meta?.total_unseen?.toString()) || 0;

    const fetchNotifications = useCallback(
        (mark_read = false, seenIds = []) => {
            const requestId = ++requestRef.current;

            setReadReady(false);

            notificationService
                .list({ organization_id: organization?.id, seen: 0, per_page: 100, mark_read: mark_read ? 1 : 0 })
                .then((res) => {
                    if (requestId !== requestRef.current) {
                        return;
                    }

                    res.data.data = res.data.data.map((item) => ({
                        ...item,
                        seen: item.seen || seenIds.includes(item.id),
                    }));

                    setNotifications(res.data);
                    setReadReady(true);
                })
                .catch((error) => {
                    if (requestId === requestRef.current) {
                        pushApiError(error);
                    }
                });
        },
        [notificationService, organization, pushApiError],
    );

    const closeNotifications = useCallback(() => {
        setShowNotifications(false);
    }, []);

    const notificationContent = useMemo(() => {
        return (
            <HeaderNotificationsPanel
                organizationId={organization.id}
                notifications={notifications}
                onClose={closeNotifications}
            />
        );
    }, [closeNotifications, notifications, organization.id]);

    useFDTargetObserverRef({
        targetRef: notificationRef,
        show: showNotifications,
        contentContainer: HeaderDropdown,
        content: notificationContent,
        close: closeNotifications,
        position: 'bottom',
        align: 'end',
    });

    useEffect(() => {
        if (sidebarOpen) {
            setShowNotifications(false);
        }
    }, [sidebarOpen]);

    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    useEffect(() => {
        if (notifications && showNotifications && readReady) {
            const timeout = window.setTimeout(() => {
                fetchNotifications(
                    true,
                    notifications.data.map((item) => item.id),
                );
            }, setReadTimeoutDelay);

            return () => window.clearTimeout(timeout);
        }
    }, [showNotifications, fetchNotifications, setReadTimeoutDelay, notifications, readReady]);

    return (
        <div className="header-actions">
            {envData?.config?.help_link && (
                <a
                    href={envData.config.help_link}
                    className="header-action header-action-help"
                    target="_blank"
                    rel="noreferrer">
                    <em className="mdi mdi-help" />
                </a>
            )}

            <button
                ref={notificationRef}
                type="button"
                aria-label="Notificaties"
                aria-expanded={showNotifications}
                className={classNames('header-action', showNotifications && 'active', unseenCount > 0 && 'unread')}
                onClick={(event) => {
                    event.stopPropagation();
                    setShowNotifications(!showNotifications);

                    if (!showNotifications) {
                        fetchNotifications(false);

                        if (sidebarOpen) {
                            onSidebarToggle?.();
                        }
                    }
                }}>
                <em className={classNames('mdi', unseenCount > 0 ? 'mdi-bell' : 'mdi-bell-outline')} />

                {unseenCount > 0 && <span className="header-action-count">{Math.min(unseenCount, 99)}</span>}

                <span className="header-action-label">Notificaties</span>
            </button>
        </div>
    );
}
