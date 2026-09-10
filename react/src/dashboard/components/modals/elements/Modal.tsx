import React, { ReactNode, SubmitEventHandler, useCallback } from 'react';
import { ModalState } from '../../../modules/modals/context/ModalContext';
import classNames from 'classnames';

export default function Modal({
    modal,
    size = 'md',
    title,
    headerType = 'default',
    headerIcon,
    body,
    bodyOverflowVisible = false,
    head,
    children,
    className,
    footer,
    footerClassName,
    onSubmit,
    dusk = null,
}: {
    modal: ModalState;
    title?: string | ReactNode;
    size?: 'sm' | 'md' | 'lg';
    headerType?: 'default' | 'danger';
    headerIcon?: string;
    children?: ReactNode | ReactNode[];
    head?: ReactNode | ReactNode[];
    body?: ReactNode | ReactNode[];
    bodyOverflowVisible?: boolean;
    footer?: ReactNode | ReactNode[];
    footerClassName?: string;
    onSubmit?: SubmitEventHandler<HTMLFormElement>;
    className?: string;
    dusk?: string;
}) {
    const ModalWindow = useCallback(
        ({
            children,
            onSubmit,
        }: {
            children: ReactNode | ReactNode[];
            onSubmit?: SubmitEventHandler<HTMLFormElement>;
        }) => {
            if (onSubmit) {
                return (
                    <form className={'modal-window form'} onSubmit={onSubmit}>
                        {children}
                    </form>
                );
            }
            return <div className={'modal-window'}>{children}</div>;
        },
        [],
    );

    return (
        <div
            className={classNames(
                'modal',
                'modal-animated',
                size === 'sm' && 'modal-sm',
                size === 'md' && 'modal-md',
                size === 'lg' && 'modal-lg',
                modal.loading && 'modal-loading',
                className,
            )}
            data-dusk={dusk}>
            <div className="modal-backdrop" onClick={modal.close} />

            <ModalWindow onSubmit={onSubmit}>
                {head
                    ? head
                    : title && (
                          <div className={classNames('modal-header', headerType === 'danger' && 'modal-header-danger')}>
                              {headerIcon && <em className={classNames('modal-header-icon', headerIcon)} />}
                              <div className="modal-header-title">{title}</div>
                              <a className="mdi mdi-close modal-close" onClick={modal.close} role="button" />
                          </div>
                      )}

                {body ? (
                    body
                ) : (
                    <div className={classNames('modal-body', bodyOverflowVisible && 'modal-body-visible')}>
                        <div className={classNames('modal-section')}>{children}</div>
                    </div>
                )}

                {footer && <div className={classNames('modal-footer', footerClassName)}>{footer}</div>}
            </ModalWindow>
        </div>
    );
}
