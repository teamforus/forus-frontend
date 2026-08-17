import React, { ReactElement, createContext, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { resolveAncestorKeys, resolveDescendantKeys } from '../helpers/branch';
import type { FDItem, FDObserverRect } from '../types';
import { frameDirectorInternalItemContext } from './FrameDirectorInternalItemContext';

interface FDProps {
    elements: Array<FDItem>;
    pushElement: (item: FDItem) => string;
    deleteElement: (id: string) => void;
    updateElement: (id: string, config: Partial<FDItem>) => void;
    updateObservedPosition: (id: string, observerRect: FDObserverRect) => void;
}

const frameDirectorContext = createContext<FDProps>(null);
const { Provider } = frameDirectorContext;
const { Provider: ItemProvider } = frameDirectorInternalItemContext;

const FrameDirectorProvider = ({ children }: { children: ReactElement }) => {
    const [elements, setElements] = useState<Array<FDItem>>([]);
    const elementsRef = useRef<Array<FDItem>>([]);
    const contentElementsRef = useRef<Map<string, HTMLDivElement>>(new Map());

    const syncElements = useCallback((nextElements: Array<FDItem>) => {
        elementsRef.current = nextElements;

        return nextElements;
    }, []);

    const closeElements = useCallback((elements: Array<FDItem>) => {
        elements.forEach((item) => item?.close?.());
    }, []);

    const closeElementKeys = useCallback(
        (keys: Set<string>) => {
            if (keys.size === 0) {
                return;
            }

            closeElements(elementsRef.current.filter((element) => keys.has(element.key)));
            setElements((elements) => syncElements(elements.filter((element) => !keys.has(element.key))));
        },
        [closeElements, syncElements],
    );

    const pushElement = useCallback(
        (item: FDItem) => {
            const currentElements = elementsRef.current;

            const parentElement = item.parentKey
                ? currentElements.find((element) => element.key === item.parentKey)
                : null;

            const resolvedItem: FDItem = {
                ...item,
                parentKey: parentElement ? parentElement.key : null,
                rootKey: parentElement ? (parentElement.rootKey ?? parentElement.key) : item.key,
                targetElement: item.targetElement ?? null,
            };

            const ancestorKeys = resolveAncestorKeys(resolvedItem.parentKey, currentElements);

            const closeKeys = new Set(
                currentElements.filter((element) => !ancestorKeys.has(element.key)).map((element) => element.key),
            );

            closeElements(currentElements.filter((element) => closeKeys.has(element.key)));

            setElements((elements) => {
                return syncElements([
                    resolvedItem,
                    ...elements.filter((element) => element.key !== item.key && !closeKeys.has(element.key)),
                ]);
            });

            return item.key;
        },
        [closeElements, syncElements],
    );

    const updateElement = useCallback(
        (id: string, item: Partial<FDItem>) => {
            setElements((elements) => {
                return syncElements(elements.map((el): FDItem => (el.key !== id ? el : { ...el, ...item })));
            });
        },
        [syncElements],
    );

    const updateObservedPosition = useCallback(
        (id: string, observedRect: FDObserverRect) => {
            setElements((elements) => {
                return syncElements(
                    elements.map((el): FDItem => (el.key !== id ? el : { ...el, observedRect: observedRect })),
                );
            });
        },
        [syncElements],
    );

    const deleteElement = useCallback(
        (id: string) => {
            setElements((elements) => {
                const descendantKeys = resolveDescendantKeys(id, elements);

                return syncElements(elements.filter((el) => el.key !== id && !descendantKeys.has(el.key)));
            });
        },
        [syncElements],
    );

    const isTargetWithinItem = useCallback((item: FDItem, target: Node) => {
        return !!contentElementsRef.current.get(item.key)?.contains(target) || !!item.targetElement?.contains(target);
    }, []);

    useEffect(() => {
        elementsRef.current = elements;
    }, [elements]);

    useEffect(() => {
        const clickHandler = (e: MouseEvent) => {
            if (!(e.target instanceof Node)) {
                return;
            }

            const currentElements = elementsRef.current;

            if (currentElements.length === 0) {
                return;
            }

            const containingItem = currentElements.find((item) => isTargetWithinItem(item, e.target as Node));

            if (!containingItem) {
                closeElementKeys(new Set(currentElements.map((element) => element.key)));
                return;
            }

            closeElementKeys(resolveDescendantKeys(containingItem.key, currentElements));
        };

        document.addEventListener('click', clickHandler, true);

        return () => {
            document.removeEventListener('click', clickHandler, true);
        };
    }, [closeElementKeys, isTargetWithinItem]);

    useEffect(() => {
        const keydownHandler = (e: KeyboardEvent) => {
            if (e.key !== 'Escape') {
                return;
            }

            const currentElements = elementsRef.current;

            if (currentElements.length === 0) {
                return;
            }

            e.preventDefault();
            e.stopPropagation();

            closeElementKeys(new Set([currentElements[0].key]));
        };

        document.addEventListener('keydown', keydownHandler, true);

        return () => {
            document.removeEventListener('keydown', keydownHandler, true);
        };
    }, [closeElementKeys]);

    const renderedElements = useMemo(() => {
        return elements.slice().reverse();
    }, [elements]);

    return (
        <Provider value={{ elements, pushElement, updateElement, updateObservedPosition, deleteElement }}>
            {children}

            <div className="frame-director">
                {renderedElements.map((element) => (
                    <ItemProvider
                        key={element.key}
                        value={{ itemKey: element.key, rootKey: element.rootKey ?? element.key }}>
                        <div
                            ref={(node) => {
                                if (node) {
                                    contentElementsRef.current.set(element.key, node);
                                    return;
                                }

                                contentElementsRef.current.delete(element.key);
                            }}
                            className="fd-content"
                            style={{ left: `${element.offset?.x}px`, top: `${element.offset?.y}px` }}>
                            {element.element(element)}
                        </div>
                    </ItemProvider>
                ))}
            </div>
        </Provider>
    );
};

export { FrameDirectorProvider, frameDirectorContext };
