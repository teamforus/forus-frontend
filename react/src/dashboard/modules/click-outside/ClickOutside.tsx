import React, { HTMLAttributes, MouseEventHandler, RefObject, useRef } from 'react';

import useClickOutside from './useClickOutside';

type ClickOutsideProps = HTMLAttributes<HTMLDivElement> & {
    onClickOutside: MouseEventHandler;
    bindDelay?: number;
    elRef?: RefObject<HTMLDivElement | null>;
    targetRef?: RefObject<HTMLElement | null>;
    disabled?: boolean;
    attr?: HTMLAttributes<HTMLDivElement>;
};

export default function ClickOutside({
    onClickOutside,
    children,
    bindDelay = 50,
    elRef = null,
    targetRef = null,
    disabled = false,
    attr = null,
    ...wrapperProps
}: ClickOutsideProps) {
    const ref = useRef<HTMLDivElement>(null);
    const resolvedTargetRef = targetRef || elRef || ref;

    useClickOutside({
        targetRef: resolvedTargetRef,
        onClickOutside,
        bindDelay,
        disabled,
    });

    if (targetRef) {
        return children || null;
    }

    return (
        <div {...wrapperProps} {...attr} ref={elRef || ref}>
            {children}
        </div>
    );
}
