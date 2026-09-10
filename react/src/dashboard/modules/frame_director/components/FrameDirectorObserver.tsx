import { useRef, createElement, ReactElement } from 'react';
import type { FDItem } from '../types';
import useFDTargetObserverRef from '../hooks/useFDTargetObserverRef';

export default function FrameDirectorObserver({
    element,
    children,
    close,
    align = 'center',
    position = 'right',
    syncType = 'observer',
    classNames,
    stackRoot = false,
}: {
    element: (e?: FDItem) => ReactElement;
    close?: () => void;
    children: ReactElement | Array<ReactElement>;
    align?: 'start' | 'center' | 'end';
    position?: 'top' | 'bottom' | 'right' | 'left';
    syncType?: 'observer' | 'requestAnimationFrame';
    fallbackPositions?: boolean;
    classNames?: string;
    stackRoot?: boolean;
}) {
    const observedElRef = useRef<HTMLElement>(null);

    useFDTargetObserverRef({
        targetRef: observedElRef,
        show: true,
        element,
        close,
        align,
        position,
        syncType,
        stackRoot,
    });

    return createElement('div', { ref: observedElRef, className: classNames }, children);
}
