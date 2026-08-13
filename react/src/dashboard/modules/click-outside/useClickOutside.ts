import { MouseEventHandler, RefObject, useCallback, useEffect, useState } from 'react';

export default function useClickOutside({
    targetRef,
    onClickOutside,
    bindDelay = 50,
    disabled = false,
}: {
    targetRef: RefObject<HTMLElement | null>;
    onClickOutside: MouseEventHandler;
    bindDelay?: number;
    disabled?: boolean;
}) {
    const [body] = useState(document.querySelector('body'));
    const [bindDelayValue] = useState(bindDelay);

    const clickHandler = useCallback(
        (e: globalThis.MouseEvent) => {
            let targetElement = e.target as Node | null;

            do {
                if (targetElement === targetRef.current) {
                    return;
                }

                targetElement = targetElement.parentNode;
            } while (targetElement);

            if (typeof onClickOutside === 'function') {
                onClickOutside(e as never);
                return;
            }

            console.error("Please provide a valid 'onClickOutside' prop to 'ClickOutside' component!");
        },
        [onClickOutside, targetRef],
    );

    useEffect(() => {
        if (disabled) {
            return;
        }

        const timeoutId = bindDelayValue
            ? window.setTimeout(() => body.addEventListener('click', clickHandler, false), bindDelayValue)
            : null;

        if (!bindDelayValue) {
            body.addEventListener('click', clickHandler, false);
        }

        return () => {
            if (timeoutId !== null) {
                window.clearTimeout(timeoutId);
            }

            body.removeEventListener('click', clickHandler, false);
        };
    }, [body, clickHandler, bindDelayValue, disabled]);
}
