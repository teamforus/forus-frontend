import React, { useEffect, useRef } from 'react';
import { FDTargetContainerProps } from '../components/FDTargetClick';
import useFDOffsetMenu from '../hooks/useFDOffsetMenu';
import classNames from 'classnames';

export default function FDTargetContainerSelect(props: FDTargetContainerProps) {
    const { item, className, content, onContentReady, onPositionChange } = props;
    const { ref, activePosition, isPositionReady } = useFDOffsetMenu(item);
    const contentReadyNotified = useRef(false);

    useEffect(() => {
        if (activePosition?.position) {
            onPositionChange?.(activePosition.position);
        }
    }, [activePosition?.position, onPositionChange]);

    useEffect(() => {
        if (!isPositionReady || !onContentReady || contentReadyNotified.current) {
            return;
        }

        contentReadyNotified.current = true;
        onContentReady();
    }, [isPositionReady, onContentReady]);

    return (
        <div
            className="form"
            style={{
                pointerEvents: isPositionReady ? undefined : 'none',
                visibility: isPositionReady ? undefined : 'hidden',
            }}
            onClick={(e) => e.stopPropagation()}>
            <div
                className={classNames(
                    'select-control-menu',
                    className,
                    activePosition?.position === 'top' && 'select-control-menu-top',
                    activePosition?.position === 'bottom' && 'select-control-menu-bottom',
                )}
                ref={ref}>
                {typeof content === 'function' ? content(props) : content}
            </div>
        </div>
    );
}
