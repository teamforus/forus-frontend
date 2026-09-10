import React, { Dispatch, ReactElement, SetStateAction, useCallback, useRef, useState } from 'react';

import FrameDirectorObserver from './FrameDirectorObserver';
import type { FDAlign, FDItem, FDPosition } from '../types';
import ClickOutside from '../../click-outside/ClickOutside';

export interface FDTargetContainerProps {
    item: FDItem;
    position: FDPosition;
    align: FDAlign;
    className?: string;
    content?: ((props: FDTargetContainerProps) => ReactElement | ReactElement[]) | ReactElement | ReactElement[];
    icon?: string;
    title?: string;
    close?: () => void;
    onContentReady?: () => void;
    onPositionChange?: (position: FDPosition) => void;
}

export default function FDTargetClick({
    icon,
    title,
    content,
    align = 'center',
    position = 'bottom',
    children,
    contentContainer: FdTargetContainer,
    contentContainerClassName,
    syncType = 'observer',
    showExternal = false,
    show,
    setShow,
    className,
    observerClassName,
    stackRoot = false,
    onContentReady,
    onPositionChange,
}: {
    icon?: string;
    title?: string;
    content?: ((props: FDTargetContainerProps) => ReactElement | ReactElement[]) | ReactElement | ReactElement[];
    align?: FDAlign;
    position?: FDPosition;
    children?: ReactElement | ReactElement[];
    contentContainer: (props: FDTargetContainerProps) => ReactElement;
    contentContainerClassName?: string;
    syncType?: 'observer' | 'requestAnimationFrame';
    showExternal?: boolean;
    show?: boolean;
    setShow?: Dispatch<SetStateAction<boolean>>;
    className?: string;
    observerClassName?: string;
    stackRoot?: boolean;
    onContentReady?: () => void;
    onPositionChange?: (position: FDPosition) => void;
}) {
    const [internalShow, setInternalShow] = useState(false);
    const elRef = useRef<HTMLDivElement>(null);

    const setShowValue = useCallback(
        (value: boolean) => {
            showExternal ? setShow(value) : setInternalShow(value);
        },
        [setShow, showExternal],
    );
    const isOpen = showExternal ? !!show : internalShow;

    return (
        <ClickOutside
            elRef={elRef}
            disabled={!isOpen}
            attr={{
                className,
                onClick: (e) => {
                    e.stopPropagation();
                    setShowValue(!isOpen);
                },
            }}
            onClickOutside={() => setShowValue(false)}>
            {isOpen ? (
                <FrameDirectorObserver
                    position={position}
                    align={align}
                    classNames={observerClassName}
                    fallbackPositions={true}
                    close={() => setShowValue(false)}
                    syncType={syncType}
                    stackRoot={stackRoot}
                    element={(item) => (
                        <FdTargetContainer
                            icon={icon}
                            title={title}
                            className={contentContainerClassName}
                            content={content}
                            position={position}
                            align={align}
                            close={() => setShowValue(false)}
                            onContentReady={onContentReady}
                            onPositionChange={onPositionChange}
                            item={item}
                        />
                    )}>
                    {children}
                </FrameDirectorObserver>
            ) : (
                children
            )}
        </ClickOutside>
    );
}
