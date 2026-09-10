import React, { ReactElement, RefObject, useCallback, useContext, useEffect, useState } from 'react';
import { uniqueId } from 'lodash';
import type { FDTargetContainerProps } from '../components/FDTargetClick';
import { frameDirectorInternalItemContext } from '../context/FrameDirectorInternalItemContext';
import { getElementAncestors } from '../helpers/dom';
import type { FDAlign, FDItem, FDObserverRect, FDPosition } from '../types';
import useFrameDirector from './useFrameDirector';

export default function useFDTargetObserverRef({
    targetRef,
    show,
    element,
    contentContainer: FdTargetContainer,
    content,
    icon,
    title,
    close,
    align = 'center',
    position = 'right',
    syncType = 'observer',
    stackRoot = false,
}: {
    targetRef: RefObject<HTMLElement | null>;
    show: boolean;
    element?: (item?: FDItem) => ReactElement;
    contentContainer?: (props: FDTargetContainerProps) => ReactElement;
    content?: FDTargetContainerProps['content'];
    icon?: string;
    title?: string;
    close?: () => void;
    align?: FDAlign;
    position?: FDPosition;
    syncType?: 'observer' | 'requestAnimationFrame';
    stackRoot?: boolean;
}) {
    const { pushElement, updateElement, deleteElement } = useFrameDirector();
    const itemContext = useContext(frameDirectorInternalItemContext);

    const [elId, setElId] = useState<string>(null);
    const [observedRect, setObservedRect] = useState<FDObserverRect>(null);

    const resolvedElement = useCallback(
        (item?: FDItem) => {
            if (element) {
                return element(item);
            }

            return (
                <FdTargetContainer
                    icon={icon}
                    title={title}
                    content={content}
                    position={position}
                    align={align}
                    close={close}
                    item={item}
                />
            );
        },
        [FdTargetContainer, align, close, content, element, icon, position, title],
    );

    useEffect(() => {
        if (!show) {
            setObservedRect(null);
            return;
        }

        const target = targetRef.current;

        if (!target) {
            return;
        }

        let isAnimating = true;
        const elements = [target, ...getElementAncestors(target)];

        const updateBoundingClientRect = () => {
            setObservedRect(targetRef.current?.getBoundingClientRect());

            if (syncType === 'requestAnimationFrame' && isAnimating) {
                window.requestAnimationFrame(() => updateBoundingClientRect());
            }
        };

        if (syncType === 'requestAnimationFrame') {
            window.requestAnimationFrame(() => updateBoundingClientRect());

            return () => {
                isAnimating = false;
            };
        }

        const observers = elements.map((el: HTMLElement): ResizeObserver => {
            el.addEventListener('resize', updateBoundingClientRect);
            el.addEventListener('scroll', updateBoundingClientRect);

            const observer = new ResizeObserver(updateBoundingClientRect);
            observer.observe(el);
            return observer;
        });

        window.addEventListener('resize', updateBoundingClientRect);
        window.addEventListener('scroll', updateBoundingClientRect, { passive: true });

        updateBoundingClientRect();

        return () => {
            elements.forEach((element: HTMLElement) => {
                element.removeEventListener('resize', updateBoundingClientRect);
                element.removeEventListener('scroll', updateBoundingClientRect);
            });

            observers.forEach((observer: ResizeObserver) => observer.disconnect());

            window.removeEventListener('resize', updateBoundingClientRect);
            window.removeEventListener('scroll', updateBoundingClientRect);
        };
    }, [show, syncType, targetRef]);

    useEffect(() => {
        if (!show && elId) {
            deleteElement(elId);
            setElId(null);
        }
    }, [deleteElement, elId, show]);

    useEffect(() => {
        if (!show || !observedRect) {
            return;
        }

        const targetElement = targetRef.current;

        if (elId) {
            updateElement(elId, {
                close,
                element: resolvedElement,
                observedRect,
                requestedPosition: { align, position },
                targetElement,
            });
            return;
        }

        const key = uniqueId('fd_element_');
        const parentKey = stackRoot ? null : (itemContext?.itemKey ?? null);
        const rootKey = parentKey ? (itemContext?.rootKey ?? parentKey) : key;

        setElId(
            pushElement({
                key,
                parentKey,
                rootKey,
                targetElement,
                close,
                observedRect,
                element: resolvedElement,
                requestedPosition: { align, position },
            }),
        );
    }, [
        align,
        close,
        elId,
        itemContext?.itemKey,
        itemContext?.rootKey,
        observedRect,
        position,
        pushElement,
        resolvedElement,
        show,
        stackRoot,
        targetRef,
        updateElement,
    ]);

    useEffect(() => {
        return elId ? () => deleteElement(elId) : undefined;
    }, [deleteElement, elId]);
}
