import React, { useLayoutEffect, useRef } from 'react';
import classNames from 'classnames';
import { FDTargetContainerProps } from '../../../modules/frame_director/components/FDTargetClick';
import useFDOffsetMenu from '../../../modules/frame_director/hooks/useFDOffsetMenu';

const getTabbableElements = (element: HTMLElement): Array<HTMLElement> => {
    return Array.from(
        element.querySelectorAll<HTMLElement>('a[href], button, input, select, textarea, [tabindex]'),
    ).filter(
        (item) =>
            item.tabIndex >= 0 &&
            !item.matches(':disabled') &&
            item.getClientRects().length > 0 &&
            window.getComputedStyle(item).visibility !== 'hidden',
    );
};

export default function HeaderDropdown(props: FDTargetContainerProps) {
    const focused = useRef(false);
    const { ref, isPositionReady } = useFDOffsetMenu(props.item);
    const target = props.item.targetElement;

    useLayoutEffect(() => {
        if (!isPositionReady || focused.current || !ref.current) {
            return;
        }

        (getTabbableElements(ref.current)[0] || ref.current).focus({ preventScroll: true });
        focused.current = true;
    }, [isPositionReady, ref]);

    useLayoutEffect(() => {
        const panel = ref.current;

        return () => {
            if (
                target?.isConnected &&
                (panel?.contains(document.activeElement) || document.activeElement === document.body)
            ) {
                target.focus({ preventScroll: true });
            }
        };
    }, [ref, target]);

    return (
        <div
            ref={ref}
            tabIndex={-1}
            className={classNames('header-dropdown', isPositionReady && 'ready')}
            style={
                {
                    '--header-dropdown-top': `${(props.item.observedRect?.y || 0) + (props.item.observedRect?.height || 0)}px`,
                } as React.CSSProperties
            }
            onClick={(event) => event.stopPropagation()}
            onKeyDown={(event) => {
                if (event.key !== 'Tab') {
                    return;
                }

                event.preventDefault();
                event.stopPropagation();

                const items = getTabbableElements(event.currentTarget);
                const index = items.indexOf(document.activeElement as HTMLElement);
                const nextItem = event.shiftKey ? items[index - 1] || items.at(-1) : items[index + 1] || items[0];

                (nextItem || event.currentTarget).focus();
            }}>
            {typeof props.content === 'function' ? props.content(props) : props.content}
        </div>
    );
}
